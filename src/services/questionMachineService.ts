import axiosInstance from "@/lib/axios";
import axios, {AxiosError} from "axios";
import {GeneratedPostIt} from "@/components/mandala/sidebar/usePostItsGenerator.tsx";
import {getSelectedFileNames} from "./filesService.ts";

export interface AiQuestionResponse {
    question: string;
    dimension: string;
    scale: string;
}

export interface GenerateQuestionsDto {
    dimensions: string[];
    scales: string[];
    selectedFiles?: string[];
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
    const mandalaFiles = await getSelectedFileNames("mandala", mandalaId);

    const payloadWithFiles = {
        ...payload,
        selectedFiles: payload.selectedFiles
            ? [...payload.selectedFiles, ...mandalaFiles]
            : mandalaFiles
    };

    try {
        const res = await axiosInstance.post<{ data: AiQuestionResponse[] }>(
            `/mandala/${encodeURIComponent(mandalaId)}/generate-questions`,
            payloadWithFiles
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

export async function getCachedQuestionsService(
    mandalaId: string
): Promise<AiQuestionResponse[]> {
    if (!mandalaId) throw new Error("mandalaId es requerido");

    try {
        const res = await axiosInstance.get<{ data: AiQuestionResponse[] }>(
            `/mandala/${encodeURIComponent(mandalaId)}/cached-questions`
        );

        return res?.data?.data ?? [];
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;

            switch (status) {
                case 403:
                    throw new Error("No tienes permisos para obtener preguntas de esta mandala");
                case 404:
                    throw new Error("Mandala no encontrada");
                default:
                    throw new Error("Error al obtener preguntas. Por favor, intenta nuevamente");
            }
        }
        throw new Error("Error al obtener preguntas. Por favor, intenta nuevamente");
    }
}

export interface GeneratePostItsDto {
    dimensions: string[];
    scales: string[];
    selectedFiles?: string[];
}

export async function generatePostItsService(
    mandalaId: string,
    payload: GeneratePostItsDto
): Promise<GeneratedPostIt[]> {
    if (!mandalaId) throw new Error("mandalaId es requerido");
    if (!payload?.dimensions || !payload?.scales) {
        throw new Error('payload inválido: se esperan "dimensions" y "scales"');
    }
    const mandalaFiles = await getSelectedFileNames("mandala", mandalaId);

    const payloadWithFiles = {
        ...payload,
        selectedFiles: payload.selectedFiles
            ? [...payload.selectedFiles, ...mandalaFiles]
            : mandalaFiles
    };

    // El back retorna un array (string u objetos). Normalizamos a string[].
    const res = await axiosInstance.post<{ data: GeneratedPostIt[] }>(
        `/mandala/${encodeURIComponent(mandalaId)}/generate-postits`,
        payloadWithFiles
    );

    return res?.data?.data ?? [] }