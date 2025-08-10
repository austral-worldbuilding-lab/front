import { useState } from "react";
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
import { ArrowLeftIcon, Filter, Sparkles } from "lucide-react";
import Buttons from "./Buttons";
import { useCreateMandala } from "@/hooks/useCreateMandala.ts";
import { Tag } from "@/types/mandala";
import { Button } from "../ui/button";
import FiltersModal from "./filters/FiltersModal";
import { useTags } from "@/hooks/useTags";
import { useProjectCharacters } from "../../hooks/useProjectCharacters";
import CharacterDropdown from "./characters/modal/CharacterDropdown";
import BreadcrumbMandala from "@/components/mandala/BreadcrumbMandala.tsx";
import QuestionMachineSidebar from "./sidebar/QuestionMachineSidebar";

interface MandalaContainerProps {
  mandalaId: string;
}

const MandalaContainer: React.FC<MandalaContainerProps> = ({ mandalaId }) => {
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingPostIt, setIsDraggingPostIt] = useState(false);
  const [isHoveringPostIt, setIsHoveringPostIt] = useState(false);
  const [state, setState] = useState<ReactZoomPanPinchState | null>(null);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const projectId = useParams<{ projectId: string }>().projectId!;
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string[]>
  >({});
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
  } = useMandala(mandalaId);
  const { createMandala } = useCreateMandala(projectId);

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

  const handleCreatePostIt = (content: string, tags: Tag[]) => {
    createPostit({
      content: content,
      coordinates: { x: 0, y: 0, angle: 0, percentileDistance: 0 },
      dimension: "Gobierno",
      section: "Institución",
      tags: tags || null,
      childrens: [],
    });
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
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 cursor-pointer"
          variant="text"
          color="primary"
          icon={<ArrowLeftIcon className="w-5 h-5" />}
        >
          Atrás
        </Button>
        <div className="absolute left-1/2 -translate-x-1/2 z-1000">
          <p className="text-lg text-black font-bold">
            {mandala?.mandala.name}
          </p>
        </div>
      </div>
      <QuestionMachineSidebar
        sections={
          mandala?.mandala.configuration.dimensions.map((dim) => dim.name) || []
        }
        scales={mandala?.mandala.configuration.scales || []}
        open={isSidebarOpen}
        onOpenChange={setIsSidebarOpen}
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
                  <div className="absolute top-4 left-4 flex gap-10 z-20 flex-col">
                    <div className="flex flex-col gap-2">
                      <CharacterDropdown
                        characters={projectCharacters}
                        onAdd={linkCharacter}
                      />
                      <Button
                        variant="filled"
                        color="primary"
                        onClick={() => setIsSidebarOpen(true)}
                        icon={<Sparkles size={16} />}
                      >
                        Herramientas IA
                      </Button>
                    </div>
                  </div>
                  <div className="absolute top-4 right-4 z-20">
                    <Button
                      variant="filled"
                      color="primary"
                      icon={<Filter size={16} />}
                      onClick={() => setIsFiltersOpen(true)}
                    >
                      Filtros
                    </Button>
                  </div>
                  <Buttons
                    onCreatePostIt={handleCreatePostIt}
                    onCreateCharacter={handleCreateCharacter}
                    currentMandalaId={mandalaId}
                    onNewTag={handleNewTag}
                    tags={tags}
                  />
                  <ZoomControls />
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
                </>
              )}
            </TransformWrapper>
          </>
        )}
      </div>
    </div>
  );
};

export default MandalaContainer;
