import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProjectFiles, deleteFile, createProjectFiles, ProjectFile } from "@/services/filesService";

export const fileKeys = {
  all: ["files"] as const,
  byProject: (projectId: string) => [...fileKeys.all, projectId] as const,
};

export function useProjectFiles(projectId: string) {
  const queryClient = useQueryClient();

  const {
    data: files = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: fileKeys.byProject(projectId),
    queryFn: async () => {
      if (!projectId) return [];
      return await getProjectFiles(projectId);
    },
    enabled: !!projectId,
  });

  const deleteFileMutation = useMutation({
    mutationFn: async (fileName: string) => {
      return await deleteFile(projectId, fileName);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.byProject(projectId) });
    },
  });

  const createFilesMutation = useMutation({
    mutationFn: async (files: ProjectFile[]) => {
      return await createProjectFiles(projectId, files);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: fileKeys.byProject(projectId) });
    },
  });

  const removeFile = async (fileName: string) => {
    return deleteFileMutation.mutateAsync(fileName);
  };

  const addFiles = async (files: ProjectFile[]) => {
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