import { useParams } from "react-router-dom";
import { useCallback, useState } from "react";
import { CreateMandalaDto } from "@/services/projectService";
import { createMandala as createMandalaService } from "@/services/projectService";

export const useProject = () => {
    const { projectId } = useParams<{ projectId: string }>();
    const [loading, setLoading] = useState(false);

    if (!projectId) {
        throw new Error("Project ID not found in URL");
    }

    const createMandala = useCallback(
        async (type: "blank" | "ai", name: string): Promise<string> => {
            const dto: CreateMandalaDto = {
                name,
                projectId,
            };

            setLoading(true);
            try {
                return await createMandalaService(type, dto);
            } finally {
                setLoading(false);
            }
        },
        [projectId]
    );

    return {
        projectId,
        createMandala,
        loading,
    };
};
