import axiosInstance from "@/lib/axios.ts";

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