import { useState, useEffect } from "react";
import type { Solution } from "@/types/mandala";
import {getAllSolutions, createSolution} from "@/services/solutionService";
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
            const dbSolutions = await getAllSolutions(projectId);
            console.log("🔍 dbSolutions", dbSolutions);
            console.log("✅ Normalized", dbSolutions.map(normalizeSolution));

            setSolutions(dbSolutions.map(normalizeSolution));
        } catch (err) {
            console.error("Error cargando soluciones:", err);
            const message = err instanceof Error ? err.message : "Error cargando soluciones";
            setError(message);
            setSolutions([]);
        } finally {
            setLoadingPage(false);
        }
    };


    const createSolutions = async (body: Omit<Solution, "id">): Promise<Solution | undefined> => {
        if (!projectId) return;
        setCreating(true);
        setError(null);

        try {
            const newSolution = await createSolution(projectId, body);
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
        createSolutions,
        setSolutions,
    };
}
