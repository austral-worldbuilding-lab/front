import { useQuestionGenerator } from "@/components/mandala/sidebar/useQuestionGenerator.tsx";
import { Link } from "react-router-dom";
import { CSSProperties, PropsWithChildren, useEffect, useRef } from "react";
import GenerarButton from "../../ui/GenerarButton";

export interface QuestionsPanelProps extends PropsWithChildren {
  mandalaId: string;
  organizationId: string;
  projectId: string;
  selected: { dimensions: string[]; scales: string[] };
  dimensions: { name: string; color: string }[];
}

export default function QuestionsPanel({
  mandalaId,
  organizationId,
  projectId,
  selected,
  children,
  dimensions,
}: QuestionsPanelProps) {
  const { questions, loading, error, generate } =
    useQuestionGenerator(mandalaId, projectId);
  const scrollRef = useRef<HTMLDivElement>(null);

  const getQuestionBgColor = (questionDimension: string): CSSProperties => {
    const dimension = dimensions.find((d) => d.name === questionDimension);
    if (!dimension?.color) return { backgroundColor: "#f3f4f6" };
    return { backgroundColor: `${dimension.color}33` };
  };

  const getQuestionColor = (questionDimension: string): string => {
    const dimension = dimensions.find((d) => d.name === questionDimension);
    if (!dimension?.color) return "#f3f4f6";
    return dimension.color;
  };

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
            <p className="text-red-600">{error}</p>
          ) : null}
          {!loading && questions.length > 0 && (
            <div className="flex flex-col gap-2">
              {questions.map((q, idx) => (
                <>
                  {q.question && (
                    <div key={idx} className="flex flex-col gap-1">
                      <p
                        className="text-xs font-medium"
                        style={{ color: getQuestionColor(q.dimension) }}
                      >
                        {q.dimension}
                      </p>
                      <div
                        key={idx}
                        className="px-3 py-2 rounded-md relative pb-10 border"
                        style={{
                          ...getQuestionBgColor(q.dimension),
                          borderColor: getQuestionColor(q.dimension),
                        }}
                      >
                        {q.question}
                        {q.scale && (
                          <span className="text-xs text-black border bg-white/50 border-gray-300 rounded-full px-2 py-1 absolute right-1 bottom-1">
                            {q.scale}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* filtros + botón acción */}
      <div className="mt-2">
        {children}
        <div className="sticky bottom-0 bg-background pt-3 pb-4">
          <GenerarButton
            text="Generar Preguntas"
            loading={loading}
            disabled={loading}
            onClick={() => generate(selected.dimensions, selected.scales)}
          />
        </div>
      </div>
    </div>
  );
}
