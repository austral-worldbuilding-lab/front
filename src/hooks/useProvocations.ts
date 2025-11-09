import { useState, useEffect } from "react";
import { Provocation } from "@/types/mandala";
import { provocationsService } from "@/services/provocationService.ts";
import { useAnalytics } from "@/services/analytics";
import { useAuth } from "./useAuth";
import { v4 as uuid } from "uuid";

export default function useProvocations(projectId: string) {
    const [provocations, setProvocations] = useState<Provocation[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const { trackAiRequest, trackAiResponse, createTimer } = useAnalytics();
    const { backendUser } = useAuth();

    const reload = async () => {
        setLoading(true);
        setError(null);
        const requestId = uuid();
        const timer = createTimer();
        trackAiRequest({
          request_id: requestId,
          user_id: backendUser?.firebaseUid ?? "",
          project_id: projectId,
          request_type: "generate_provocations",
        });
        try {
            const provs = await provocationsService.getAllProvocations(projectId);
            setProvocations(Array.isArray(provs) ? provs : []);
            trackAiResponse({
              request_id: requestId,
              user_id: backendUser?.firebaseUid ?? "",
              project_id: projectId,
              response_type: "provocations",
              success: true,
              latency_ms: timer(),
            });
        } catch (err: any) {
            setError(err.message ?? "Error cargando provocaciones");
            setProvocations([]);
            trackAiResponse({
              request_id: requestId,
              user_id: backendUser?.firebaseUid ?? "",
              project_id: projectId,
              response_type: "provocations",
              success: false,
              latency_ms: timer(),
            });
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
                ).map(p => ({ ...p, isCached: true })); // marcar como cache
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

    const deleteProvocation = async (provocationId: string) => {
        if (!provocationId) {
            throw new Error("provocationId es requerido");
        }
        
        setDeletingId(provocationId);
        setError(null);
        try {
            await provocationsService.deleteProvocation(projectId, provocationId);
            await reload();
        } catch (err: any) {
            console.error("Error eliminando provocación:", err);
            const errorMsg = err.message ?? "Error eliminando provocación";
            setError(errorMsg);
            throw err;
        } finally {
            setDeletingId(null);
        }
    };

    const linkProvocationToProject = (provId: string, newProjectId: string) => {
        setProvocations(prev =>
            prev.map(p => (p.id === provId ? { ...p, parentProjectId: newProjectId, isCached: false } : p))
        );
    };

    useEffect(() => {
        reload();
    }, [projectId]);

    return { provocations, loading, error, deletingId, setProvocations, reload, generateAI, createManual, deleteProvocation, linkProvocationToProject };
}
