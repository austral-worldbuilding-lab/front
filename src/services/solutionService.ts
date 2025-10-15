import type { Solution} from "@/types/mandala"
import axiosInstance from "@/lib/axios.ts";


export const solutionService = {
    async getAllSolutions(projectId: string): Promise<Solution[]> {
        if (!projectId) throw new Error("projectId es requerido");

        const response = await axiosInstance.get<Solution[]>(`/project/${projectId}/solutions`);
        if (response.status !== 200) {
            throw new Error("Error fetching solutions.");
        }
        return response.data;
    },

    async createSolution(projectId: string, body: Omit<Solution, "id">): Promise<Solution> {
        if (!projectId) throw new Error("projectId es requerido");

        const response = await axiosInstance.post<Solution>(`/project/${projectId}/solution`, body);
        return response.data;
    }
};
