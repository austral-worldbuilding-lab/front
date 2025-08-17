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

