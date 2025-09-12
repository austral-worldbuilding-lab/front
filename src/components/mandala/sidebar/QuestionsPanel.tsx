import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useQuestionGenerator } from "@/components/mandala/sidebar/useQuestionGenerator.tsx";
import { Link } from "react-router-dom";
import { getLocalQueue } from "@/utils/localQueue.ts";
import { PropsWithChildren, useEffect, useRef } from "react";

export interface QuestionsPanelProps extends PropsWithChildren {
  mandalaId: string;
  organizationId: string;
  projectId: string;
  selected: { dimensions: string[]; scales: string[] };
}

export default function QuestionsPanel({
  mandalaId,
  organizationId,
  projectId,
  selected,
  children,
}: QuestionsPanelProps) {
  const { questions, setQuestions, loading, error, generate } =
    useQuestionGenerator(mandalaId, projectId);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Cargar preguntas guardadas en localStorage al montar
  useEffect(() => {
    setQuestions(getLocalQueue<string>(`mandala-questions-${mandalaId}`));
  }, [mandalaId, setQuestions]);

  // Guardar preguntas en localStorage cuando cambian
  useEffect(() => {
    if (questions.length > 0) {
      localStorage.setItem(
        `mandala-questions-${mandalaId}`,
        JSON.stringify(questions.slice(-20))
      );
    }
  }, [questions, mandalaId]);

  // Scroll automático al fondo cuando cambian las preguntas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [questions, loading]);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      {/* resultados scrollables */}
      <div className="flex-1 min-h-0">
        <div
          ref={scrollRef}
          className="h-full border rounded-lg p-4 overflow-y-auto custom-scrollbar"
        >
          {loading && (
            <p className="animate-pulse text-gray-500">
              Generando preguntas en base a los archivos subidos…
            </p>
          )}
          {!loading && !error && questions.length === 0 && (
            <p>No hay preguntas para mostrar</p>
          )}
          {error && error.includes("500") ? (
            <>
              <p className="text-muted-foreground">
                No hay archivos subidos para este proyecto, por favor sube
                archivos para generar preguntas.
              </p>
              <Link
                to={`/app/organization/${organizationId}/projects/${projectId}`}
                className="mt-4 text-primary inline-block underline"
              >
                Subir archivos
              </Link>
            </>
          ) : error ? (
            <p className="text-red-600">Error: {error}</p>
          ) : null}
          {!loading && questions.length > 0 && (
            <ul className="space-y-2">
              {questions.map((q, idx) => (
                <li key={idx} className="px-3 py-2 rounded-md bg-muted">
                  {q}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* filtros + botón acción */}
      <div className="mt-2">
        {children}
        <div className="sticky bottom-0 bg-background pt-3 pb-4">
          <Button
            className="w-full h-11 text-base"
            onClick={() => generate(selected.dimensions, selected.scales)}
            icon={<Sparkles size={16} />}
            disabled={loading}
          >
            Generar Preguntas
          </Button>
        </div>
      </div>
    </div>
  );
}
