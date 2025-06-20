import axiosInstance from "@/lib/axios.ts";
import {SimpleMandala} from "@/types/mandala";

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
    linkedToId?: string | null;
}


export async function createMandalaService(
    payload: CreateMandalaDto):
    Promise<string> {

    const endpoint = payload.useAIMandala ? "/mandala/generate" : "/mandala";

    const response = await axiosInstance.post(endpoint, payload);

    if (response.status !== 201) {
        throw new Error( "Failed to create mandala");
    }

    const id = response.data?.data?.id || response.data?.data?.mandala?.id;

    return id;
};

export const getMandalas = async (
    projectId: string,
    page: number,
    limit: number
): Promise<SimpleMandala[]> => {
    const response = await axiosInstance.get<{ data: SimpleMandala[] }>(
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
