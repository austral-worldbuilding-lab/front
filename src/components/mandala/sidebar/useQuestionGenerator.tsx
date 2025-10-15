// components/question-machine/useQuestionGenerator.ts
import { useCallback, useState, useEffect } from "react";
import {
  generateQuestionsService,
  getCachedQuestionsService,
  type AiQuestionResponse,
} from "@/services/questionMachineService";
import { useAnalytics } from "@/services/analytics";
import { useAuth } from "@/hooks/useAuth";
import { v4 as uuid } from "uuid";

export function useQuestionGenerator(mandalaId: string, projectId: string) {
  const [questions, setQuestions] = useState<
    { question: string; dimension: string; scale: string }[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { trackAiRequest } = useAnalytics();
  const { backendUser } = useAuth();

  useEffect(() => {
    const loadCachedQuestions = async () => {
      if (!mandalaId) return;
      
      const cachedQuestions = await getCachedQuestionsService(mandalaId).catch(() => []);
      const formattedQuestions = cachedQuestions.map((q) => ({
        question: q.question?.trim() || "",
        dimension: q.dimension?.trim() || "",
        scale: q.scale?.trim() || "",
      })).filter(q => q.question && q.dimension && q.scale);
      
      setQuestions(formattedQuestions);
    };

    loadCachedQuestions();
  }, [mandalaId]);

  const generate = useCallback(
    async (dimensions: string[], scales: string[]) => {
      setLoading(true);
      setError(null);
      trackAiRequest({
        mandala_id: mandalaId,
        dimensions_count: dimensions.length,
        scales_count: scales.length,
        project_id: projectId,
        request_id: uuid(),
        request_type: "generate_questions",
        user_id: backendUser?.firebaseUid ?? "",
      });
      try {
        // El servicio retorna AiQuestionResponse[]
        const res: AiQuestionResponse[] = await generateQuestionsService(
          mandalaId,
          { dimensions, scales }
        );

        const items = (res ?? [])
          .map((r) => ({
            question: r?.question?.trim(),
            dimension: r?.dimension?.trim(),
            scale: r?.scale?.trim(),
          }))
          .filter(Boolean) as {
          question: string;
          dimension: string;
          scale: string;
        }[];

        setQuestions((prev) => {
          const merged = [...prev, ...items].slice(-20);
          return merged;
        });
      } catch (e: unknown) {
        const msg =
          e instanceof Error ? e.message : "No se pudieron generar preguntas";
        setError(msg);
      } finally {
        setLoading(false);
      }
    },
    [backendUser?.firebaseUid, mandalaId, projectId, trackAiRequest]
  );

  return { questions, setQuestions, loading, error, generate };
}
