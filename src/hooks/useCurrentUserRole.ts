import { useState, useEffect } from "react";
import { useAuthContext } from "@/context/AuthContext";
import { useProjectUsers } from "./useProjectUsers";
import { Role, isEditorRole, isViewerRole } from "@/constants/roles";

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

  const canEdit = userRole ? isEditorRole(userRole) : false;
  const isViewer = userRole ? isViewerRole(userRole) : false;

  return {
    userRole,
    canEdit,
    isViewer,
    loading,
  };
}
