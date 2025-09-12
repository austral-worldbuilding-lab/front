import { useCallback, useState } from "react";
import { generatePostItsService } from "@/services/questionMachineService";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/services/analytics";
import { v4 as uuid } from "uuid";

export interface GeneratedPostIt {
    id: string;
    content: string;
    dimension: string;
    section: string;
    tags: any[];
}

export function usePostItsGenerator(mandalaId: string, projectId: string) {
    const [items, setItems] = useState<GeneratedPostIt[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { backendUser } = useAuth();
    const { trackAiRequest } = useAnalytics();

    const generate = useCallback(
        async (dimensions: string[], scales: string[]) => {
            setLoading(true);
            setError(null);
            trackAiRequest({
                project_id: projectId,
                request_id: uuid(),
                request_type: "generate_postits",
                user_id: backendUser?.firebaseUid ?? "",
                mandala_id: mandalaId,
                dimensions_count: dimensions.length,
                scales_count: scales.length
            });
            try {
                const res = await generatePostItsService(mandalaId, { dimensions, scales });
                setItems(prev => [...prev, ...res].slice(-20)); // Limita a 20
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "No se pudieron generar Post-Its");
            } finally {
                setLoading(false);
            }
        },
        [backendUser?.firebaseUid, mandalaId, projectId, trackAiRequest]
    );

    return { items, setItems, loading, error, generate };
}
