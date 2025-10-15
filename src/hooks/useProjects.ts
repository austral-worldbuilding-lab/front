import { useEffect, useState } from "react";
import {Project} from "@/types/mandala";
import {getProjects} from "@/services/projectService.ts";

const useProjects = (organizationId: string, initialPage = 1, initialLimit = 10, rootsOnly = false) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(initialPage);
    const [limit, setLimit] = useState(initialLimit);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                setLoading(true);
                const response = await getProjects(organizationId, page, limit, rootsOnly);
                setProjects(response);
            } catch (error) {
                setError(error instanceof Error ? error : new Error("Error al cargar los proyectos"));
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, [organizationId, page, limit, rootsOnly]);

    return { projects, loading, error, page, setPage, limit, setLimit};
};

export default useProjects;