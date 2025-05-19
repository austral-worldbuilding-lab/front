import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Mandala from "./Mandala";
import KonvaContainer from "./KonvaContainer";
import ZoomControls from "./ZoomControls";
import useMandala from "@/hooks/useMandala";

interface MandalaContainerProps {
  mandalaId?: string;
}

const MandalaContainer: React.FC<MandalaContainerProps> = ({
  mandalaId = "0G5PzwefEx46hkvyfIUT",
}) => {
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingPostIt, setIsDraggingPostIt] = useState(false);
  const [isHoveringPostIt, setIsHoveringPostIt] = useState(false);
  const { mandala, loading, error, createPostit, updatePostit } = useMandala(mandalaId);

  const handleCreatePostIt = () => {
    createPostit({
      content: "New Post-It",
      position: { x: 960, y: 540 },
      category: "ecology",
      level: 1
    });
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!mandala) return <div>No mandala found</div>;

  return (
    <div className="relative w-full h-screen border rounded-lg overflow-hidden bg-white">
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
                <div className="absolute inset-0 m-auto w-[960px] h-[1280px]">
                  <div className="absolute inset-0 m-auto w-[960px] h-[1280px] z-0 pointer-events-none flex items-center justify-center">
                    <Mandala
                      scale={1}
                      position={{ x: 0, y: 0 }}
                      mandalaId={mandalaId}
                    />
                  </div>
                  <div className="absolute inset-0 m-auto w-[1920px] h-[1280px] z-10">
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
    </div>
  );
};

export default MandalaContainer;
