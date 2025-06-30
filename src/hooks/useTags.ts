import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getTags,
  createTag as createTagService,
} from "@/services/projectService.ts";
import { BackendTag } from "@/types/mandala";
import {deleteTagService} from "../services/projectService";
import { filterKeys } from "./useGetFilters";

export const tagKeys = {
  all: ["tags"] as const,
  byProject: (projectId: string) => [...tagKeys.all, projectId] as const,
};

export interface TagFormat {
  id: string;
  label: string;
  value: string;
  color: string;
}

export function useTags(projectId: string) {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: tagKeys.byProject(projectId),
    queryFn: async () => {
      if (!projectId) return [];

      const tagsFromBackend: BackendTag[] = await getTags(projectId);
      return tagsFromBackend.map((tag) => ({
        id: tag.id,
        label: tag.name,
        value: tag.name.toLowerCase(),
        color: tag.color,
      }));
    },
    enabled: !!projectId,
  });

  const tags = Array.isArray(data) ? (data as TagFormat[]) : [];

  const createTagMutation = useMutation({
    mutationFn: async ({ name, color }: { name: string; color: string }) => {
      return await createTagService(projectId, { name, color });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: filterKeys.all });
    },
  });

  const createTag = async (
    name: string,
    color: string
  ): Promise<BackendTag> => {
    return createTagMutation.mutateAsync({ name, color });
  };

  const deleteTagMutation = useMutation({
    mutationFn: async (tagId: string) => {
      return await deleteTagService(projectId, tagId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tagKeys.byProject(projectId) });
      queryClient.invalidateQueries({ queryKey: filterKeys.all });
    },
  });

  const deleteTag = async (tagId: string) => {
    return deleteTagMutation.mutateAsync(tagId);
  };

  return {
    tags,
    isLoading,
    error,
    createTag,
    deleteTag,
    refetch,
  };
}
