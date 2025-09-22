import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {getFiles, getFilesWithSelection, deleteFile, createFiles, updateFileSelections, FileScope} from "@/services/filesService.ts";
import {FileItem} from "@/types/mandala";

export const fileKeys = {
  all: ["files"] as const,
  byScope: (scope: FileScope, id: string) => [...fileKeys.all, scope, id] as const,
};

export function useFiles(scope: FileScope, id: string, withSelection: boolean = false) {
  const queryClient = useQueryClient();

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
      queryClient.invalidateQueries({ queryKey: fileKeys.byScope(scope, id) });
      queryClient.invalidateQueries({ queryKey: [...fileKeys.byScope(scope, id), 'with-selection'] });
    },
  });


  const createFilesMutation = useMutation({
    mutationFn: async (files: FileItem[]) => {
      return await createFiles(scope, id, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.byScope(scope, id) });
      queryClient.invalidateQueries({ queryKey: [...fileKeys.byScope(scope, id), 'with-selection'] });
    },
  });

  const removeFile = async (fileName: string) => {
    return deleteFileMutation.mutateAsync(fileName);
  };

  const updateSelectionsMutation = useMutation({
    mutationFn: async (selections: { fileName: string; selected: boolean }[]) => {
      return await updateFileSelections(scope, id, selections);
    },
    onMutate: async (selections) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: [...fileKeys.byScope(scope, id), 'with-selection'] });
      
      // Snapshot the previous value
      const previousFiles = queryClient.getQueryData([...fileKeys.byScope(scope, id), 'with-selection']);
      
      // Optimistically update the cache
      queryClient.setQueryData([...fileKeys.byScope(scope, id), 'with-selection'], (old: any) => {
        if (!old) return old;
        return old.map((file: any) => {
          const selection = selections.find(s => s.fileName === file.file_name);
          return selection ? { ...file, selected: selection.selected } : file;
        });
      });
      
      return { previousFiles };
    },
    onError: (_err, _selections, context) => {
      // Rollback on error
      if (context?.previousFiles) {
        queryClient.setQueryData([...fileKeys.byScope(scope, id), 'with-selection'], context.previousFiles);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: [...fileKeys.byScope(scope, id), 'with-selection'] });
      
      // Also invalidate all related file queries to ensure consistency
      queryClient.invalidateQueries({ 
        predicate: (query) => 
          query.queryKey.includes('files') && 
          query.queryKey.includes('with-selection')
      });
    },
  });

  const addFiles = async (files: FileItem[]) => {
    return createFilesMutation.mutateAsync(files);
  };

  const updateSelections = async (selections: { fileName: string; selected: boolean }[]) => {
    return updateSelectionsMutation.mutateAsync(selections);
  };

  return {
    files: Array.isArray(files) ? files : [],
    isLoading,
    error,
    removeFile,
    addFiles,
    updateSelections,
    refetch,
    isDeleting: deleteFileMutation.isPending,
    isCreating: createFilesMutation.isPending,
    isUpdatingSelections: updateSelectionsMutation.isPending,
  };
}