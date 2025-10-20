import React, { useRef, useState, useEffect } from "react";
import { Group, Rect, Transformer } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import type { MandalaImage } from "@/types/mandala";
import useDragBoundFunc from "@/hooks/useDragBoundFunc";
import { Html } from "react-konva-utils";
import MandalaBadge from "../../postits/MandalaBadge";

interface MandalaImageProps {
  image: MandalaImage;
  position: { x: number; y: number };
  onDragStart: (postitId: string) => void;
  onDragMove?: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContextMenu: (e: KonvaEventObject<PointerEvent>, id: string) => void;
  mandalaRadius: number;
  disableDragging?: boolean;
  scale?: number;
  zindex?: number;
  onTransformEnd?: (e: KonvaEventObject<Event>, scale: number) => void;
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
    onTransformEnd,
  } = props;

  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const imgHtmlRef = useRef<HTMLImageElement | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [konvaImage, setKonvaImage] = useState<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  const IMAGE_SIZE = 80;
  const staticScale = scale * (image.scale ?? 1);
  const [localScale, setLocalScale] = useState(staticScale);

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

  useEffect(() => {
    if (!isResizing) setLocalScale(staticScale);
  }, [staticScale, isResizing]);

  const getBaseDimensions = () => {
    const base = IMAGE_SIZE;
    if (!konvaImage) return { width: base, height: base, aspect: 1 };
    const ar = konvaImage.width / konvaImage.height;
    return ar > 1
      ? { width: base, height: base / ar, aspect: ar }
      : { width: base * ar, height: base, aspect: ar };
  };
  const { width, height, aspect } = getBaseDimensions();

  const { dragBoundFunc } = useDragBoundFunc(
    mandalaRadius,
    width,
    height,
    0,
    localScale
  );

  useEffect(() => {
    if (isEditing && groupRef.current && trRef.current) {
      try {
        trRef.current.nodes([groupRef.current]);
        trRef.current.getLayer()?.batchDraw();
      } catch {
        // no-op
      }
    }
  }, [isEditing]);

  useEffect(() => {
    const handleClickOutside = () => {
      if (!isEditing) return;

      const stage = groupRef.current?.getStage();
      const tr = trRef.current as unknown as Konva.Transformer | null;

      try {
        const pos = stage?.getPointerPosition();
        if (stage && tr && pos) {
          const shape = stage.getIntersection(pos);
          if (shape) {
            const transformerAncestor = shape.findAncestor(
              (n: Konva.Node) => n.getClassName() === "Transformer",
              true
            );
            if (transformerAncestor && transformerAncestor === tr) return;
            const groupAncestor = shape.findAncestor(
              (n: Konva.Node) => n === groupRef.current,
              true
            );
            if (groupAncestor) return;
          }
        }
      } catch {
        // no-op
      }

      setIsEditing(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [isEditing]);

  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;

    const handleTransformStart = () => {
      setIsResizing(true);
      onDragStart(image.id);
    };

    const handleTransformEnd = (e: KonvaEventObject<Event>) => {
      setIsResizing(false);
      const sx = node.scaleX();
      setLocalScale(sx);
      onTransformEnd?.(e, sx);
    };

    node.on("transformstart", handleTransformStart);
    node.on("transformend", handleTransformEnd);

    return () => {
      node.off("transformstart", handleTransformStart);
      node.off("transformend", handleTransformEnd);
    };
  }, [onDragStart, onTransformEnd, image.id]);

  if (!imageLoaded || !konvaImage) {
    return (
      <Group x={position.x} y={position.y} scale={{ x: staticScale, y: staticScale }}>
        <Rect
          width={IMAGE_SIZE}
          height={IMAGE_SIZE}
          x={-IMAGE_SIZE / 2}
          y={-IMAGE_SIZE / 2}
          fill="#f0f0f0"
          stroke="#ccc"
          strokeWidth={1}
          cornerRadius={4}
        />
      </Group>
    );
  }

  return (
    <Group>
      <Group
        ref={(node) => {
          groupRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref)
            (ref as React.MutableRefObject<Konva.Group | null>).current = node;
        }}
        x={position.x}
        y={position.y}
        width={width}
        height={height}
        draggable={!disableDragging && !isResizing}
        dragBoundFunc={dragBoundFunc}
        offset={{ x: width / 2, y: height / 2 }}
        scale={{ x: localScale, y: localScale }}
        onDragStart={() => {
          onDragStart(image.id);
          setIsDragging(true);
        }}
        {...(onDragMove && { onDragMove })}
        onDragEnd={(e) => {
          onDragEnd(e);
          setTimeout(() => setIsDragging(false), 100);
        }}
        onDblClick={() => {
          setIsEditing((v) => !v);
        }}
        onMouseEnter={() => {
          onMouseEnter();
          const container = groupRef.current?.getStage()?.container();
          if (container) container.style.cursor = "pointer";
        }}
        onMouseLeave={() => {
          onMouseLeave();
          const container = groupRef.current?.getStage()?.container();
          if (container) container.style.cursor = "grab";
        }}
        onContextMenu={(e) => onContextMenu(e, image.id)}
        onTransformEnd={(e) => {
          setTimeout(() => setIsResizing(false), 100);
          const node = groupRef.current;
          if (!node) return;
          const sx = node.scaleX();
          setLocalScale(sx);
          onTransformEnd?.(e, sx);
        }}
      >
        {/* HTML img para nitidez + Rect para sombra/selección */}
        <Html
          divProps={{
            style: { pointerEvents: "none", zIndex: zindex } as React.CSSProperties,
          }}
        >
          <img
            ref={imgHtmlRef}
            src={image.url}
            width={width}
            height={height}
            style={{ borderRadius: 4, display: "block" }}
            alt=""
          />
        </Html>

        {image.from && (
          <MandalaBadge
            originMandalaName={image.from?.name}
            fontSize={10}
            zindex={zindex}
          />
        )}

        <Rect
          width={width}
          height={height}
          shadowColor="rgba(0,0,0,0.3)"
          shadowBlur={isDragging || isResizing ? 10 : 5}
          shadowOffset={{ x: 2, y: 2 }}
          shadowOpacity={0.5}
          stroke="#00000020"
          strokeWidth={isDragging || isResizing ? 2 : 1}
          cornerRadius={4}
        />
      </Group>

      {/* Transformer como en PostIt: sólo si está en edición y no está bloqueado */}
      {isEditing && !disableDragging && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          keepRatio
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(_oldBox, newBox) => {
            const min = 40;
            const max = 600;
            const nextW = Math.max(min, Math.min(max, newBox.width));
            const nextH = nextW / (aspect || 1);
            return { ...newBox, width: nextW, height: nextH };
          }}
        />
      )}
    </Group>
  );
});

export default MandalaImage;
