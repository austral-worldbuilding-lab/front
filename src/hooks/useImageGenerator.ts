import { useCallback, useEffect, useState } from "react";
import {
    generateImagesService,
    getCachedImagesService,
} from "@/services/imageService";
import { useAnalytics } from "@/services/analytics";
import { useAuth } from "./useAuth";
import { v4 as uuid } from "uuid";

export function useImageGenerator(mandalaId: string, projectId: string) {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { trackAiRequest, trackAiResponse, createTimer } = useAnalytics();
    const { backendUser } = useAuth();

    useEffect(() => {
        if (!mandalaId) return;
        getCachedImagesService(mandalaId)
            .then((data) => setImages(data))
            .catch(() => setImages([]));
    }, [mandalaId]);

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
              request_type: "generate_mandala_images",
            });
            try {
                const res = await generateImagesService(mandalaId, { dimensions, scales });
                setImages(res);
                trackAiResponse({
                  request_id: requestId,
                  user_id: backendUser?.firebaseUid ?? "",
                  project_id: projectId,
                  response_type: "mandala_images",
                  success: true,
                  latency_ms: timer(),
                });
            } catch (e) {
                setError("Error al generar imágenes");
                trackAiResponse({
                  request_id: requestId,
                  user_id: backendUser?.firebaseUid ?? "",
                  project_id: projectId,
                  response_type: "mandala_images",
                  success: false,
                  latency_ms: timer(),
                });
            } finally {
                setLoading(false);
            }
        },
        [mandalaId, projectId]
    );

    return { images, loading, error, generate };
}
