import axiosInstance from "@/lib/axios";

export interface CreateMandalaDto {
    name: string;
    projectId: string;
}

export const createMandala = async (
    type: "blank" | "ai",
    dto: CreateMandalaDto
): Promise<string> => {
    if (type === "ai") {
        const response = await axiosInstance.post("/mandala/generate", dto);
        if (response.status !== 201) {
            throw new Error(response.data.message || "Error generating mandala with AI.");
        }
        return response.data.data.mandala.id;
    }
    const response = await axiosInstance.post("/mandala", dto);
    if (response.status !== 201) {
        throw new Error(response.data.message || "Error creating mandala.");
    }
    console.log(response.data.data.id);
    return response.data.data.id;
};
