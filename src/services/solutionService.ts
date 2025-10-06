import type { Solution} from "@/types/mandala"
// import axiosInstance from "@/lib/axios.ts";

const mockSolutions: Solution[] = [];

export const solutionService = {
    async getAllSolutions(projectId: string): Promise<Solution[]> {
        if (!projectId) throw new Error("projectId es requerido");

        // const response = await axiosInstance.get<{ data: Solution[] }>(`/project/${projectId}/solutions`);
        // if (response.status !== 200) {
        //     throw new Error("Error fetching solutions.");
        // }
        // return response.data.data;

        //Mock temporal
        return [...mockSolutions];
    },

    async createSolution(projectId: string, body: Omit<Solution, "id">): Promise<Solution> {
        if (!projectId) throw new Error("projectId es requerido");

        // const response = await axiosInstance.post<{ data: Solution }>(`/project/${projectId}/solution`, body);
        // if (response.status !== 201 && response.status !== 200) {
        //     throw new Error("Error creating solution.");
        // }
        // return response.data.data;

        //Mock temporal: genera id y guarda en memoria
        const newSolution = { id: Date.now().toString(), ...body };
        mockSolutions.unshift(newSolution);
        return newSolution;    },
};
