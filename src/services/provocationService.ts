import {Provocation, SelectedFile} from "@/types/mandala";
import axiosInstance from "@/lib/axios.ts";

interface ProvocationResponse {
    id?: string;
    title?: string;
    description?: string;
    provocation: string;
}


export const provocationsService = {
    async generateAIProvocations(projectId: string): Promise<Provocation[]> {
        if (!projectId) throw new Error("projectId es requerido");

        const selectedFiles: SelectedFile[] = JSON.parse(
            localStorage.getItem("selectedFiles") || "[]"
        );

        const projectFiles = selectedFiles
            .filter(f => f.scope === "project" && f.parentId === projectId)
            .map(f => f.fileName);

        const payload = { selectedFiles: projectFiles };
        const response = await axiosInstance.post<{ data: ProvocationResponse[] }>(
            `/project/${projectId}/generate-solutions`,
            payload
        );

        if (response.status !== 201 && response.status !== 200) {
            throw new Error("Error generating provocations.");
        }

        const solutions = response.data.data;

        return solutions.map((s, idx) => ({
            id: s.id ?? idx.toString(),
            question: s.provocation  ?? "¿Cómo podemos explorar esta idea?",
            title: s.title ?? `Provocación ${idx + 1}`,
            description: s.description ?? "",
        }));
    },

    // TODO: conectar con el endpoint para crear manual
    async createManualProvocation(projectId: string, body: Omit<Provocation, "id">): Promise<Provocation> {
        return { id: projectId, ...body };
    },
};
