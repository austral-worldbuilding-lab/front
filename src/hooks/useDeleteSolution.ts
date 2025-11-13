import { useState } from "react";
import { deleteSolution } from "@/services/solutionService";

export default function useDeleteSolution() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const deleteSolutionById = async (solutionId: string) => {
        setLoading(true);
        setError(null);

        try {
            await deleteSolution(solutionId);
        } catch (err: any) {
            console.error("Error eliminando solución:", err);
            setError(err?.response?.data?.message || "No se pudo eliminar la solución.");
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return { deleteSolutionById, loading, error };
}
