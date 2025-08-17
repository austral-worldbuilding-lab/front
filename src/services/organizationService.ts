import axiosInstance from "@/lib/axios";

export interface Organization {
    id: string;
    name: string;
}

export const getOrganizations = async (): Promise<Organization[]> => {
    const response = await axiosInstance.get<{ data: Organization[] }>("/organization");

    if (response.status !== 200) {
        throw new Error("Error al cargar organizaciones");
    }

    return response.data.data;
};

