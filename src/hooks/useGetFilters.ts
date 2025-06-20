import { useState, useEffect } from "react";
import {FilterSection, BackendTag} from "@/types/mandala";
import {getFilters} from "@/services/mandalaService.ts";
import {getTags} from "@/services/projectService.ts";

export function useGetFilters (mandalaId: string, projectId: string) {
  const [filters, setFilters] = useState<FilterSection[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {

    const fetchFilters = async () => {
      setIsLoading(true);
        try {
            const rawFilters: FilterSection[] = await getFilters(mandalaId);
            const tags: BackendTag[] = await getTags(projectId);

            let finalFilters = rawFilters;

            if (tags.length > 0 && !rawFilters.some(f => f.sectionName === "Tags")) {
                finalFilters = [
                    ...rawFilters,
                    {
                        sectionName: "Tags",
                        type: "multiple",
                        options: tags.map((tag) => ({
                            label: tag.name,
                            color: tag.color,
                        })),
                    },
                ];
            }

            setFilters(finalFilters);

        } catch (error) {
            console.error("Error fetching filters:", error);
        }
      setIsLoading(false);
    };

    fetchFilters()
  }, []);

  return { filters, isLoading };
}
