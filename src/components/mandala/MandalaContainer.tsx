import { useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import Mandala from "./Mandala";
import KonvaContainer from "./KonvaContainer";
import ZoomControls from "./ZoomControls";
import { PostIt } from "@/types/post-it";

interface MandalaContainerProps {
  mandalaId?: string;
}

const MandalaContainer: React.FC<MandalaContainerProps> = ({
  mandalaId = "default",
}) => {
  const [isPanning, setIsPanning] = useState(false);
  const [isDraggingPostIt, setIsDraggingPostIt] = useState(false);
  const [isHoveringPostIt, setIsHoveringPostIt] = useState(false);
  const [postIts, setPostIts] = useState<Map<string, { data: PostIt; category: string }>>(
    new Map([
      ["1", {
        data: {
          content: "Test post-it 1",
          position: { x: 950, y: 250 }
        },
        category: "ecology"
      }],
      ["2", {
        data: {
          content: "Test post-it 2",
          position: { x: 750, y: 250 }
        },
        category: "governance"
      }],
      ["3", {
        data: {
          content: "Test post-it 3",
          position: { x: 750, y: 750 }
        },
        category: "ecology"
      }],
      ["4", {
        data: {
          content: "Test post-it 4",
          position: { x: 950, y: 320 }
        },
        category: "governance"
      }]
    ])
  );

  const handlePostItUpdate = (id: string, category: string, updates: Partial<PostIt>) => {
    setPostIts((prev) => {
      const updated = new Map(prev);
      const postIt = updated.get(id);
      if (postIt) {
        updated.set(id, {
          ...postIt,
          data: {
            ...postIt.data,
            ...updates,
          },
        });
      }
      return updated;
    });
  };

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
                width: "150%",
                height: "160%",
                position: "relative",
              }}
            >
              <div className="relative flex items-center justify-center w-full h-full">
                <div className="absolute inset-0 m-auto w-[1920px] h-[1280px]">
                  <div className="absolute inset-0 m-auto w-[1920px] h-[1280px] z-0 pointer-events-none flex items-center justify-center">
                    <Mandala
                      scale={1}
                      position={{ x: 0, y: 0 }}
                      mandalaId={mandalaId}
                    />
                  </div>
                  <div className="absolute inset-0 m-auto w-[1920px] h-[1280px] z-10">
                    <KonvaContainer
                      mandalaId={mandalaId}
                      postIts={postIts}
                      onPostItUpdate={handlePostItUpdate}
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
