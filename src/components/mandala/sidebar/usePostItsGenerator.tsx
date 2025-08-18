import { useCallback, useState } from "react";
import { generatePostItsService } from "@/services/questionMachineService";

export function usePostItsGenerator(mandalaId: string) {
    const [items, setItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(
        async (dimensions: string[], scales: string[]) => {
            setLoading(true);
            setError(null);
            try {
                const list = await generatePostItsService(mandalaId, { dimensions, scales });
                setItems(list);
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "No se pudieron generar Post-Its");
            } finally {
                setLoading(false);
            }
        },
        [mandalaId]
    );

    return { items, loading, error, generate };
}
