import { useState, useEffect, useRef } from "react";
import { startSolutionJob, getSolutionJobStatus } from "@/services/solutionService";
import { useAnalytics } from "@/services/analytics";
import { useAuth } from "./useAuth";
import { v4 as uuid } from "uuid";

export function useSolutionJob(projectId: string, onSolutionsReady?: () => void) {
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<"none" | "waiting" | "active" | "completed" | "failed">("none");
    const [progress, setProgress] = useState<number>(0);
    const [solutionUrl, setSolutionUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { trackAiRequest, trackAiResponse, createTimer } = useAnalytics();
    const { backendUser } = useAuth();

    const startJob = async () => {
        const requestId = uuid();
        const timer = createTimer();
        trackAiRequest({
            request_id: requestId,
            user_id: backendUser?.firebaseUid ?? "",
            project_id: projectId,
            request_type: "generate_solutions",
        });
        try {
            const { jobId } = await startSolutionJob(projectId);
            setJobId(jobId);
            setStatus("waiting");
            setProgress(0);
            trackAiResponse({
                request_id: requestId,
                user_id: backendUser?.firebaseUid ?? "",
                project_id: projectId,
                response_type: "solutions",
                success: true,
                latency_ms: timer(),
            });
        } catch (err: any) {
            console.error("Error al iniciar job de soluciones:", err);
            setError(err.response?.data?.message || "Error al iniciar la generación de soluciones");

            trackAiResponse({
                request_id: requestId,
                user_id: backendUser?.firebaseUid ?? "",
                project_id: projectId,
                response_type: "solutions",
                success: false,
                latency_ms: timer(),
            });
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

                    if (onSolutionsReady) onSolutionsReady();
                }

                if (data.status === "failed") {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    setError("La generación de soluciones falló");
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
