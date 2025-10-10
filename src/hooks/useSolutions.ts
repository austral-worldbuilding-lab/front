import { useState, useEffect } from "react";
import type { Solution } from "@/types/mandala";
import { solutionService } from "@/services/solutionService";

export default function useSolutions(projectId: string) {
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [loadingPage, setLoadingPage] = useState(false); // loading de toda la página
    const [creating, setCreating] = useState(false); // loading del botón
    const [error, setError] = useState<string | null>(null);

    const reload = async () => {
        if (!projectId) return;
        setLoadingPage(true);
        setError(null);

        try {
            const data = await solutionService.getAllSolutions(projectId);
            setSolutions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message ?? "Error cargando soluciones");
            setSolutions([]);
        } finally {
            setLoadingPage(false);
        }
    };

    const createSolution = async (body: Omit<Solution, "id">) => {
        if (!projectId) return;
        setCreating(true);
        setError(null);

        try {
            const newSolution = await solutionService.createSolution(projectId, body);
            setSolutions((prev) => [newSolution, ...prev]);
            return newSolution;
        } catch (err: any) {
            setError(err.message ?? "Error creando solución");
            throw err;
        } finally {
            setCreating(false);
        }
    };

    useEffect(() => {
        reload();
    }, [projectId]);

    return { solutions, loadingPage, creating, error, reload, createSolution, setSolutions };
}
