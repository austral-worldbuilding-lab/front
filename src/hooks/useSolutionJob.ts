import { useState, useEffect, useRef } from "react";
import { startSolutionJob, getSolutionJobStatus } from "@/services/solutionService";

export function useSolutionJob(projectId: string) {
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<"none" | "waiting" | "active" | "completed" | "failed">("none");
    const [progress, setProgress] = useState<number>(0);
    const [solutionUrl, setSolutionUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startJob = async (selectedProvocations: string[]) => {
        try {
            const { jobId } = await startSolutionJob(projectId, selectedProvocations);
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

    return {
        jobId,
        status,
        progress,
        solutionUrl,
        error,
        startJob,
    };
}
