import { useCallback, useEffect, useState } from "react";
import { OrganizationUser } from "@/services/userService";
import { getOrganizationUsers } from "@/services/userService";

export function useOrganizationUsers(organizationId: string) {
  const [users, setUsers] = useState<OrganizationUser[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean>(true);

  const fetchUsers = useCallback(async () => {
    if (!organizationId) {
      setUsers([]);
      return;
    }
    setLoading(true);
    setError(null);
    setHasPermission(true);
    try {
      const data = await getOrganizationUsers(organizationId);
      setUsers(data);
    } catch (e: unknown) {
      const error = e as { response?: { status?: number }; message?: string };
      if (error?.response?.status === 403) {
        setHasPermission(false);
        setError("Sin permisos de organización");
      } else {
        setError(error?.message ?? "Error al cargar los usuarios de la organización");
      }
    } finally {
      setLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return { users, loading, error, hasPermission, refetch: fetchUsers };
}

export default useOrganizationUsers;
