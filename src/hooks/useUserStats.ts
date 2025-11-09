import { useQuery } from "@tanstack/react-query";
import { getUserStats } from "@/services/userService";
import { userKeys } from "./useCurrentUser";

export function useUserStats() {
  return useQuery({
    queryKey: [...userKeys.all, 'stats'],
    queryFn: getUserStats,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
  });
}

