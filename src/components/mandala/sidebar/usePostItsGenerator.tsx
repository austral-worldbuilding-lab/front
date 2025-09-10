import { useCallback, useState } from "react";
import { generatePostItsService } from "@/services/questionMachineService";

export interface GeneratedPostIt {
    id: string;
    content: string;
    dimension: string;
    section: string;
    tags: any[];
}

export function usePostItsGenerator(mandalaId: string) {
    const [items, setItems] = useState<GeneratedPostIt[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(
        async (dimensions: string[], scales: string[]) => {
            setLoading(true);
            setError(null);
            try {
                const res = await generatePostItsService(mandalaId, { dimensions, scales });
                setItems(prev => [...prev, ...res].slice(-20)); // Limita a 20
            } catch (e: unknown) {
                setError(e instanceof Error ? e.message : "No se pudieron generar Post-Its");
            } finally {
                setLoading(false);
            }
        },
        [mandalaId]
    );

    return { items, setItems, loading, error, generate };
}
