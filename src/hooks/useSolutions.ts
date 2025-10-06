import { useState, useEffect } from "react";
import type { Solution} from "@/types/mandala"
import { solutionService } from "@/services/solutionService";

export default function useSolutions(projectId: string) {
    const [solutions, setSolutions] = useState<Solution[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reload = async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);

        try {
            const data = await solutionService.getAllSolutions(projectId);
            setSolutions(Array.isArray(data) ? data : []);
        } catch (err: any) {
            setError(err.message ?? "Error cargando soluciones");
            setSolutions([]);
        } finally {
            setLoading(false);
        }
    };

    const create = async (body: Omit<Solution, "id">) => {
        if (!projectId) return;
        setLoading(true);
        setError(null);

        try {
            const newSolution = await solutionService.createSolution(projectId, body);
            setSolutions((prev) => [newSolution, ...prev]);
            return newSolution;
        } catch (err: any) {
            setError(err.message ?? "Error creando solución");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, [projectId]);

    return { solutions, loading, error, reload, create, setSolutions };
}
