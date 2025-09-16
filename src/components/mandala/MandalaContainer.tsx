/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRef, useState } from "react";
import {
  TransformWrapper,
  TransformComponent,
  ReactZoomPanPinchState,
} from "react-zoom-pan-pinch";
import Mandala from "./Mandala";
import KonvaContainer from "./KonvaContainer";
import ZoomControls from "./ZoomControls";
import useMandala from "@/hooks/useMandala";
import Loader from "../common/Loader";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeftIcon,
  Download,
  FileText,
  Filter,
  InfoIcon,
  Sparkles,
} from "lucide-react";
import Buttons from "./Buttons";
import { useCreateMandala } from "@/hooks/useCreateMandala.ts";
import { Tag } from "@/types/mandala";
import { Button } from "../ui/button";
import FiltersModal from "./filters/FiltersModal";
import { useTags } from "@/hooks/useTags";
import { useProjectCharacters } from "@/hooks/useProjectCharacters.ts";
import CharacterDropdown from "./characters/modal/CharacterDropdown";
import BreadcrumbMandala from "@/components/mandala/BreadcrumbMandala.tsx";
import QuestionMachineSidebar from "./sidebar/QuestionMachineSidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import useProject from "@/hooks/useProject";
import ProjectMembersDisplay from "./ProjectMembersDisplay";
import ViewToggle from "./ViewToggle";
import MultiKonvaContainer from "./MultiKonvaContainer";
import FilesDrawer from "@/components/project/FilesDrawer.tsx";
import { useSvgExport } from "@/hooks/useSvgExport";
import { MandalaSVG } from "@/components/mandala/MandalaSVG.tsx";
import { useKonvaUtils } from "@/hooks/useKonvaUtils.ts";

interface MandalaContainerProps {
  mandalaId: string;
  organizationId: string;
}

