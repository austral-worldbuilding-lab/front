import { useState, useEffect, useRef } from "react";
import { EncyclopediaJobStatus, getEncyclopediaJobStatus, startEncyclopediaJob } from "@/services/enciclopediaService.ts";
import { v4 as uuid } from "uuid";
import { useAnalytics } from "@/services/analytics";
import { useAuth } from "./useAuth";

export function useEncyclopediaJob(projectId: string) {
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("none");
    const [progress, setProgress] = useState<number>(0);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const { trackAiRequest, trackAiResponse, createTimer } = useAnalytics();
    const { backendUser } = useAuth();

    const startJob = async (selectedFiles: string[]) => {
        const requestId = uuid();
        const timer = createTimer();
        trackAiRequest({
          request_id: requestId,
          user_id: backendUser?.firebaseUid ?? "",
          project_id: projectId,
          request_type: "generate_encyclopedia",
        });
        try {
            const { jobId } = await startEncyclopediaJob(projectId, selectedFiles);
            setJobId(jobId);
            setStatus("waiting");
            setProgress(0);
            setError(null);
            trackAiResponse({
              request_id: requestId,
              user_id: backendUser?.firebaseUid ?? "",
              project_id: projectId,
              response_type: "encyclopedia",
              success: true,
              latency_ms: timer(),
            });
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al iniciar la generación");
            trackAiResponse({
              request_id: requestId,
              user_id: backendUser?.firebaseUid ?? "",
              project_id: projectId,
              response_type: "encyclopedia",
              success: false,
              latency_ms: timer(),
            });
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
