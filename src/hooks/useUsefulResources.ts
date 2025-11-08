import { useQuery } from "@tanstack/react-query";
import { getUsefulResources } from "@/services/usefulResourcesService";
import { UsefulResource } from "@/types/mandala";

export const usefulResourcesKeys = {
  all: ["useful-resources"] as const,
};

export function useUsefulResources() {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = useQuery<UsefulResource[]>({
    queryKey: usefulResourcesKeys.all,
    queryFn: async () => {
      return await getUsefulResources();
    },
  });

  return {
    resources: data || [],
    isLoading,
    error,
    refetch,
  };
}

