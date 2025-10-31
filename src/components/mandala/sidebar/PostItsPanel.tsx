// PostItsPanel.tsx
import { Button } from "@/components/ui/button";
import { Plus, Sparkles } from "lucide-react";
import { GeneratedPostIt, usePostItsGenerator } from "./usePostItsGenerator";
import type { Tag } from "@/types/mandala";
import { PropsWithChildren, useEffect, useMemo, useRef, useState } from "react";
import NewPostItModal from "@/components/mandala/postits/NewPostItModal.tsx";
import { Link } from "react-router-dom";
import { getLocalQueue } from "@/utils/localQueue.ts";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/services/analytics";
import { useProjectAccess } from "@/hooks/useProjectAccess";

export interface PostItsPanelProps extends PropsWithChildren {
  mandalaId: string;
  organizationId: string;
  projectId: string;
  selected: { dimensions: string[]; scales: string[] };
  tags?: Tag[];
  onCreate: (content: string, tags: Tag[], postItFatherId?: string, dimension?: string, section?: string) => void;
  onNewTag?: (tag: Tag) => void;
  dimensions: { name: string; color: string }[];
}

export default function PostItsPanel({
  mandalaId,
  organizationId,
  projectId,
  selected,
  children,
  tags = [],
  onCreate = () => {},
  onNewTag = () => {},
  dimensions = [],
}: PostItsPanelProps) {
  const { hasAccess, userRole } = useProjectAccess(projectId);
  const canEdit =
    !!hasAccess &&
    (userRole === null || ["dueño", "facilitador", "worldbuilder"].includes(userRole));
  const { items, setItems, loading, error, generate } = usePostItsGenerator(
    mandalaId,
    projectId
  );
  const scrollRef = useRef<HTMLDivElement>(null);

  // modal de creación real
  const [open, setOpen] = useState(false);
  const [prefill, setPrefill] = useState("");
  const { trackPostitConverted } = useAnalytics();
  const { backendUser } = useAuth();
  const [selectedCandidate, setSelectedCandidate] = useState<{
    request_id?: string;
    candidate_index?: number;
    dimension?: string;
    scale?: string;
    content?: string;
  } | null>(null);

  // Cargar post-its guardados en localStorage al montar
  useEffect(() => {
    const stored = getLocalQueue<GeneratedPostIt>(`mandala-postits-${mandalaId}`);
    if (stored.length > 0) setItems(stored);
  }, [mandalaId, setItems]);

  // Guardar post-its en localStorage cuando cambian
  useEffect(() => {
    if (items.length > 0) {
      localStorage.setItem(
        `mandala-postits-${mandalaId}`,
        JSON.stringify(items.slice(-20))
      );
    }
  }, [items, mandalaId]);

  // Scroll automático al fondo cuando cambian las preguntas
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [items, loading]);

  // Eliminar post-it de localStorage cuando se crea uno nuevo
  const deletePostItFromLocal = (content: string) => {
    const key = `mandala-postits-${mandalaId}`;
    const stored = getLocalQueue<GeneratedPostIt>(key);
    const filtered = stored.filter((item: GeneratedPostIt) => item.content !== content);
    localStorage.setItem(key, JSON.stringify(filtered.slice(-20)));
    setItems(filtered.slice(-20));
  };

  const openCreateWith = (candidate: GeneratedPostIt) => {
    setSelectedCandidate({
      request_id: candidate.request_id,
      candidate_index: candidate.candidate_index,
      dimension: candidate.dimension,
      scale: candidate.section,
      content: candidate.content,
    });
    setPrefill(candidate.content);
    setOpen(true);
  };

  const isEmpty = !loading && !error && items.length === 0;

  const dimensionColors = useMemo(() => {
    return (
      dimensions?.reduce((acc, d) => {
        acc[d.name] = d.color;
        return acc;
      }, {} as Record<string, string>) ?? {}
    );
  }, [dimensions]);

  return (
    <div className="flex-1 min-h-0 flex flex-col gap-3">
      <div className="flex-1 min-h-0">
        <div
          ref={scrollRef}
          className={`h-full border rounded-lg p-4 overflow-y-auto custom-scrollbar ${
            isEmpty ? "grid" : ""
          }`}
        >
          {loading && (
            <p className="animate-pulse text-gray-500">
              Generando Post-Its en base a los archivos subidos…
            </p>
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
          {isEmpty && <p>No hay Post-Its para mostrar</p>}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {items.map((item, i) => (
                <div key={i} className="relative">
                  {/* Post-it redondo */}
                  <div
                    className="aspect-square rounded-full text-black border border-black/20 shadow-sm flex items-center justify-center text-center p-4"
                    style={{
                      backgroundColor:
                        dimensionColors[item.dimension] || "#e3e3e3",
                    }}
                  >
                    <span className="text-sm">{item.content}</span>
                  </div>

                  {/* Botón + arriba a la derecha - solo si puede editar */}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={() => openCreateWith(item)}
                      className="absolute -top-2 -right-2 h-7 w-7 rounded-full border border-black/20 bg-white shadow flex items-center justify-center"
                      aria-label="Agregar post-it"
                      title="Agregar post-it"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filtros + botón Generar*/}
      <div className="mt-2">
        {children}
        {canEdit && (
          <div className="sticky bottom-0 bg-background pt-3 pb-4">
            <Button
              className="w-full h-11 text-base"
              onClick={() => generate(selected.dimensions, selected.scales)}
              icon={<Sparkles size={16} />}
              disabled={loading}
            >
              Generar Post-Its
            </Button>
          </div>
        )}
      </div>

      {/* Modal real con texto precargado */}
      <NewPostItModal
        isOpen={open}
        onOpenChange={setOpen}
        tags={tags}
        onCreate={(content, tags, postItFatherId, dimension, section) => {
          onCreate(content, tags, postItFatherId, dimension, section);
          const candidate = selectedCandidate;
          if (
            candidate?.request_id != null &&
            candidate?.candidate_index != null
          ) {
            trackPostitConverted({
              request_id: candidate.request_id,
              user_id: backendUser?.firebaseUid ?? "",
              project_id: projectId,
              mandala_id: mandalaId,
              candidate_index: candidate.candidate_index,
              dimension: candidate.dimension,
              scale: candidate.scale,
            });
          }
          deletePostItFromLocal(prefill);
          setSelectedCandidate(null);
        }}
        onNewTag={onNewTag}
        defaultContent={prefill}
        defaultDimension={selectedCandidate?.dimension}
        defaultSection={selectedCandidate?.scale}
      />
    </div>
  );
}
