import { useState } from "react";
import {ActionItem} from "@/types/mandala";
import {getActionIntem} from "@/services/solutionService.ts";
import { useAnalytics } from "@/services/analytics";
import { useAuth } from "./useAuth";
import { v4 as uuid } from "uuid";

export default function useActionItems(projectId: string, solutionId: string) {
    const [actionItems, setActionItems] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { trackAiRequest, trackAiResponse, createTimer } = useAnalytics();
    const { backendUser } = useAuth();

    const generateActionItems = async () => {
        setLoading(true);
        setError(null);
        const requestId = uuid();
        const timer = createTimer();
        trackAiRequest({
          request_id: requestId,
          user_id: backendUser?.firebaseUid ?? "",
          project_id: projectId,
          request_type: "generate_action_items",
        });
        try {
            const items = await getActionIntem(projectId, solutionId);
            setActionItems(items);
            trackAiResponse({
              request_id: requestId,
              user_id: backendUser?.firebaseUid ?? "",
              project_id: projectId,
              response_type: "action_items",
              success: true,
              latency_ms: timer(),
            });
            return items;
        } catch (err) {
            console.error("Error generando action items:", err);
            setError("No se pudieron generar los action items");
            trackAiResponse({
              request_id: requestId,
              user_id: backendUser?.firebaseUid ?? "",
              project_id: projectId,
              response_type: "action_items",
              success: false,
              latency_ms: timer(),
            });
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        actionItems,
        loading,
        error,
        generateActionItems,
        setActionItems,
    };
}
