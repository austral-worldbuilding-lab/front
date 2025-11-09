import { useState } from "react";
import { generateMandalaSummary } from "@/services/mandalaService";
import { v4 as uuid } from "uuid";
import { useAnalytics } from "@/services/analytics";
import { useAuth } from "./useAuth";

export const useGenerateSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackAiRequest, trackAiResponse, createTimer } = useAnalytics();
  const { backendUser } = useAuth();

  const generateSummary = async (mandalaId: string, projectId: string) => {
    setLoading(true);
    setError(null);
    const requestId = uuid();
    const timer = createTimer();
    trackAiRequest({
      request_id: requestId,
      user_id: backendUser?.firebaseUid ?? "",
      project_id: projectId,
      mandala_id: mandalaId,
      request_type: "generate_summary",
    });
    try {
      await generateMandalaSummary(mandalaId);
      trackAiResponse({
        request_id: requestId,
        user_id: backendUser?.firebaseUid ?? "",
        project_id: projectId,
        response_type: "summary",
        success: true,
        latency_ms: timer(),
      });
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error al generar el resumen";
      setError(errorMessage);
      trackAiResponse({
        request_id: requestId,
        user_id: backendUser?.firebaseUid ?? "",
        project_id: projectId,
        response_type: "summary",
        success: false,
        latency_ms: timer(),
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSummary,
    loading,
    error,
  };
};
