import {Provocation} from "@/types/mandala";
import axiosInstance from "@/lib/axios.ts";
import {getSelectedFileNames} from "./filesService.ts";


export const provocationsService = {
    async generateAIProvocations(projectId: string): Promise<Provocation[]> {
        if (!projectId) throw new Error("projectId es requerido");

        try {
            const projectFiles = await getSelectedFileNames("project", projectId);

            const payload = { selectedFiles: projectFiles };
            const response = await axiosInstance.post<{ data: Provocation[] }>(
                `/project/${projectId}/generate-provocations`,
                payload
            );

            if (response.status !== 201 && response.status !== 200) {
                throw new Error("Error generating provocations.");
            }

            return response.data.data;
        } catch (error: unknown) {
            const axiosError = error as { response?: { data?: { message?: string | string[] } }; message?: string };
            
            if (axiosError.response?.data?.message) {
                if (Array.isArray(axiosError.response.data.message)) {
                    throw new Error(axiosError.response.data.message.join('. '));
                }
                throw new Error(axiosError.response.data.message);
            }
            throw new Error(axiosError.message || "Error generando provocaciones");
        }
    },

    async createManualProvocation(projectId: string,   body: Omit<Provocation, "id">
    ): Promise<Provocation> {
        if (!projectId) throw new Error("projectId es requerido");

        const response = await axiosInstance.post<{ data: Provocation }>(
            `/project/${projectId}/provocation`,
            body
        );

        if (response.status !== 201 && response.status !== 200) {
            throw new Error("Error generating provocations.");
        }

        return response.data.data;
        },

    async getAllProvocations(projectId: string): Promise<Provocation[]> {
        if (!projectId) throw new Error("projectId es requerido");

        const [cacheRes, dbRes] = await Promise.all([
            axiosInstance.get<{data: Provocation[]}>(`/project/${projectId}/cached-provocations`),
            axiosInstance.get<{ data: Provocation[] }>(`/project/${projectId}/provocations`)

        ]);

        if (cacheRes.status !== 200 || dbRes.status !== 200) {
            throw new Error("Error fetching provocations.");
        }

        const dbProvs = dbRes.data.data;
        const cacheProvs = cacheRes.data.data?.map(p => ({ ...p, isCached: true })) ?? [];

        const all = [...dbProvs, ...cacheProvs.filter(p => !dbProvs.some(d => d.title === p.title))];

        return all;
    },

    async deleteProvocation(projectId: string, provocationId: string): Promise<void> {
        if (!projectId) throw new Error("projectId es requerido");
        if (!provocationId) throw new Error("provocationId es requerido");

        try {
            const response = await axiosInstance.delete(
                `/project/${projectId}/provocation/${provocationId}`
            );

            if (response.status !== 200) {
                throw new Error("Error eliminando provocación");
            }
        } catch (error: any) {
            const errorMsg = error?.response?.data?.message || error?.message || "Error eliminando provocación";
            throw new Error(errorMsg);
        }
    }
};
