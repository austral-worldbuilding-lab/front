import { useRef, useState, useEffect } from "react";
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
  InfoIcon,
  Sparkles,
} from "lucide-react";
import Buttons from "./Buttons";
import { useCreateMandala } from "@/hooks/useCreateMandala.ts";
import { Tag } from "@/types/mandala";
import { Button } from "../ui/button";
import FiltersDropdowns from "./filters/FiltersDropdowns";
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
import SupportButton from "./SupportButton";
import { useGenerateSummary } from "@/hooks/useGenerateSummary";
import {
  generateOverlapReportPDF,
  generateNormalMandalaReportPDF,
} from "@/components/download/GeneradorDePDF.tsx";
import {
  useOverlapReport,
  useNormalMandalaReport,
} from "@/hooks/useReport.tsx";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getOrganizationById } from "@/services/organizationService";

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
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFilesDrawerOpen, setIsFilesDrawerOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"overlap" | "all">("overlap");
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string[]>
  >({});
  const [orgName, setOrgName] = useState<string>("");

  useEffect(() => {
    if (organizationId) {
      getOrganizationById(organizationId)
        .then((org) => setOrgName(org.name))
        .catch(() => setOrgName("Organización desconocida"));
    }
  }, [organizationId]);

  const projectId = useParams<{ projectId: string }>().projectId!;
  const { characters: projectCharacters, linkCharacter, refetch: refetchCharacters } =
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
    setEditingUser,
    removeEditingUser,
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

  // Hooks específicos según el tipo de mandala
  const { report: overlapReport, loading: overlapReportLoading } =
    useOverlapReport(projectId, mandalaId);
  const { report: normalReport, loading: normalReportLoading } =
    useNormalMandalaReport(projectId, mandalaId);
  const { generateSummary, loading: generatingReport } = useGenerateSummary();
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);

  // Determinar qué tipo de reporte usar según el tipo de mandala
  const isOverlapMandala = mandala?.mandala.type === "OVERLAP_SUMMARY";
  const report = isOverlapMandala ? overlapReport : normalReport;
  const reportLoading = isOverlapMandala
    ? overlapReportLoading
    : normalReportLoading;

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
      const from = p.from;
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
    mandalaType: "CHARACTER" | "CONTEXT";
  }) => {
    await createMandala(
      character.name,
      character.description,
      character.color,
      character.useAIMandala,
      character.dimensions,
      character.scales,
      character.parentId,
      character.mandalaType
    );
  };

  const handleCreatePostIt = (
    content: string,
    tags: Tag[],
    postItFatherId?: string,
    dimension?: string,
    section?: string
  ) => {
    createPostit(
      {
        content: content,
        coordinates: { x: 0, y: 0, angle: 0, percentileDistance: 0 },
        dimension: dimension || "Gobierno",
        section: section || "Institución",
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

  const handleDeleteCharacter = async (characterId: string) => {
    try {
      await deleteCharacter(characterId);
      // Refetch available characters after unlinking
      await refetchCharacters();
    } catch (e) {
      console.error("Error al eliminar el personaje:", e);
    }
    return true;
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

  const handleDownloadReport = () => {
    if (!report) return;

    if (isOverlapMandala && overlapReport) {
      // Para mandalas comparadas (OVERLAP_SUMMARY) - reporte complejo
      generateOverlapReportPDF(
        overlapReport,
        `${mandala?.mandala.name ?? "mandala"}-reporte-comparado.pdf`
      );
    } else if (!isOverlapMandala && normalReport) {
      // Para mandalas normales - reporte simple (string)
      generateNormalMandalaReportPDF(
        normalReport,
        `${mandala?.mandala.name ?? "mandala"}-reporte.pdf`
      );
    }
  };

  const handleGenerateSummary = async () => {
    const success = await generateSummary(mandalaId);
    if (success) {
      setShowGenerateDialog(false);
    }
  };

  return (
    <div className="overflow-hidden h-screen">
      <BreadcrumbMandala />
      <div className="w-full bg-white flex items-center relative overflow-hidden">
        <Button
          onClick={() =>
            navigate(
              `/app/organization/${organizationId}/projects/${projectId}`
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
        {/* Botones según el tipo de mandala */}
        <div className="ml-auto pr-4 flex gap-2">
          {/* Para mandalas comparadas (OVERLAP_SUMMARY) - solo descarga */}
          {isOverlapMandala && report && !reportLoading && (
            <Button
              variant="outline"
              color="primary"
              size="sm"
              icon={<Download size={16} />}
              onClick={handleDownloadReport}
            >
              Reporte Comparado
            </Button>
          )}

          {/* Para mandalas normales - generar y descargar */}
          {!isOverlapMandala && (
            <>
              {report && !reportLoading && (
                <Button
                  variant="outline"
                  color="primary"
                  size="sm"
                  icon={<Download size={16} />}
                  onClick={handleDownloadReport}
                >
                  Resumen
                </Button>
              )}

              <Button
                variant="outline"
                color="primary"
                size="sm"
                icon={<Sparkles size={16} />}
                onClick={() => setShowGenerateDialog(true)}
                loading={generatingReport}
                disabled={generatingReport}
              >
                {report ? "Regenerar resumen" : "Generar resumen"}
              </Button>
            </>
          )}

          <Button
            variant="outline"
            color="primary"
            size="sm"
            icon={<Download size={16} />}
            onClick={() =>
              downloadSVG(`${mandala?.mandala.name ?? "mandala"}.svg`)
            }
          >
            SVG
          </Button>
          <Button
            variant="outline"
            color="primary"
            size="sm"
            icon={<FileText size={16} />}
            onClick={() => setIsFilesDrawerOpen(true)}
          >
            Archivos
          </Button>
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
                  <div className="absolute top-4 left-4 flex gap-10 z-20 flex-col"></div>

                  <div className="absolute top-14 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
                    {mandala?.mandala.type === "OVERLAP" && (
                      <ViewToggle
                        viewMode={viewMode}
                        onViewModeChange={setViewMode}
                      />
                    )}
                  </div>

                  <div className="absolute top-4 right-4 z-20 flex items-center gap-4">
                    <FiltersDropdowns
                      mandalaId={mandalaId}
                      projectId={projectId}
                      onApplyFilters={(filters) => setAppliedFilters(filters)}
                    />

                    {(mandala.mandala.type === "CHARACTER" ||
                      mandala.mandala.type == "CONTEXT") && (
                      <Button
                        variant="filled"
                        color="primary"
                        onClick={() => setIsSidebarOpen(true)}
                        icon={<Sparkles size={16} />}
                      >
                        IA
                      </Button>
                    )}
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

                  {(mandala.mandala.type === "CHARACTER" ||
                    mandala.mandala.type === "CONTEXT") && (
                    <Buttons
                      onCreatePostIt={handleCreatePostIt}
                      onCreateCharacter={handleCreateCharacter}
                      currentMandalaId={mandalaId}
                      onNewTag={handleNewTag}
                      tags={tags}
                      loading={isCreatingCharacter}
                    />
                  )}
                  <ZoomControls scale={state?.scale} />
                  <SupportButton />

                  {/* UNA SOLA LLAMADA a MultiKonvaContainer para OVERLAP */}
                  {mandala.mandala.type === "OVERLAP" ? (
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
                          sourceMandalaIds={sourceMandalaIds}
                          appliedFilters={appliedFilters}
                          onPostItUpdate={updatePostit}
                          onCharacterUpdate={updateCharacter}
                          onPostItDelete={deletePostit}
                          onCharacterDelete={handleDeleteCharacter}
                          onPostItChildCreate={(
                            content: string,
                            tags: Tag[],
                            postItFatherId?: string
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
                              postItFatherId
                            );
                          }}
                          state={state}
                          onMouseEnter={() => setIsHoveringPostIt(true)}
                          onMouseLeave={() => setIsHoveringPostIt(false)}
                          onDragStart={(postitId) => {
                            setIsDraggingPostIt(true);
                            setEditingUser(postitId);
                          }}
                          onDragEnd={(postitId) => {
                            setIsDraggingPostIt(false);
                            removeEditingUser(postitId);
                          }}
                          tags={tags}
                          onNewTag={handleNewTag}
                          onDblClick={setEditingUser}
                          onBlur={removeEditingUser}
                          onContextMenu={setEditingUser}
                          hidePreviews={viewMode !== "all"} // ← una sola llamada
                        />
                      </div>
                    </TransformComponent>
                  ) : (
                    // Mandala NO unificada (CHARACTER, etc.) — se mantiene igual
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
                            postItFatherId?: string
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
                              postItFatherId
                            );
                          }}
                          onMouseEnter={() => setIsHoveringPostIt(true)}
                          onMouseLeave={() => setIsHoveringPostIt(false)}
                          onDragStart={(postitId) => {
                            setIsDraggingPostIt(true);
                            setEditingUser(postitId);
                          }}
                          onDragEnd={(postitId) => {
                            setIsDraggingPostIt(false);
                            removeEditingUser(postitId);
                          }}
                          appliedFilters={appliedFilters}
                          onPostItDelete={deletePostit}
                          onCharacterDelete={handleDeleteCharacter}
                          tags={tags}
                          onNewTag={handleNewTag}
                          state={state}
                          onDblClick={setEditingUser}
                          onBlur={removeEditingUser}
                          onContextMenu={setEditingUser}
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
        organizationName={orgName}
        projectName={project.project?.name}
      />

      {/* Modal de confirmación para generar resumen - solo para mandalas normales */}
      {!isOverlapMandala && (
        <AlertDialog
          open={showGenerateDialog}
          onOpenChange={setShowGenerateDialog}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                {normalReport
                  ? "¿Regenerar resumen de esta mandala?"
                  : "¿Generar resumen de esta mandala?"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                El sistema generará un resumen mediante IA según el estado
                actual de la mandala. Este proceso puede tardar unos segundos.
                {normalReport &&
                  " El resumen existente será reemplazado por uno nuevo."}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={generatingReport}>
                Cancelar
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleGenerateSummary}
                disabled={generatingReport}
                className="bg-primary hover:bg-primary/90"
              >
                {generatingReport ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generando...</span>
                  </div>
                ) : (
                  "Confirmar generación"
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default MandalaContainer;
