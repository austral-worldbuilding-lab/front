// components/question-machine/useQuestionGenerator.ts
import { useCallback, useState } from "react";
import {
    generateQuestionsService,
    type AiQuestionResponse,
} from "@/services/questionMachineService";

export function useQuestionGenerator(mandalaId: string) {
    const [questions, setQuestions] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generate = useCallback(
        async (dimensions: string[], scales: string[]) => {
            setLoading(true);
            setError(null);
            try {
                // ⬇️ El servicio retorna AiQuestionResponse[]
                const res: AiQuestionResponse[] = await generateQuestionsService(
                    mandalaId,
                    { dimensions, scales }
                );

                // ⬇️ Normalizamos a array de strings (solo la pregunta)
                const items = (res ?? [])
                    .map((r) => r?.question?.trim())
                    .filter(Boolean) as string[];

                setQuestions(items);
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : "No se pudieron generar preguntas";
                setError(msg);
            } finally {
                setLoading(false);
            }
        },
        [mandalaId]
    );

    return { questions, loading, error, generate };
}

