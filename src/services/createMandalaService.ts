import axiosInstance from "@/lib/axios.ts";
import {CompleteApiMandala} from "@/types/mandala";
import axios from "axios";

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
    } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
            const statusCode = error.response?.data?.statusCode;
            const path = error.response?.data?.path;

            if (statusCode === 500 && path === "/mandala/generate") {
                throw new Error("Este proyecto no tiene archivos. Por favor, subí archivos antes de generar una mandala con IA.");
            }
        }
        throw error;
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
