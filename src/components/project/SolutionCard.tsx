/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useMemo } from "react";
import { BarChart2 } from "lucide-react";
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

interface SolutionCardProps {
  solution: Solution;
}

export default function SolutionCard({ solution }: SolutionCardProps) {
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

  // Normaliza el retorno de imágenes: admite array o string con URLs separadas por coma/espacio/nueva línea
  const images: string[] = useMemo(() => {
    if (!solutionImages) return [];
    if (Array.isArray(solutionImages)) return solutionImages.filter(Boolean);
    return String(solutionImages)
      .split(/[\n,\s]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
  }, [solutionImages]);

  return (
    <div className="bg-white border border-gray-200 rounded-[8px] p-6 w-full min-w-0">
      <h3 className="text-xl font-bold text-gray-900 mb-2">{solution.title}</h3>

      {solution.description && (
        <p className="text-gray-700 text-base mb-5">{solution.description}</p>
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
            <BarChart2 className={`h-5 w-5 mt-1 flex-shrink-0 ${iconColor}`} />
            <div>
              <p className="text-gray-700 text-base leading-relaxed">
                {impactDescription}
              </p>
            </div>
          </div>
        </div>
      )}

      {solution.provocations?.length > 0 && (
        <div>
          <h4 className="text-lg font-semibold text-gray-900 mb-2">
            Provocaciones relacionadas
          </h4>
          <div className="flex flex-wrap gap-2">
            {solution.provocations.slice(0, 4).map((prov, i) => (
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

      {/* Carrusel de imágenes */}
      <div className="mt-6 min-w-0">
        {initialLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="w-full h-40 rounded-md" />
            ))}
          </div>
        ) : error ? (
          <p className="text-sm text-red-600">
            Ocurrió un error al cargar las imágenes.
          </p>
        ) : images.length > 0 ? (
          <Carousel className="w-full max-w-full overflow-hidden min-w-0">
            <CarouselContent className="-ml-1">
              {images.map((url, idx) => (
                <CarouselItem
                  key={`${url}-${idx}`}
                  className="pl-1 basis-full sm:basis-1/2 lg:basis-1/3"
                >
                  <div className="p-1">
                    <AspectRatio
                      ratio={16 / 9}
                      className="bg-muted rounded-md overflow-hidden"
                    >
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block h-full w-full"
                        aria-label={`Abrir imagen ${
                          idx + 1
                        } en una nueva pestaña`}
                      >
                        <img
                          src={url}
                          alt={`solution-${solution.id}-${idx}`}
                          className="h-full w-full object-cover rounded-md cursor-pointer"
                          loading="lazy"
                          draggable={false}
                        />
                      </a>
                    </AspectRatio>
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious />
            <CarouselNext />
          </Carousel>
        ) : (
          <p className="text-sm text-gray-500">
            Aún no hay imágenes para esta solución.
          </p>
        )}
      </div>

      {actionItems.length > 0 && (
        <ActionItemsSection actionItems={actionItems} />
      )}
    </div>
  );
}
