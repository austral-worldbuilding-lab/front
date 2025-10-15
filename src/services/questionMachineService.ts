import axiosInstance from "@/lib/axios";
import axios from "axios";
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
            const status = err.response?.status;

            switch (status) {
                case 400:
                    throw new Error("Los parámetros para generar preguntas no son válidos. Verifica las dimensiones y escalas seleccionadas");
                case 403:
                    throw new Error("No tienes permisos para generar preguntas en esta mandala");
                case 500:
                    throw new Error("No hay archivos subidos para este proyecto, por favor sube archivos para generar preguntas");
                default:
                    throw new Error("Error al generar preguntas. Por favor, intenta nuevamente");
            }
        }
        throw new Error("Error al generar preguntas. Por favor, intenta nuevamente");
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

    try {
        // El back retorna un array (string u objetos). Normalizamos a string[].
        const res = await axiosInstance.post<{ data: GeneratedPostIt[] }>(
            `/mandala/${encodeURIComponent(mandalaId)}/generate-postits`,
            payloadWithFiles
        );

        return res?.data?.data ?? [];
    } catch (err) {
        if (axios.isAxiosError(err)) {
            const status = err.response?.status;

            switch (status) {
                case 400:
                    throw new Error("Los parámetros para generar post-its no son válidos");
                case 403:
                    throw new Error("No tienes permisos para generar post-its en esta mandala");
                case 500:
                    //TODO ANA arreglar el back para que mande un mnsaje especifico por problema de archvios
                    throw new Error("No hay archivos subidos para este proyecto, por favor sube archivos para generar post-its");
                default:
                    throw new Error("Error al generar post-its. Por favor, intenta nuevamente");
            }
        }
        throw new Error("Error al generar post-its. Por favor, intenta nuevamente");
    }
}
