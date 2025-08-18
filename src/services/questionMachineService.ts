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

/* ────────────────────────────────────────────────────────────
   MOCK: generatePostItsService
   ──────────────────────────────────────────────────────────── */

export interface GeneratePostItsDto {
    dimensions: string[];
    scales: string[];
    count?: number;
}

export interface PostItResponse {
    items: string[];
}

export async function generatePostItsService(
    _mandalaId: string,
    payload: GeneratePostItsDto
): Promise<PostItResponse> {
    if (!payload?.dimensions || !payload?.scales) {
        throw new Error('payload inválido: se esperan "dimensions" y "scales"');
    }

    await new Promise((r) => setTimeout(r, 400));

    const { dimensions, scales, count = 6 } = payload;

    const pool = [
        ...dimensions.slice(0, 6),
        ...scales.slice(0, 6),
        "Idea",
        "Acción",
        "Tarea",
        "Insight",
        "Hallazgo",
    ].filter(Boolean);

    const items: string[] = Array.from({ length: count }).map((_, i) => {
        const a = pool[i % pool.length] ?? "Nota";
        const b = pool[(i + 3) % pool.length] ?? "Contexto";
        return `Post-It ${i + 1}: ${a} · ${b}`;
    });

    return { items };
}