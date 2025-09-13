import { useState } from "react";
import { createMandalaService } from "@/services/createMandalaService.ts";
import { useAuth } from "./useAuth";
import { useAnalytics } from "@/services/analytics";

export const useCreateMandala = (projectId: string) => {
    const [loading, setLoading] = useState(false);
    const { backendUser } = useAuth();
    const { trackMandalaInteraction } = useAnalytics();

    const createMandala = async (
        name: string,
        description: string,
        color: string,
        useAIMandala: boolean,
        dimensions: { name: string; color?: string }[],
        scales: string[],
        parentId?: string
    ): Promise<string> => {
        setLoading(true);
        trackMandalaInteraction({
            event_type: "mandala_create",
            mandala_id: "",
            mandala_type: "CHARACTER",
            project_id: projectId,
            user_id: backendUser?.firebaseUid ?? "",
            collaboration_session_active: false,
            ai_assisted: true
        });
        try {
            const payload = {
                name,
                projectId,
                useAIMandala,
                color,
                center: {
                    name,
                    description,
                    color: color,
                },
                dimensions: dimensions.map(({ name, color }) => ({
                    name,
                    color: color,
                })),

                scales,
                parentId: parentId ?? null,
            };

            return await createMandalaService(payload);
        } finally {
            setLoading(false);
        }
    };

    return {
        loading,
        createMandala,
    };
};
