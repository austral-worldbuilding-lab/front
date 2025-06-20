import { useCallback, useEffect, useState } from "react";
import { getTags } from "@/services/projectService.ts";
import { Tag } from "@/components/mandala/postits/SelectTags";
import { BackendTag } from "@/types/mandala";
import { createTag as createTagService } from "@/services/projectService.ts";

export function useGetTags(projectId: string) {
  const [tags, setTags] = useState<Tag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTags = useCallback(async () => {
    setIsLoading(true);
    try {
      const tagsFromBackend: BackendTag[] = await getTags(projectId);
      setTags(
        tagsFromBackend.map((tag) => ({
          label: tag.name,
          value: tag.name.toLowerCase(),
          color: tag.color,
        }))
      );
      setError(null);
    } catch (err) {
      setError(err as Error);
      setTags([]);
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    if (!projectId) return;

    fetchTags();
  }, [fetchTags, projectId]);

  const createTag = async (
    name: string,
    color: string
  ): Promise<BackendTag> => {
    try {
      const payload = {
        name,
        color,
      };
      return await createTagService(projectId, payload);
    } finally {
      fetchTags();
    }
  };

  return { tags, isLoading, error, createTag };
}
