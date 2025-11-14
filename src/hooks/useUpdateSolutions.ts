import { useState } from "react";
import { updateSolution } from "@/services/solutionService";
import type { Solution } from "@/types/mandala";

export default function useUpdateSolution() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const updateSolutionById = async (
        solutionId: string,
        data: Partial<Omit<Solution, "id">>
    ): Promise<Solution> => {
        setLoading(true);
        setError(null);

        try {
            const updated = await updateSolution(solutionId, data);
            return updated;
        } catch (err: any) {
            console.error("Error actualizando solución:", err);
            const message = err?.response?.data?.message || "No se pudo actualizar la solución.";
            setError(message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { updateSolutionById, loading, error };
}