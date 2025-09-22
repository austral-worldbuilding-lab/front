import { useState, useEffect } from "react";
import { getProject } from "@/services/projectService";
import { Project } from "@/types/mandala";

export default function useProject(projectId: string) {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchProject = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getProject(projectId);
            setProject(data);
        } catch (e) {
            setError("Error cargando el proyecto");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (projectId) fetchProject();
    }, [projectId]);

    return { project, setProject, loading, error, fetchProject };
}
