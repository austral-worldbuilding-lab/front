import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Mandala from "./Mandala";
import KonvaContainer from "./KonvaContainer";
import ZoomControls from "./ZoomControls";
import useMandala from "@/hooks/useMandala";
import Loader from "../common/Loader";
import { Link, useParams } from "react-router-dom";
import FilePopOver from "@/components/file/FilePopOver";
import { ArrowLeftIcon } from "lucide-react";

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
      coordinates: { x: 0, y: 0, angle: 0, percentileDistance: 0 },
      dimension: "Gobierno",
      section: "Institución",
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
              <div className="absolute top-4 left-4 flex gap-10 z-20">
                <Link
                  to={`/app/project/${projectId}/mandalas`}
                  className="flex items-center gap-2"
                >
                  <ArrowLeftIcon className="w-5 h-5" />
                  Volver
                </Link>
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
                <div className="relative w-full h-full flex items-center justify-center">
                  <Mandala scale={1} position={{ x: 0, y: 0 }} />
                  <KonvaContainer
                    mandala={mandala}
                    onPostItUpdate={updatePostit}
                    onMouseEnter={() => setIsHoveringPostIt(true)}
                    onMouseLeave={() => setIsHoveringPostIt(false)}
                    onDragStart={() => setIsDraggingPostIt(true)}
                    onDragEnd={() => setIsDraggingPostIt(false)}
                  />
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
