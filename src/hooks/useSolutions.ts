import { useState, useEffect } from "react";
import type { Solution } from "@/types/mandala";
import { solutionService, getCachedSolutions } from "@/services/solutionService";
import { normalizeSolution } from "@/utils/normalizeSolution";

export default function useSolutions(projectId: string) {
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [loadingPage, setLoadingPage] = useState(false);
    const [creating, setCreating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reload = async (): Promise<void> => {
        if (!projectId) return;
        setLoadingPage(true);
        setError(null);

        try {
            const [dbSolutions, cached] = await Promise.allSettled([
                solutionService.getAllSolutions(projectId),
                getCachedSolutions(projectId),
            ]);

            const dbData: Solution[] =
                dbSolutions.status === "fulfilled"
                    ? dbSolutions.value.map(normalizeSolution)
                    : [];

            const cacheData: Solution[] =
                cached.status === "fulfilled"
                    ? cached.value.map(normalizeSolution)
                    : [];

            const merged: Solution[] = [...dbData];

            cacheData.forEach((item: Solution) => {
                const exists = merged.some((s) => s.title === item.title);
                if (!exists) merged.push(item);
            });

            setSolutions(merged);
        } catch (err) {
            console.error("Error cargando soluciones:", err);
            const message =
                err instanceof Error
                    ? err.message
                    : "Error cargando soluciones";
            setError(message);
            setSolutions([]);
        } finally {
            setLoadingPage(false);
        }
    };

    const createSolution = async (body: Omit<Solution, "id">): Promise<Solution | undefined> => {
        if (!projectId) return;
        setCreating(true);
        setError(null);

        try {
            const newSolution = await solutionService.createSolution(projectId, body);
            const normalized = normalizeSolution(newSolution);
            setSolutions((prev) => [normalized, ...prev]);
            return normalized;
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : "Error creando solución";
            setError(message);
            throw err;
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        reload();
    }, [projectId]);

    return {
        solutions,
        loadingPage,
        creating,
        error,
        reload,
        createSolution,
        setSolutions,
    };
}
