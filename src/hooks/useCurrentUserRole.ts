import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useProjectUsers } from "./useProjectUsers";
import { Role } from "@/services/invitationService";

export function useCurrentUserRole(projectId: string) {
  const { user } = useAuthContext();
  const { users, loading } = useProjectUsers(projectId);
  const [userRole, setUserRole] = useState<Role | null>(null);

  useEffect(() => {
    if (!loading && user && users) {
      const currentUser = users.find(u => u.id === user.uid);
      setUserRole(currentUser?.role as Role || null);
    }
  }, [loading, user, users]);

  const canEdit = userRole && ['dueño', 'facilitador', 'worldbuilder'].includes(userRole);
  const isViewer = userRole === 'lector';

  return {
    userRole,
    canEdit,
    isViewer,
    loading,
  };
}
