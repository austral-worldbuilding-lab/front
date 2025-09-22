import { useQuery } from "@tanstack/react-query";
import { FilterSection } from "@/types/mandala";
import { getFilters } from "@/services/mandalaService.ts";
import { tagKeys } from "./useTags";
import { getTags } from "@/services/projectService.ts";

interface TagData {
  label: string;
  value: string;
  color: string;
}

export const filterKeys = {
  all: ["filters"] as const,
  byMandala: (mandalaId: string) => [...filterKeys.all, mandalaId] as const,
};

export function useGetFilters(mandalaId: string, projectId: string) {
  const { data: tagsFromBackend } = useQuery({
    queryKey: tagKeys.byProject(projectId),
    queryFn: async () => {
      if (!projectId) return [];
      const backendTags = await getTags(projectId);
      return backendTags.map((tag) => ({
        label: tag.name,
        value: tag.name.toLowerCase(),
        color: tag.color,
      }));
    },
    enabled: !!projectId,
  });

  const tagsData = tagsFromBackend as TagData[] | undefined;

  const { data: filters = [], isLoading } = useQuery({
    queryKey: filterKeys.byMandala(mandalaId),
    queryFn: async () => {
      const rawFilters: FilterSection[] = await getFilters(mandalaId);

      let finalFilters = rawFilters;

      if (!rawFilters.some((f) => f.sectionName === "Tags")) {
        finalFilters = [
          ...rawFilters,
          {
            sectionName: "Tags",
            type: "multiple",
            options: tagsData && tagsData.length > 0 
              ? tagsData.map((tag: TagData) => ({
                  label: tag.label,
                  color: tag.color,
                }))
              : [],
          },
        ];
      }

      return finalFilters;
    },
    enabled: !!mandalaId && !!projectId,
  });

  return { filters, isLoading };
}
