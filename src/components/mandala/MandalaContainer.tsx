import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Mandala from "./Mandala";
import KonvaContainer from "./KonvaContainer";
import ZoomControls from "./ZoomControls";
import useMandala from "@/hooks/useMandala";
import Loader from "../common/Loader";
import { useParams } from "react-router-dom";
import FilePopOver from "@/components/file/FilePopOver";

interface MandalaContainerProps {
  mandalaId: string;
}

const MandalaContainer: React.FC<MandalaContainerProps> = ({ mandalaId }) => {
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingPostIt, setIsDraggingPostIt] = useState(false);
  const [isHoveringPostIt, setIsHoveringPostIt] = useState(false);
  const { projectId } = useParams<{ projectId: string }>();

  const { mandala, loading, error, createPostit, updatePostit } =
    useMandala(mandalaId);

  const handleCreatePostIt = () => {
    createPostit({
      content: "New Post-It",
      coordinates: { x: 0.5, y: 0.5, angle: 0, percentileDistance: 0 },
      dimension: "small",
      section: "ecology",
    });
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
        Error al cargar el mandala
      </div>
    );
  }

  return (
    <div className="relative w-full h-screen border rounded-lg overflow-hidden bg-white">
      {mandala && (
        <TransformWrapper
          initialScale={0.5}
          minScale={0.3}
          maxScale={4}
          centerOnInit={true}
          limitToBounds={true}
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
              <div className="absolute top-4 left-4 flex gap-2 z-20">
                {projectId && <FilePopOver projectId={projectId} />}
              </div>

              <ZoomControls onCreatePostIt={handleCreatePostIt} />
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
                <div className="relative flex items-center justify-center w-full h-full">
                  <div className="relative w-full h-full flex items-center justify-center">
                    {/* Fondo del mandala (puede seguir usando coordenadas absolutas si querés centrarlo) */}
                    <div className="absolute inset-0 z-0 pointer-events-none">
                      <Mandala scale={1} position={{ x: 0, y: 0 }} />
                    </div>
                    {/* Konva container en tamaño completo y responsive */}
                    <div className="absolute inset-0 z-10">
                      <KonvaContainer
                        mandala={mandala}
                        onPostItUpdate={updatePostit}
                        onMouseEnter={() => setIsHoveringPostIt(true)}
                        onMouseLeave={() => setIsHoveringPostIt(false)}
                        onDragStart={() => setIsDraggingPostIt(true)}
                        onDragEnd={() => setIsDraggingPostIt(false)}
                      />
                    </div>
                  </div>
                </div>
              </TransformComponent>
            </>
          )}
        </TransformWrapper>
      )}
    </div>
  );
};

export default MandalaContainer;
