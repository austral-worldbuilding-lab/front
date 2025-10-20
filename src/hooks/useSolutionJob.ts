import { useState, useEffect, useRef } from "react";
import {
    startSolutionJob,
    getSolutionJobStatus,
    getCachedSolutions
} from "@/services/solutionService";
export function useSolutionJob(projectId: string, onSolutionsReady?: () => void) {
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<"none" | "waiting" | "active" | "completed" | "failed">("none");
    const [progress, setProgress] = useState<number>(0);
    const [solutionUrl, setSolutionUrl] = useState<string | null>(null);
    const [cachedSolutions, setCachedSolutions] = useState<any[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const fetchCachedSolutions = async () => {
        try {
            const data = await getCachedSolutions(projectId);
            if (data?.length > 0) {
                setCachedSolutions(data);
                setStatus("completed");
                if (onSolutionsReady) onSolutionsReady(); // 🔹 Notificar al padre
            }
        } catch (err) {
            console.error("Error obteniendo soluciones cacheadas:", err);
        }
    };

    const startJob = async () => {
        if (cachedSolutions && cachedSolutions.length > 0) return;
        try {
            const { jobId } = await startSolutionJob(projectId);
            setJobId(jobId);
            setStatus("waiting");
            setProgress(0);
        } catch (err: any) {
            console.error("Error al iniciar job de soluciones:", err);
            setError(err.response?.data?.message || "Error al iniciar la generación de soluciones");
        }
    };

    useEffect(() => {
        if (!jobId) return;

        const fetchStatus = async () => {
            try {
                const data = await getSolutionJobStatus(projectId);

                setStatus(data.status);
                setProgress(data.progress || 0);

                if (data.status === "completed") {
                    setSolutionUrl(data.solutionUrl || null);
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    await fetchCachedSolutions();
                }
            } catch (err) {
                console.error("Error consultando estado del job de soluciones:", err);
                if (intervalRef.current) clearInterval(intervalRef.current);
                setError("Error consultando estado del job");
            }
        };

        intervalRef.current = setInterval(fetchStatus, 4000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [jobId, projectId]);

    useEffect(() => {
        fetchCachedSolutions();
    }, [projectId]);

    return {
        jobId,
        status,
        progress,
        solutionUrl,
        cachedSolutions,
        error,
        startJob,
        refreshCache: fetchCachedSolutions,
    };
}
