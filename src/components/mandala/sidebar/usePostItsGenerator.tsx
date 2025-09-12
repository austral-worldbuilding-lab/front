import { useCallback, useState } from "react";
import { generatePostItsService } from "@/services/questionMachineService";
import { useAnalytics } from "@/services/analytics";
import { useAuth } from "@/hooks/useAuth";
import { v4 as uuid } from "uuid";

export interface GeneratedPostIt {
    id: string;
    content: string;
    dimension: string;
    section: string;
    tags: any[];
    request_id?: string;
    candidate_index?: number;
}

export function usePostItsGenerator(mandalaId: string, projectId: string) {
    const [items, setItems] = useState<GeneratedPostIt[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { trackAiRequest, trackAiResponse, createTimer } = useAnalytics();
    const { backendUser } = useAuth();

    const generate = useCallback(
        async (dimensions: string[], scales: string[]) => {
            setLoading(true);
            setError(null);
            const requestId = uuid();
            const timer = createTimer();
            trackAiRequest({
                request_id: requestId,
                user_id: backendUser?.firebaseUid ?? "",
                project_id: projectId,
                mandala_id: mandalaId,
                request_type: "generate_postits",
                dimensions_count: dimensions.length,
                scales_count: scales.length,
            });
            try {
                const res = await generatePostItsService(mandalaId, { dimensions, scales });
                const candidates = (res ?? []).map((r: GeneratedPostIt, index: number) => ({
                    ...r,
                    request_id: requestId,
                    candidate_index: index,
                }));
                setItems(prev => [...prev, ...candidates].slice(-20)); // Limita a 20
                trackAiResponse({
                    request_id: requestId,
                    user_id: backendUser?.firebaseUid ?? "",
                    project_id: projectId,
                    response_type: "postits",
                    success: true,
                    latency_ms: timer(),
                    results_count: candidates.length,
                });
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "No se pudieron generar Post-Its");
                trackAiResponse({
                    request_id: requestId,
                    user_id: backendUser?.firebaseUid ?? "",
                    project_id: projectId,
                    response_type: "postits",
                    success: false,
                    error_type: e?.code || "unknown_error",
                    latency_ms: timer(),
                });
            } finally {
                setLoading(false);
            }
        },
        [backendUser?.firebaseUid, createTimer, mandalaId, projectId, trackAiRequest, trackAiResponse]
    );

    return { items, setItems, loading, error, generate };
}
