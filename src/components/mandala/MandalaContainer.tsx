import Mandala from "./Mandala";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import ZoomControls from "./ZoomControls";
import { useState } from "react";

interface MandalaContainerProps {
  mandalaId?: string;
}

const MandalaContainer: React.FC<MandalaContainerProps> = ({
  mandalaId = "default",
}) => {
  const [isPanning, setIsPanning] = useState(false);

  return (
    <div className="relative w-full h-screen border rounded-lg overflow-hidden bg-white">
      <TransformWrapper
        initialScale={0.5}
        minScale={0.3}
        maxScale={4}
        centerOnInit={true}
        limitToBounds={true}
        wheel={{ disabled: false }}
        pinch={{ disabled: false }}
        doubleClick={{ disabled: true }}
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
              }}
              contentStyle={{ width: "150%", height: "160%" }}
            >
              <Mandala
                scale={1}
                position={{ x: 0, y: 0 }}
                mandalaId={mandalaId}
              />
            </TransformComponent>
          </>
        )}
      </TransformWrapper>
    </div>
  );
};

export default MandalaContainer;
