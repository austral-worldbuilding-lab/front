import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {getFiles, getFilesWithSelection, deleteFile, createFiles, updateFileSelections, FileScope} from "@/services/filesService.ts";
import {FileItem} from "@/types/mandala";

export const fileKeys = {
  all: ["files"] as const,
  byScope: (scope: FileScope, id: string) => [...fileKeys.all, scope, id] as const,
};

export function useFiles(scope: FileScope, id: string, withSelection: boolean = false) {
  const queryClient = useQueryClient();

  const invalidateRelatedQueries = () => {
    queryClient.invalidateQueries({ queryKey: fileKeys.byScope(scope, id) });
    queryClient.invalidateQueries({ queryKey: [...fileKeys.byScope(scope, id), 'with-selection'] });
    
    if (scope === 'mandala') {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey.includes('files') && 
          (query.queryKey.includes('project') || query.queryKey.includes('organization')) && 
          (query.queryKey.includes('with-selection') || !query.queryKey.includes('with-selection'))
      });
    } else if (scope === 'project') {
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey.includes('files') && 
          query.queryKey.includes('organization') && 
          (query.queryKey.includes('with-selection') || !query.queryKey.includes('with-selection'))
      });
    }
  };

  const {
    data: files = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: withSelection ? [...fileKeys.byScope(scope, id), 'with-selection'] : fileKeys.byScope(scope, id),
    queryFn: async () => {
      if (!id) return [];
      return withSelection ? await getFilesWithSelection(scope, id) : await getFiles(scope, id);
    },
    enabled: !!id,
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileName: string) => {
      if (!id) throw new Error("No se puede borrar archivo sin ID");
      return await deleteFile(scope, id, fileName);
    },
    onSuccess: () => {
      invalidateRelatedQueries();
    },
  });


  const createFilesMutation = useMutation({
    mutationFn: async (files: Omit<FileItem, 'selected'>[]) => {
      return await createFiles(scope, id, files);
    },
    onSuccess: () => {
      invalidateRelatedQueries();
    },
  });

  const removeFile = async (fileName: string) => {
    return deleteFileMutation.mutateAsync(fileName);
  };

  const updateSelectionsMutation = useMutation({
    mutationFn: async (selections: { fileName: string; selected: boolean; sourceScope: string }[]) => {
      return await updateFileSelections(scope, id, selections);
    },
    onMutate: async (selections) => {
      await queryClient.cancelQueries({ queryKey: [...fileKeys.byScope(scope, id), 'with-selection'] });

      const previousFiles = queryClient.getQueryData<FileItem[]>([...fileKeys.byScope(scope, id), 'with-selection']);

        queryClient.setQueryData([...fileKeys.byScope(scope, id), 'with-selection'], (old: FileItem[] | undefined) => {
          if (!old) return old;
          return old.map((file: FileItem) => {
            const fileSourceScope = file.source_scope === 'organization' ? 'org' : file.source_scope;
            const selection = selections.find(s => 
              s.fileName === file.file_name && 
              s.sourceScope === fileSourceScope
            );
            return selection ? { ...file, selected: selection.selected } : file;
          });
        });
      
      return { previousFiles };
    },
    onError: (_err, _selections, context: { previousFiles?: FileItem[] } | undefined) => {
      if (context?.previousFiles) {
        queryClient.setQueryData([...fileKeys.byScope(scope, id), 'with-selection'], context.previousFiles);
      }
    },
    onSettled: () => {
      invalidateRelatedQueries();
    },
  });

  const addFiles = async (files: Omit<FileItem, 'selected'>[]) => {
    return createFilesMutation.mutateAsync(files);
  };

  const updateSelections = async (selections: { fileName: string; selected: boolean; sourceScope: string }[]) => {
    return updateSelectionsMutation.mutateAsync(selections);
  };

  const selectAllFiles = async (selected: boolean) => {
    if (!Array.isArray(files) || files.length === 0) return;
    
    const selections = files.map(file => ({
      fileName: file.file_name,
      selected: selected,
      sourceScope: file.source_scope === 'organization' ? 'org' : file.source_scope
    }));
    
    return updateSelectionsMutation.mutateAsync(selections);
  };

  const selectedCount = Array.isArray(files) ? files.filter(file => file.selected).length : 0;
  const totalCount = Array.isArray(files) ? files.length : 0;

  return {
    files: Array.isArray(files) ? files : [],
    isLoading,
    error,
    removeFile,
    addFiles,
    updateSelections,
    selectAllFiles,
    selectedCount,
    totalCount,
    refetch,
    isDeleting: deleteFileMutation.isPending,
    isCreating: createFilesMutation.isPending,
    isUpdatingSelections: updateSelectionsMutation.isPending,
  };
}