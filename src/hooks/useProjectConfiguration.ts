import { useQuery } from "@tanstack/react-query";
import { getProjectConfiguration } from "@/services/projectService";
import { ProjectConfiguration, DimensionDto } from "@/types/mandala";
import { Sectors, Levels } from "@/constants/mandala";

export const projectConfigurationKeys = {
  all: ["project-configuration"] as const,
  byId: (projectId: string) => [...projectConfigurationKeys.all, projectId] as const,
};

const getDefaultProjectConfiguration = (): ProjectConfiguration => {
  const dimensions: DimensionDto[] = Sectors.map((sector) => ({
    name: sector.name,
    color: sector.color,
  }));

  const scales: string[] = Levels.map((level) => level.name);

  return {
    dimensions,
    scales,
  };
};

export function useProjectConfiguration(projectId: string) {
  const {
    data: configuration,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: projectConfigurationKeys.byId(projectId),
    queryFn: async () => {
      if (!projectId) throw new Error("Project ID is required");
      try {
        return await getProjectConfiguration(projectId);
      } catch {
        return getDefaultProjectConfiguration();
      }
    },
    enabled: !!projectId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  return {
    configuration: configuration || getDefaultProjectConfiguration(),
    isLoading,
    error,
    refetch,
  };
}

export { getDefaultProjectConfiguration };