const MandalaContainer: React.FC<MandalaContainerProps> = ({
  mandalaId,
  organizationId,
}) => {
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingPostIt, setIsDraggingPostIt] = useState(false);
  const [isHoveringPostIt, setIsHoveringPostIt] = useState(false);
  const [state, setState] = useState<ReactZoomPanPinchState | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"overlap" | "all">("overlap");
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string[]>
  >({});

  const projectId = useParams<{ projectId: string }>().projectId!;
  const { characters: projectCharacters, linkCharacter } =
    useProjectCharacters(mandalaId);

  const navigate = useNavigate();
  const {
    mandala,
    loading,
    error,
    createPostit,
    updatePostit,
    updateCharacter,
    deletePostit,
    deleteCharacter,
    updateImage,
    deleteImage,
  } = useMandala(mandalaId);
  const { createMandala, loading: isCreatingCharacter } =
    useCreateMandala(projectId);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const { downloadSVG } = useSvgExport(svgRef);

  const scaleCount = mandala?.mandala.configuration?.scales?.length ?? 1;
  const maxRadius = 150 * scaleCount;
  const { toAbsolutePostit, toAbsolute } = useKonvaUtils(
    mandala?.postits ?? [],
    maxRadius
  );

  const postsAbs = (mandala?.postits ?? []).map((p) => {
    const a = toAbsolutePostit(p.coordinates.x, p.coordinates.y);
    return {
      id: p.id,
      content: p.content,
      dimension: p.dimension,
      ax: a.x,
      ay: a.y,
    };
  });

  const charsAbs = (mandala?.characters ?? []).map((c) => {
    const a = toAbsolute(c.position.x, c.position.y);
    return { id: c.id, name: c.name, color: c.color, ax: a.x, ay: a.y };
  });

  const imagesAbs = (mandala?.images ?? []).map((img) => {
    const a = toAbsolute(img.coordinates.x, img.coordinates.y);
    return { id: img.id, url: img.url, ax: a.x, ay: a.y };
  });

  // Extraer ids de mandalas origen desde los postits (campo from: { id, name })
  const sourceMandalaIds = (() => {
    const ids = new Set<string>();
    if (!mandala?.postits) return [] as string[];
    const stack = [...mandala.postits];
    while (stack.length) {
      const p = stack.pop()!;
      const from = (p as any).from;
      if (from?.id) ids.add(from.id);
      if (p.childrens?.length) stack.push(...p.childrens);
    }
    return Array.from(ids);
  })();

  const handleCreateCharacter = async (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
    dimensions: { name: string; color?: string }[];
    scales: string[];
    parentId?: string;
  }) => {
    await createMandala(
      character.name,
      character.description,
      character.color,
      character.useAIMandala,
      character.dimensions,
      character.scales,
      character.parentId
    );
  };

  const handleCreatePostIt = (
    content: string,
    tags: Tag[],
    postItFatherId?: string
  ) => {
    createPostit(
      {
        content: content,
        coordinates: { x: 0, y: 0, angle: 0, percentileDistance: 0 },
        dimension: "Gobierno",
        section: "Institución",
        tags: tags || null,
        childrens: [],
      },
      postItFatherId
    );
  };

  const { tags, createTag } = useTags(projectId);

  const handleNewTag = async (tag: Tag) => {
    try {
      await createTag(tag.name, tag.color);
    } catch (error) {
      console.error("Error al crear el tag:", error);
    }
  };

  const handleDeleteCharacter = async (index: number) => {
    try {
      await deleteCharacter(index);
      return true;
    } catch (e) {
      console.error("Error al eliminar el personaje:", e);
      return false;
    }
  };

  const project = useProject(projectId);

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader size="large" text="Cargando mandala..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full text-red-500">
        Error cargando mandala
      </div>
    );
  }

  return (
    <div className="overflow-hidden h-screen">
      <BreadcrumbMandala />
      <div className="w-full bg-white flex items-center relative overflow-hidden">
        <Button
          onClick={() =>
            navigate(
              `/app/organization/${organizationId}/projects/${projectId}/mandalas`
            )
          }
          className="flex items-center gap-2 cursor-pointer"
          variant="text"
          color="primary"
          icon={<ArrowLeftIcon className="w-5 h-5" />}
        >
          Atrás
        </Button>
        <div className="absolute left-1/2 -translate-x-1/2 z-10">
          <p className="text-lg text-black font-bold">
            {mandala?.mandala.name}
          </p>
        </div>
        {/* Botón Info + Diálogo */}
        <div className="ml-auto pr-4">
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                aria-label="Información del proyecto"
              >
                <InfoIcon className="w-5 h-5 text-primary" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>{project.project?.name ?? "Proyecto"}</DialogTitle>
                <DialogDescription>
                  {project.project?.description &&
                  project.project?.description.trim().length > 0 ? (
                    <p className="text-sm leading-6 whitespace-pre-wrap">
                      {project.project.description}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">
                      Este proyecto no tiene descripción.
                    </p>
                  )}
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <ProjectMembersDisplay projectId={projectId} />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <QuestionMachineSidebar
        sections={
          mandala?.mandala.configuration.dimensions.map((dim) => dim.name) || []
        }
        scales={mandala?.mandala.configuration.scales || []}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
        mandalaId={mandalaId}
        organizationId={organizationId}
        projectId={projectId}
        tags={tags}
        onNewTag={handleNewTag}
        onCreatePostIt={handleCreatePostIt}
        dimensionsMandala={mandala?.mandala.configuration.dimensions || []}
      />

      <div className="relative w-full h-full border rounded-lg overflow-hidden bg-white">
        {mandala && (
          <>
            <FiltersModal
              isOpen={isFiltersOpen}
              onOpenChange={setIsFiltersOpen}
              onApplyFilters={(filters) => setAppliedFilters(filters)}
              mandalaId={mandalaId}
              projectId={projectId}
            />
            <TransformWrapper
              initialScale={0.5}
              minScale={0.3}
              maxScale={100}
              centerOnInit={true}
              limitToBounds={false}
              wheel={{ disabled: isDraggingPostIt }}
              pinch={{ disabled: isDraggingPostIt }}
              doubleClick={{ disabled: true }}
              panning={{ disabled: isDraggingPostIt || isHoveringPostIt }}
              initialPositionX={0}
              initialPositionY={0}
              onPanningStart={() => setIsPanning(true)}
              onPanningStop={() => setIsPanning(false)}
              onTransformed={(ref) => {
                setState({ ...ref.state });
              }}
            >
              {() => (
                <>
                  {/* Controles superiores izquierdos */}
                  <div className="absolute top-4 left-4 flex gap-10 z-20 flex-col">
                    <div className="flex flex-col gap-2">
                      {mandala.mandala.type === "CHARACTER" && (
                        <Button
                          variant="filled"
                          color="primary"
                          onClick={() => setIsSidebarOpen(true)}
                          icon={<Sparkles size={16} />}
                        >
                          Herramientas IA
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
                    {mandala?.mandala.type === "OVERLAP" && (
                      <ViewToggle
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                      />
                    )}
                  </div>

                  {/* Controles superiores derechos */}
                  <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
                    {/* Toggle de vista - solo visible para mandalas unificadas */}

                    <Button
                      variant="filled"
                      color="primary"
                      icon={<Filter size={16} />}
                      onClick={() => setIsFiltersOpen(true)}
                    >
                      Filtros
                    </Button>
                    <Button
                      variant="filled"
                      color="primary"
                      icon={<FileText size={16} />}
                      onClick={() => setIsFilesDrawerOpen(true)}
                    >
                      Archivos
                    </Button>
                    <Button
                      variant="filled"
                      color="primary"
                      icon={<Download size={16} />}
                      onClick={() =>
                        downloadSVG(`${mandala?.mandala.name ?? "mandala"}.svg`)
                      }
                    >
                      SVG
                    </Button>
                  </div>

                  <div className="absolute bottom-26 right-4 z-20">
                    <CharacterDropdown
                      characters={
                        mandala.mandala.type === "OVERLAP" ||
                        mandala.mandala.type === "OVERLAP_SUMMARY"
                          ? mandala.mandala.configuration.center.characters ??
                            []
                          : projectCharacters
                      }
                      onAdd={
                        mandala.mandala.type === "OVERLAP" ||
                        mandala.mandala.type === "OVERLAP_SUMMARY"
                          ? undefined
                          : linkCharacter
                      }
                    />
                  </div>

                  {/* Mostrar botones/controles:
                      - siempre para mandalas NO unificadas
                      - para unificadas, solo en vista 'unified' */}
                  {(mandala.mandala.type === "CHARACTER" ||
                    viewMode === "overlap") && (
                    <>
                      {mandala.mandala.type !== "OVERLAP_SUMMARY" && (
                        <Buttons
                          onCreatePostIt={handleCreatePostIt}
                          onCreateCharacter={handleCreateCharacter}
                          currentMandalaId={mandalaId}
                          onNewTag={handleNewTag}
                          tags={tags}
                          loading={isCreatingCharacter}
                        />
                      )}
                      <ZoomControls />
                    </>
                  )}

                  {/* Contenido principal - alternar entre vistas en unificadas */}
                  {mandala.mandala.type === "OVERLAP" && viewMode === "all" ? (
                    // Vista "all": todas las mandalas en un único canvas Konva
                    <TransformComponent
                      wrapperStyle={{
                        width: "100%",
                        height: "100%",
                        cursor: isPanning ? "grabbing" : "grab",
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                      contentStyle={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <MultiKonvaContainer
                          unified={mandala}
                          sourceMandalaIds={sourceMandalaIds}
                          appliedFilters={
                            /* en vista all se pueden aplicar filtros también */
                            // si querés desactivarlos aquí, pasa {}.
                            // dejamos los aplicados para preservar ambos commits.
                            appliedFilters
                          }
                          onPostItUpdate={updatePostit}
                          onCharacterUpdate={updateCharacter}
                          onPostItDelete={deletePostit}
                          onCharacterDelete={(id: string) =>
                            handleDeleteCharacter(parseInt(id))
                          }
                          onPostItChildCreate={(
                            content: string,
                            tags: Tag[],
                            postitFatherId?: string
                          ) => {
                            createPostit(
                              {
                                content,
                                coordinates: {
                                  x: 0,
                                  y: 0,
                                  angle: 0,
                                  percentileDistance: 0,
                                },
                                tags,
                                dimension: "Gobierno",
                                section: "Institución",
                                childrens: [],
                              },
                              postitFatherId
                            );
                          }}
                          state={state}
                          onMouseEnter={() => setIsHoveringPostIt(true)}
                          onMouseLeave={() => setIsHoveringPostIt(false)}
                          onDragStart={() => setIsDraggingPostIt(true)}
                          onDragEnd={() => setIsDraggingPostIt(false)}
                          tags={tags}
                          onNewTag={handleNewTag}
                        />
                      </div>
                    </TransformComponent>
                  ) : (
                    // Vista unificada "normal" o cualquier mandala no unificada
                    <TransformComponent
                      wrapperStyle={{
                        width: "100%",
                        height: "100%",
                        cursor: isPanning ? "grabbing" : "grab",
                        position: "absolute",
                        top: 0,
                        left: 0,
                      }}
                      contentStyle={{
                        width: "100%",
                        height: "100%",
                        position: "relative",
                      }}
                    >
                      <div className="relative w-full h-full flex items-center justify-center">
                        <Mandala
                          mandala={mandala}
                          scale={1}
                          position={{ x: 0, y: 0 }}
                        />
                        <KonvaContainer
                          mandala={mandala}
                          onCharacterUpdate={updateCharacter}
                          onPostItUpdate={updatePostit}
                          onImageUpdate={updateImage}
                          onImageDelete={deleteImage}
                          onPostItChildCreate={(
                            content: string,
                            tags: Tag[],
                            postitFatherId?: string
                          ) => {
                            createPostit(
                              {
                                content,
                                coordinates: {
                                  x: 0,
                                  y: 0,
                                  angle: 0,
                                  percentileDistance: 0,
                                },
                                tags,
                                dimension: "Gobierno",
                                section: "Institución",
                                childrens: [],
                              },
                              postitFatherId
                            );
                          }}
                          onMouseEnter={() => setIsHoveringPostIt(true)}
                          onMouseLeave={() => setIsHoveringPostIt(false)}
                          onDragStart={() => setIsDraggingPostIt(true)}
                          onDragEnd={() => setIsDraggingPostIt(false)}
                          appliedFilters={appliedFilters}
                          onPostItDelete={deletePostit}
                          onCharacterDelete={(id: string) =>
                            handleDeleteCharacter(parseInt(id))
                          }
                          tags={tags}
                          onNewTag={handleNewTag}
                          state={state}
                        />
                      </div>
                    </TransformComponent>
                  )}
                </>
              )}
            </TransformWrapper>
            {/* SVG oculta para exportación */}
            <div
              style={{
                position: "absolute",
                width: 0,
                height: 0,
                overflow: "hidden",
              }}
            >
              {mandala && (
                <MandalaSVG
                  ref={svgRef}
                  mandala={mandala}
                  postsAbs={postsAbs}
                  charsAbs={charsAbs}
                  imagesAbs={imagesAbs}
                />
              )}
            </div>
          </>
        )}
      </div>

      <FilesDrawer
        open={isFilesDrawerOpen}
        onClose={() => setIsFilesDrawerOpen(false)}
        title="Archivos de la mandala"
        scope="mandala"
        id={mandalaId}
      />
    </div>
  );
};

export default MandalaContainer;
