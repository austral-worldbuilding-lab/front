import { Provocation } from "@/types/mandala";

export const provocationsService = {
    // TODO: reemplazar con fetch real al endpoint IA
    async generateAIProvocations(projectId: string): Promise<Provocation[]> {
        const data = [
            {
                id: "1",
                provocation: "¿Qué pasaría si invirtiéramos los roles de los usuarios?",
                title: "Cambio de perspectiva",
                description: "Probar a que los usuarios adopten el rol opuesto al habitual para descubrir nuevas oportunidades.",
            },
            {
                id: "2",
                provocation: "¿Cómo funcionaría este proyecto en un entorno completamente digital?",
                title: "Digitalización radical",
                description: "Explorar qué sucede si eliminamos por completo la interacción física y todo se vuelve digital.",
            },
        ];

        return data.map((p) => ({
            id: p.id,
            question: p.provocation,
            title: p.title,
            description: p.description,
        }));
    },

    // TODO: endpoint para crear manual
    async createManualProvocation(projectId: string, body: Omit<Provocation, "id">): Promise<Provocation> {
        return { id: Date.now().toString(), ...body };
    },
};
