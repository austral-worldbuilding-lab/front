import { useState } from "react";
import { deleteProject } from "@/services/projectService";

interface UseDeleteProjectReturn {
  deleteProjectById: (projectId: string) => Promise<boolean>;
  loading: boolean;
  error: string | null;
}

export const useDeleteProject = (onSuccess?: () => void): UseDeleteProjectReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteProjectById = async (projectId: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      await deleteProject(projectId);
      if (onSuccess) {
        onSuccess();
      }
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al eliminar el proyecto. Intentá de nuevo más tarde.";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteProjectById,
    loading,
    error,
  };
};

