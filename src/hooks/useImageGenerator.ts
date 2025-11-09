import { useCallback, useEffect, useState } from "react";
import {
    generateImagesService,
    getCachedImagesService,
} from "@/services/imageService";

export function useImageGenerator(mandalaId: string, projectId: string) {
    const [images, setImages] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
            try {
                const res = await generateImagesService(mandalaId, { dimensions, scales });
                setImages(res);
            } catch (e) {
                setError("Error al generar imágenes");
            } finally {
                setLoading(false);
            }
        },
        [mandalaId, projectId]
    );

    return { images, loading, error, generate };
}
