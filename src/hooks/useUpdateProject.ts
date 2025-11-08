import { useState } from "react";
import { updateProject } from "@/services/projectService";
import { Project } from "@/types/mandala";

const useUpdateProject = (onSuccess?: (updated: Project) => void) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const update = async (id: string, data: { name: string; description?: string, icon: string, iconColor?: string }) => {
        setLoading(true);
        setError(null);
        try {
            const updated = await updateProject(id, data);
            if (onSuccess) onSuccess(updated);
            return updated;
        } catch (e) {
            setError("Error al actualizar el proyecto");
            throw e;
        } finally {
            setLoading(false);
        }
    };

    return { update, loading, error };
};

export default useUpdateProject;
