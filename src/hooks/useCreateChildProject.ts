import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createChildProject } from "@/services/projectService";
import { useAuth } from "@/hooks/useAuth";

export function useCreateChildProject(
    organizationId?: string,
    projectId?: string,
    onSuccess?: () => void
) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();
    const { user } = useAuth();

    const handleCreateChildProject = async (data: {
        name: string;
        description?: string;
        icon: string;
        dimensions?: { name: string; color: string }[];
        scales?: string[];
        iconColor?: string;
    }) => {
        if (!organizationId || !projectId) return;
        setLoading(true);
        setError(null);

        try {
            const newProject = await createChildProject(projectId, {
                name: data.name,
                description: data.description,
                organizationId,
                icon: data.icon,
                dimensions: data.dimensions,
                scales: data.scales,
                userId: user?.uid || "",
                iconColor: data.iconColor,
            });

            onSuccess?.();
            navigate(`/app/organization/${organizationId}/projects/${newProject.id}`);
        } catch (err) {
            setError(
                err instanceof Error
                    ? err.message
                    : "No se pudo crear el subproyecto. Intentalo más tarde."
            );
        } finally {
            setLoading(false);
        }
    };

    return { handleCreateChildProject, loading, error };
}
