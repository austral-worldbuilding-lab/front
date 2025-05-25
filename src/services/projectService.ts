import axiosInstance from "@/lib/axios";
import {SimpleMandala} from "@/types/mandala";

export interface CreateMandalaDto {
    name: string;
    projectId: string;
}

export const createMandala = async (
    type: "blank" | "ai",
    dto: CreateMandalaDto
): Promise<string> => {
    if (type === "ai") {
        const response = await axiosInstance.post("/mandala/generate", dto);
        if (response.status !== 201) {
            throw new Error(response.data.message || "Error generating mandala with AI.");
        }
        return response.data.id;
    }
    const response = await axiosInstance.post("/mandala", dto);
    if (response.status !== 201) {
        throw new Error(response.data.message || "Error creating mandala.");
    }
    return response.data.id;
};


export const getMandalas = async (projectId: string): Promise<SimpleMandala[]> => {
    const response = await axiosInstance.get<{ data: SimpleMandala[] }>('/mandala', {
        params: { projectId },
    });

    return response.data.data;
};