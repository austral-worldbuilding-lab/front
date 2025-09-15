import React, { useRef, useState, useEffect } from "react";
import { Group, Image as KonvaImage, Rect } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import type { MandalaImage } from "@/types/mandala";
import useDragBoundFunc from "@/hooks/useDragBoundFunc";

interface MandalaImageProps {
  image: MandalaImage;
  position: { x: number; y: number };
  onDragStart: () => void;
  onDragMove?: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContextMenu: (e: KonvaEventObject<PointerEvent>, id: string) => void;
  mandalaRadius: number;
  disableDragging?: boolean;
  scale?: number;
  zindex?: number;
}

const MandalaImage = React.forwardRef<Konva.Group, MandalaImageProps>((props, ref) => {
  const {
    image,
    position,
    onDragStart,
    onDragMove,
    onDragEnd,
    onMouseEnter,
    onMouseLeave,
    onContextMenu,
    mandalaRadius,
    disableDragging,
    scale = 1,
    zindex,
  } = props;

  const groupRef = useRef<Konva.Group>(null);
  const imageRef = useRef<Konva.Image>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Tamaño fijo para todas las imágenes (altura o ancho igual según requerimientos)
  const IMAGE_SIZE = 80; // Tamaño base
  const scaledSize = IMAGE_SIZE * scale;

  const { dragBoundFunc } = useDragBoundFunc(
    mandalaRadius,
    scaledSize,
    scaledSize,
    0,
    scale
  );

  useEffect(() => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setKonvaImage(img);
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error("Error loading image:", image.url);
      setImageLoaded(false);
    };
    img.src = image.url;
  }, [image.url]);

  const getImageDimensions = () => {
    if (!konvaImage) return { width: scaledSize, height: scaledSize };

    const aspectRatio = konvaImage.width / konvaImage.height;
    
    if (aspectRatio > 1) {
      return {
        width: scaledSize,
        height: scaledSize / aspectRatio,
      };
    } else {
      return {
        width: scaledSize * aspectRatio,
        height: scaledSize,
      };
    }
  };

  const { width, height } = getImageDimensions();

  if (!imageLoaded || !konvaImage) {
    return (
      <Group
        x={position.x}
        y={position.y}
        scale={{ x: scale, y: scale }}
        zIndex={zindex}
      >
        <Rect
          width={scaledSize}
          height={scaledSize}
          x={-scaledSize / 2}
          y={-scaledSize / 2}
          fill="#f0f0f0"
          stroke="#ccc"
          strokeWidth={1}
          cornerRadius={4}
        />
      </Group>
    );
  }

  return (
    <Group zIndex={zindex}>
      <Group
        ref={(node) => {
          groupRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref)
            (ref as React.MutableRefObject<Konva.Group | null>).current = node;
        }}
        x={position.x}
        y={position.y}
        draggable={!disableDragging}
        dragBoundFunc={dragBoundFunc}
        offset={{ x: width / 2, y: height / 2 }}
        scale={{ x: scale, y: scale }}
        onDragStart={() => {
          onDragStart();
          setIsDragging(true);
        }}
        {...(onDragMove && { onDragMove })}
        onDragEnd={(e) => {
          onDragEnd(e);
          setTimeout(() => setIsDragging(false), 100);
        }}
        onMouseEnter={() => {
          onMouseEnter();
          const container = groupRef.current?.getStage()?.container();
          if (container) {
            container.style.cursor = "pointer";
          }
        }}
        onMouseLeave={() => {
          onMouseLeave();
          const container = groupRef.current?.getStage()?.container();
          if (container) {
            container.style.cursor = "grab";
          }
        }}
        onContextMenu={(e) => {
          onContextMenu(e, image.id);
        }}
      >
        <KonvaImage
          ref={imageRef}
          image={konvaImage}
          width={width}
          height={height}
          x={-width / 2}
          y={-height / 2}
          shadowColor="rgba(0,0,0,0.3)"
          shadowBlur={isDragging ? 10 : 5}
          shadowOffset={{ x: 2, y: 2 }}
          shadowOpacity={0.5}
          strokeWidth={isDragging ? 2 : 1}
          cornerRadius={4}
        />
      </Group>
    </Group>
  );
});

export default MandalaImage;
