import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Mandala from "./Mandala";
import KonvaContainer from "./KonvaContainer";
import ZoomControls from "./ZoomControls";
import useMandala from "@/hooks/useMandala";
import Loader from "../common/Loader";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeftIcon, Filter } from "lucide-react";
import Buttons from "./Buttons";
import { useCreateMandala } from "@/hooks/useCreateMandala.ts";
import { Tag } from "./postits/SelectTags";
import { Button } from "../ui/button";
import FiltersModal from "./filters/FiltersModal";

interface MandalaContainerProps {
  mandalaId: string;
}

const MandalaContainer: React.FC<MandalaContainerProps> = ({ mandalaId }) => {
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingPostIt, setIsDraggingPostIt] = useState(false);
  const [isHoveringPostIt, setIsHoveringPostIt] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<Record<string, string[]>>({});
  const navigate = useNavigate();
  const {
    mandala,
    loading,
    error,
    createPostit,
    updatePostit,
    updateCharacter,
  } = useMandala(mandalaId);

  const projectId = useParams<{ projectId: string }>().projectId!;
  const { createMandala } = useCreateMandala(projectId);

  const handleCreateCharacter = async (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
    dimensions: { name: string; color?: string }[];
    scales: string[];
    linkedToId?: string;
  }) => {
    await createMandala(
      character.name,
      character.description,
      character.color,
      character.useAIMandala,
      character.dimensions,
      character.scales,
      character.linkedToId
    );
  };

  const handleCreatePostIt = () => {
    createPostit({
      content: "New Post-It",
      coordinates: { x: 0, y: 0, angle: 0, percentileDistance: 0 },
      dimension: "Gobierno",
      section: "Institución",
    });
  };

  // TODO: Get tags from backend
  const [tags, setTags] = useState<Tag[]>([
    { label: "Comedor", value: "comedor", color: "#ff0000" },
    { label: "Aula", value: "aula", color: "#ffa500" },
    { label: "Campus", value: "campus", color: "#0000ff" },
  ]);

  // TODO: Create tag in backend
  const handleNewTag = (tag: Tag) => {
    setTags([...tags, tag]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center w-screen h-screen">
        <Loader size="large" text="Loading mandala..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center w-full h-full text-red-500">
        Error loading mandala
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen border rounded-lg overflow-hidden bg-white">
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
            maxScale={4}
            centerOnInit={true}
            limitToBounds={false}
            wheel={{ disabled: isDraggingPostIt || isHoveringPostIt }}
            pinch={{ disabled: isDraggingPostIt || isHoveringPostIt }}
            doubleClick={{ disabled: true }}
            panning={{ disabled: isDraggingPostIt || isHoveringPostIt }}
            initialPositionX={0}
            initialPositionY={0}
            onPanningStart={() => setIsPanning(true)}
            onPanningStop={() => setIsPanning(false)}
          >
            {() => (
              <>
                <div className="absolute top-4 left-4 flex gap-10 z-20 flex-col">
                  <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <ArrowLeftIcon className="w-5 h-5" />
                    Back
                  </button>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      icon={<Filter size={16} />}
                      onClick={() => setIsFiltersOpen(true)}
                    >
                      Filters
                    </Button>
                  </div>
                </div>
                <div className="absolute top-4 left-1/2 -translate-x-1/2 z-1000">
                  <p className="text-lg text-black font-bold">
                    {mandala.mandala.name}
                  </p>
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
                    <Mandala scale={1} position={{ x: 0, y: 0 }} />
                    <KonvaContainer
                        mandala={mandala}
                        onCharacterUpdate={updateCharacter}
                        onPostItUpdate={updatePostit}
                        onMouseEnter={() => setIsHoveringPostIt(true)}
                        onMouseLeave={() => setIsHoveringPostIt(false)}
                        onDragStart={() => setIsDraggingPostIt(true)}
                        onDragEnd={() => setIsDraggingPostIt(false)}
                        appliedFilters={appliedFilters}
                    />
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </>
      )}
    </div>
  );
};

export default MandalaContainer;
