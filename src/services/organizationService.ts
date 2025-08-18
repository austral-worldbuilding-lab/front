import axiosInstance from "@/lib/axios";
import {Organization} from "@/types/mandala";


export const getOrganizations = async (page: number, limit: number): Promise<Organization[]> => {
    const response = await axiosInstance.get<{ data: Organization[] }>(
        `/organization?page=${page}&limit=${limit}`
    );

    if (response.status !== 200) {
        throw new Error("Error al cargar organizaciones");
    }

    return response.data.data;
};

export const createOrganization = async ({ name }: { name: string }) => {
    const response = await axiosInstance.post("/organization", { name });
    return response.data;
};

export const getOrganizationById = async (id: string): Promise<Organization> => {
    const response = await axiosInstance.get<{data: Organization}>(`/organization/${id}`);
    if (response.status !== 200) {
        throw new Error("Error al cargar organización");
    }
    return response.data.data;
};

