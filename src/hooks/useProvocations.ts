import { useState, useEffect } from "react";
import { Provocation } from "@/types/mandala";
import { provocationsService } from "@/services/provocationService.ts";

export default function useProvocations(projectId: string) {
    const [provocations, setProvocations] = useState<Provocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const reload = async () => {
        setLoading(true);
        setError(null);
        try {
            const provs = await provocationsService.getAllProvocations(projectId);
            setProvocations(Array.isArray(provs) ? provs : []);
        } catch (err: any) {
            setError(err.message ?? "Error cargando provocaciones");
            setProvocations([]);
        } finally {
            setLoading(false);
        }
    };

    const generateAI = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await provocationsService.generateAIProvocations(projectId);
            setProvocations((prev) => {
                const newOnes = data.filter(
                    (p) => !prev.some((existing) => existing.id === p.id)
                );
                return [...prev, ...newOnes];
            });
        } catch (err: any) {
            setError(err.message ?? "Error generando provocaciones");
        } finally {
            setLoading(false);
        }
    };

    const createManual = async (body: Omit<Provocation, "id">) => {
        setLoading(true);
        setError(null);
        try {
            const newProv = await provocationsService.createManualProvocation(projectId, body);
            setProvocations((prev) => [...prev, newProv]);
        } catch (err: any) {
            setError(err.message ?? "Error creando provocación");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        reload();
    }, [projectId]);

    return { provocations, loading, error, setProvocations, reload, generateAI, createManual };
}
