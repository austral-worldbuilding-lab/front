import type { Solution } from "@/pages/app/project/SolutionPage";
// import axiosInstance from "@/lib/axios.ts";

const mockSolutions: Solution[] = [
    {
        id: "1",
        title: "Sistema de Reciclaje Comunitario",
        description: "Implementación de puntos de reciclaje inteligentes con incentivos vecinales.",
        problem: "Alta generación de residuos no clasificados en zonas urbanas.",
        impact: { level: "high", description: "Reduce un 40% los residuos no reciclados." },
        provocations: ["¿Qué pasa si los ciudadanos obtienen beneficios por reciclar?"],
    },
    {
        id: "2",
        title: "Red de Transporte Compartido",
        description: "Sistema de carpooling con rutas optimizadas.",
        problem: "Congestión vehicular y alta emisión de CO2.",
        impact: { level: "medium", description: "Reducción del 25% del tráfico urbano." },
        provocations: ["¿Y si compartimos más viajes?", "¿Qué pasaría si cada viaje suma puntos verdes?"],
    },
];

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
