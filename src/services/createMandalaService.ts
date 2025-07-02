import axiosInstance from "@/lib/axios.ts";
import {CompleteApiMandala} from "@/types/mandala";

export interface CreateMandalaDto {
    name: string;
    projectId: string;
    color: string;
    useAIMandala: boolean;
    center: {
        name: string;
        description: string;
        color: string;
    };
    dimensions: { name: string; color?: string }[]
    scales: string[];
    parentId?: string | null;
}


export async function createMandalaService(payload: CreateMandalaDto): Promise<string> {
    const endpoint = payload.useAIMandala ? "/mandala/generate" : "/mandala";

    try {
        const response = await axiosInstance.post(endpoint, payload);

        if (response.status !== 201) {
            throw new Error("Failed to create mandala");
        }

        return response.data?.data?.id || response.data?.data?.mandala?.id;
    } catch (error: any) {
        if (
            error.response?.data?.statusCode === 500 &&
            error.response?.data?.path === "/mandala/generate"
        ) {
            throw new Error("Este proyecto no tiene archivos. Por favor, subí archivos antes de generar una mandala con IA.");
        }
    }
}

export const getMandalas = async (
    projectId: string,
    page: number,
    limit: number
): Promise<CompleteApiMandala[]> => {
    const response = await axiosInstance.get<{ data: CompleteApiMandala[] }>(
        "/mandala",
        {
            params: { projectId, page, limit },
        }
    );

    return response.data.data;
};

export const deleteMandala = async (mandalaId: string): Promise<void> => {
    await axiosInstance.delete(`/mandala/${mandalaId}`);
};
