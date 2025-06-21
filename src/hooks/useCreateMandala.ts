import { useState } from "react";
import { createMandalaService } from "@/services/createMandalaService.ts";

export const useCreateMandala = (projectId: string) => {
    const [loading, setLoading] = useState(false);

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
