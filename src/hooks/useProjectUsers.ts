import { useCallback, useEffect, useState } from "react";
import { ProjectUser } from "@/services/userService";
import { getProjectUsers } from "@/services/userService";

export function useProjectUsers(projectId: string) {
  const [users, setUsers] = useState<ProjectUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    if (!projectId) {
      setUsers([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getProjectUsers(projectId);
      setUsers(data);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar los usuarios del proyecto");
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, refetch: fetchUsers };
}

export default useProjectUsers; 