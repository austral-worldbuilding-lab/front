import { useState, useEffect, useRef } from "react";
import { EncyclopediaJobStatus, getEncyclopediaJobStatus, startEncyclopediaJob } from "@/services/enciclopediaService.ts";

export function useEncyclopediaJob(projectId: string) {
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("none");
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startJob = async (selectedFiles: string[]) => {
        try {
            const { jobId } = await startEncyclopediaJob(projectId, selectedFiles);
            setJobId(jobId);
            setStatus("waiting");
            setProgress(0);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al iniciar la generación");
        }
    };

    useEffect(() => {
        if (!jobId) return;

        const fetchStatus = async () => {
            try {
                const data: EncyclopediaJobStatus = await getEncyclopediaJobStatus(projectId);
                setStatus(data.status);
                setProgress(data.progress || 0);

                if (["completed", "failed"].includes(data.status)) {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                }
            } catch (err) {
                console.error("Error consultando estado del job:", err);
                if (intervalRef.current) clearInterval(intervalRef.current);
                setError("Error consultando estado del job");
            }
        };

        intervalRef.current = setInterval(fetchStatus, 4000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [jobId, projectId]);

    return { jobId, status, progress, error, startJob };
}
