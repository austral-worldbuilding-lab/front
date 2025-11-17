/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import {BarChart2, MoreVertical, Pencil, Trash2} from "lucide-react";
import { Solution } from "@/types/mandala";
import GenerarButton from "../ui/GenerarButton";
import { Skeleton } from "@/components/ui/skeleton";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import ActionItemsSection from "./ActionItemSection";
import useActionItems from "@/hooks/useActionItems";
import { useParams } from "react-router-dom";
import { useSolutionImages } from "@/hooks/useSolutionImages";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuContent,
} from "@/components/ui/dropdown-menu";
import ConfirmationDialog from "@/components/common/ConfirmationDialog.tsx";
import useDeleteSolution from "@/hooks/useDeleteSolution.ts";

interface SolutionCardProps {
  solution: Solution;
  onDeleteSuccess?: () => void;
  onEditClick?: (solution: Solution) => void;
}

export default function SolutionCard({ solution, onDeleteSuccess, onEditClick }: SolutionCardProps) {
  const { projectId } = useParams<{ projectId: string }>();
  const { actionItems, loading, generateActionItems } = useActionItems(
      projectId!,
      solution.id
  );
  const [hasGenerated, setHasGenerated] = useState(false);

  const {
    loading: imagesLoading,
    error,
    generateSolutionImage,
    initialLoading,
    solutionImages,
  } = useSolutionImages(projectId!, solution.id);

  const {
    deleteSolutionById,
    loading: deleteLoading,
  } = useDeleteSolution();

  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleDelete = async () => {
    try {
      await deleteSolutionById(solution.id);
      onDeleteSuccess?.();
      setShowDeleteModal(false);
    } catch (err) {
      console.error("Error al eliminar:", err);
    }
  };

  const impactLevel =
    solution.impact?.level?.toLowerCase?.() ||
    (solution as any).impactLevel?.toLowerCase?.() ||
    "medium";

  const impactDescription =
    solution.impact?.description ||
    (solution as any).impactDescription ||
    "Sin descripción de impacto";

  const impactColors: Record<"low" | "medium" | "high", string> = {
    low: "text-green-500",
    medium: "text-yellow-500",
    high: "text-red-500",
  };

  const iconColor = impactColors[impactLevel as "low" | "medium" | "high"];

  const handleGenerate = async () => {
    await generateActionItems();
    setHasGenerated(true);
  };

  const displayedActionItems = actionItems.length > 0
      ? actionItems
      : solution.actionItems || [];

  const images: string[] = useMemo(() => {
    if (!solutionImages) return [];
    if (Array.isArray(solutionImages)) return solutionImages.filter(Boolean);
    return String(solutionImages)
        .split(/[\n,\s]+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
  }, [solutionImages]);

  return (
        <div className="relative bg-white border border-gray-200 rounded-[8px] p-6 w-full min-w-0">
          <div className="absolute top-4 right-4">
            <DropdownMenu>
              <DropdownMenuTrigger>
                <MoreVertical className="h-5 w-5 text-gray-600 cursor-pointer"/>
              </DropdownMenuTrigger>

              <DropdownMenuContent align="end" className="min-w-[180px] bg-white">
                <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => onEditClick?.(solution)}
                >
                  <Pencil className="h-4 w-4 mr-2"/>
                  Editar solución
                </DropdownMenuItem>

                <DropdownMenuItem
                    className="text-red-600 cursor-pointer"
                    onClick={() => setShowDeleteModal(true)}
                >
                  <Trash2 className="h-4 w-4 mr-2 text-red-600"/>
                  Eliminar solución
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {solution.title}
          </h3>

          {solution.description && (
              <p className="text-gray-700 text-base mb-5">
                {solution.description}
              </p>
          )}

          {solution.problem && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Problema</h4>
                <p className="text-gray-700 text-base leading-relaxed">
                  {solution.problem}
                </p>
              </div>
          )}

          {impactDescription && (
              <div className="mb-4">
                <h4 className="text-lg font-semibold text-gray-900 mb-1">Impacto</h4>
                <div className="flex items-start gap-2">
                  <BarChart2 className={`h-5 w-5 mt-1 flex-shrink-0 ${iconColor}`}/>
                  <div>
                    <p className="text-gray-700 text-base leading-relaxed">
                      {impactDescription}
                    </p>
                  </div>
                </div>
              </div>
          )}

          {solution.provocations && solution.provocations.length > 0 && (
              <div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  Provocaciones relacionadas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {solution.provocations?.slice(0, 4).map((prov, i) => (
                      <div
                          key={i}
                          className="bg-gray-200 text-gray-800 text-sm italic px-3 py-1 rounded-full"
                      >
                        {prov}
                      </div>
                  ))}
                </div>
              </div>
          )}

          {/* Botones: generar plan + generar imágenes */}
          <div className="mt-6 flex items-center gap-3">
            <GenerarButton
                text={hasGenerated ? "Regenerar Plan de Acción" : "Generar Plan de Acción"}
                loading={loading}
                disabled={loading}
                onClick={handleGenerate}
            />
            <GenerarButton
                text="Generar imágenes"
                loading={imagesLoading}
                disabled={imagesLoading}
                onClick={generateSolutionImage}
            />
          </div>

          <div className="mt-6 min-w-0">
            {initialLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {[...Array(3)].map((_, i) => (
                      <Skeleton key={i} className="w-full h-40 rounded-md"/>
                  ))}
                </div>
            ) : error ? (
                <p className="text-sm text-red-600">Ocurrió un error al cargar las imágenes.</p>
            ) : images.length ? (
                <Carousel className="w-full max-w-full overflow-hidden min-w-0">
                  <CarouselContent className="-ml-1">
                    {images.map((url, idx) => (
                        <CarouselItem
                            key={idx}
                            className="pl-1 basis-full sm:basis-1/2 lg:basis-1/3"
                        >
                          <div className="p-1">
                            <AspectRatio ratio={16 / 9} className="rounded-md overflow-hidden">
                              <img
                                  src={url}
                                  alt={`solution-${solution.id}-${idx}`}
                                  className="h-full w-full object-cover rounded-md"
                                  loading="lazy"
                              />
                            </AspectRatio>
                          </div>
                        </CarouselItem>
                    ))}
                  </CarouselContent>
                  <CarouselPrevious/>
                  <CarouselNext/>
                </Carousel>
            ) : (
                <p className="text-sm text-gray-500">Aún no hay imágenes para esta solución.</p>
            )}
          </div>

          {displayedActionItems.length > 0 && (
              <ActionItemsSection actionItems={displayedActionItems}/>
          )}

          <ConfirmationDialog
              key={showDeleteModal ? "open" : "closed"}
              isOpen={showDeleteModal}
              onOpenChange={setShowDeleteModal}
              title="Eliminar solución"
              description="¿Estás segura/o de que querés eliminar esta solución? Esta acción no se puede deshacer."
              confirmText="Eliminar"
              cancelText="Cancelar"
              isDanger
              loading={deleteLoading}
              onConfirm={handleDelete}
          />
        </div>
        );
        }
