import React from "react";
import { Html } from "react-konva-utils";

interface HTMLTransformerHandlesProps {
  width: number;
  height: number;
  position: { x: number; y: number };
  scale: number;
  offsetX: number;
  offsetY: number;
  zindex?: number;
}

const HTMLTransformerHandles: React.FC<HTMLTransformerHandlesProps> = ({
  width,
  height,
  position,
  scale,
  offsetX,
  offsetY,
  zindex = 1000,
}) => {
  const handleSize = 16; // Mismo tamaño que Konva Transformer anchorSize
  const strokeWidth = 1;

  // Calcular dimensiones escaladas
  const scaledWidth = width * scale;
  const scaledHeight = height * scale;

  // Calcular offset escalado
  const scaledOffsetX = offsetX * scale;
  const scaledOffsetY = offsetY * scale;

  // Posición del bounding box
  const boxLeft = position.x - scaledOffsetX;
  const boxTop = position.y - scaledOffsetY;
  const boxRight = boxLeft + scaledWidth;
  const boxBottom = boxTop + scaledHeight;

  // Posiciones de los handles (centrados en las esquinas)
  const handles = [
    { x: boxLeft, y: boxTop, cursor: "nwse-resize", name: "top-left" },
    { x: boxRight, y: boxTop, cursor: "nesw-resize", name: "top-right" },
    { x: boxLeft, y: boxBottom, cursor: "nesw-resize", name: "bottom-left" },
    { x: boxRight, y: boxBottom, cursor: "nwse-resize", name: "bottom-right" },
  ];

  return (
    <Html>
      <div
        style={{
          position: "absolute",
          left: 0,
          top: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: zindex,
        }}
      >
        {/* Bounding box - líneas del rectángulo */}
        <div
          style={{
            position: "absolute",
            left: boxLeft,
            top: boxTop,
            width: scaledWidth,
            height: scaledHeight,
            border: `${strokeWidth}px solid #0096FF`,
            boxSizing: "border-box",
            pointerEvents: "none",
          }}
        />

        {/* Handles en las esquinas */}
        {handles.map((handle) => (
          <div
            key={handle.name}
            style={{
              position: "absolute",
              left: handle.x - handleSize / 2,
              top: handle.y - handleSize / 2,
              width: handleSize,
              height: handleSize,
              backgroundColor: "white",
              border: "1px solid #0096FF",
              borderRadius: "2px",
              cursor: handle.cursor,
              pointerEvents: "none",
              boxShadow: "0 0 2px rgba(0,0,0,0.2)",
            }}
          />
        ))}
      </div>
    </Html>
  );
};

export default HTMLTransformerHandles;
