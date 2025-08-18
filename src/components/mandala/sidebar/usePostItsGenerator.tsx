import {useCallback, useState} from "react";
import {generatePostItsService} from "@/services/questionMachineService.ts";

export function usePostItsGenerator(mandalaId: string) {
    const [items, setItems] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(
        async (dimensions: string[], scales: string[]) => {
            setLoading(true);
            setError(null);
            try {
                const res = await generatePostItsService(mandalaId, { dimensions, scales });
                const arr = (res?.items ?? res ?? [])
                    .map((s: string) => s?.trim())
                    .filter(Boolean);
                setItems(arr);
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "No se pudieron generar Post-Its";
                setError(msg);
            } finally {
                setLoading(false);
            }
        },
        [mandalaId]
    );

    return { items, loading, error, generate };
}
