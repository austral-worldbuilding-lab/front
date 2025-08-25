import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {getFiles, deleteFile, createFiles, FileScope} from "@/services/filesService.ts";
import {FileItem} from "@/types/mandala";

export const fileKeys = {
  all: ["files"] as const,
  byScope: (scope: FileScope, id: string) => [...fileKeys.all, scope, id] as const,
};

export function useFiles(scope: FileScope, id: string) {
  const queryClient = useQueryClient();

  const {
    data: files = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: fileKeys.byScope(scope, id),
    queryFn: async () => {
      if (!id) return [];
      return await getFiles(scope, id);
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
    },
  });


  const createFilesMutation = useMutation({
    mutationFn: async (files: FileItem[]) => {
      return await createFiles(scope, id, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.byScope(scope, id) });
    },
  });

  const removeFile = async (fileName: string) => {
    return deleteFileMutation.mutateAsync(fileName);
  };

  const addFiles = async (files: FileItem[]) => {
    return createFilesMutation.mutateAsync(files);
  };

  return {
    files: Array.isArray(files) ? files : [],
    isLoading,
    error,
    removeFile,
    addFiles,
    refetch,
    isDeleting: deleteFileMutation.isPending,
    isCreating: createFilesMutation.isPending,
  };
}