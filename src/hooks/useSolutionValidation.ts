import { useEffect, useState } from "react";
// import { getSolutionValidation } from "@/services/solutionService";

export function useSolutionValidation(projectId: string) {
    const [canGenerate, setCanGenerate] = useState<boolean | null>(null);
    const [reason, setReason] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchValidation = async () => {
        if (!projectId) return;
        setLoading(true);
        setError(null);

        try {
            // const res = await getSolutionValidation(projectId);
            setCanGenerate(true);
            setReason(null);
        } catch (err: any) {
            console.error("Error validando generación de soluciones:", err);
            setError(err.response?.data?.message || "Error consultando validación");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchValidation();
    }, [projectId]);

    return {
        canGenerate,
        reason,
        loading,
        error,
        refresh: fetchValidation,
    };
}
