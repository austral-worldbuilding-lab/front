import { useEffect, useState } from "react";
import { getProject } from "@/services/projectService";
import {Project} from "@/types/mandala";

const useProject = (projectId?: string) => {
    const [project, setProject] = useState<Project | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!projectId) return;

        setLoading(true);
        getProject(projectId)
            .then(setProject)
            .catch(() => setError("Error al cargar el proyecto"))
            .finally(() => setLoading(false));
    }, [projectId]);

    return { project, loading, error };
};

export default useProject;
