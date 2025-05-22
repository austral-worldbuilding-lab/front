import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Mandala from "./Mandala";
import KonvaContainer from "./KonvaContainer";
import ZoomControls from "./ZoomControls";
import useMandala from "@/hooks/useMandala";
import Loader from "../common/Loader";
import FileList from "@/components/project/FileList";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";


interface MandalaContainerProps {
  mandalaId: string;
}

const MandalaContainer: React.FC<MandalaContainerProps> = ({ mandalaId }) => {
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingPostIt, setIsDraggingPostIt] = useState(false);
  const [isHoveringPostIt, setIsHoveringPostIt] = useState(false);
  const [showFiles, setShowFiles] = useState(false);
  const { projectId } = useParams<{ projectId: string }>();


  const { mandala, loading, error, createPostit, updatePostit } =
    useMandala(mandalaId);

  const handleCreatePostIt = () => {
    createPostit({
      content: "New Post-It",
      position: { x: 960, y: 540 },
      category: "ecology",
      level: 1,
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
                <Button
                    onClick={() => setShowFiles(!showFiles)}
                    variant="filled"
                    color="primary"
                >
                  {showFiles ? "Ocultar archivos" : "Ver archivos"}
                </Button>
                {showFiles && projectId && (
                    <div className="absolute top-20 right-4 z-10 max-w-sm bg-white p-4 rounded shadow overflow-y-auto max-h-[400px]">
                      <FileList projectId={projectId} />
                    </div>
                )}
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
                  width: "150%",
                  height: "160%",
                  position: "relative",
                }}
              >
                <div className="relative flex items-center justify-center w-full h-full">
                  <div className="relative inset-0 m-auto w-[1920px] h-[1280px] flex items-center justify-center">
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1920px] h-[1280px] z-0 pointer-events-none">
                      <Mandala scale={1} position={{ x: 0, y: 0 }} />
                    </div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[1920px] h-[1280px] z-10">
                      <KonvaContainer
                        mandala={mandala}
                        onPostItUpdate={updatePostit}
                        onMouseEnter={() => setIsHoveringPostIt(true)}
                        onMouseLeave={() => setIsHoveringPostIt(false)}
                        onDragStart={() => setIsDraggingPostIt(true)}
                        onDragEnd={() => setIsDraggingPostIt(false)}
                        width={1920}
                        height={1280}
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
