import axiosInstance from "@/lib/axios";
import axios, { AxiosError } from "axios";

export interface AiQuestionResponse {
    question: string;
    dimension: string;
    scale: string;
}

export interface GenerateQuestionsDto {
    dimensions: string[];
    scales: string[];
}

/**
 * POST /mandala/{id}/generate-questions
 * Devuelve directamente el array que viene en response.data.data
 */
export async function generateQuestionsService(
    mandalaId: string,
    payload: GenerateQuestionsDto
): Promise<AiQuestionResponse[]> {
    if (!mandalaId) throw new Error("mandalaId es requerido");
    if (!payload?.dimensions || !payload?.scales) {
        throw new Error('payload inválido: se esperan "dimensions" y "scales"');
    }

    try {
        const res = await axiosInstance.post<{ data: AiQuestionResponse[] }>(
            `/mandala/${encodeURIComponent(mandalaId)}/generate-questions`,
            payload
        );
        return res.data.data; // ← sin normalizar, tal cual lo envía el back
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const e = err as AxiosError<any>;
            const msg =
                typeof e.response?.data === "string"
                    ? e.response?.data
                    : JSON.stringify(e.response?.data ?? {});
            throw new Error(
                `Error ${e.response?.status ?? ""} al generar preguntas: ${msg}`.trim()
            );
        }
        throw err;
    }
}
