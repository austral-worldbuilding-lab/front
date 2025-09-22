import { useState, useEffect } from "react";
import { useCurrentUserRole } from "./useCurrentUserRole";
import axiosInstance from "@/lib/axios";

export function useProjectAccess(projectId: string) {
  const { userRole, loading: roleLoading } = useCurrentUserRole(projectId);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    const checkAccess = async () => {
      if (!projectId) {
        setHasAccess(false);
        return;
      }

      if (userRole !== null) {
        setHasAccess(true);
        return;
      }

      setChecking(true);
      try {
        await axiosInstance.get(`/project/${projectId}`);
        setHasAccess(true);
      } catch {
        setHasAccess(false);
      } finally {
        setChecking(false);
      }
    };

    if (!roleLoading) {
      checkAccess();
    }
  }, [projectId, userRole, roleLoading]);

  const loading = roleLoading || checking;
  
  return {
    hasAccess,
    userRole,
    loading,
    isUnauthorized: !loading && hasAccess === false,
  };
}
