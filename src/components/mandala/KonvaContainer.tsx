import { useEffect, useRef, useState } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import { Html } from "react-konva-utils";
import { Mandala, Postit } from "@/types/mandala";
import { KonvaEventObject } from "konva/lib/Node";

interface KonvaContainerProps {
  mandala: Mandala;
  onPostItUpdate: (index: number, updates: Partial<Postit>) => Promise<boolean>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const KonvaContainer: React.FC<KonvaContainerProps> = ({
  mandala,
  onPostItUpdate,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDragEnd,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 100, height: 100 });

  // Editing state
  const [editableIndex, setEditableIndex] = useState<number | null>(null);
  const [editableContent, setEditableContent] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [postItW, postItH, padding] = [64, 64, 5];

  // Observe container size
  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      for (const e of entries) {
        const { width, height } = e.contentRect;
        setSize({ width, height });
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Focus when editing starts
  useEffect(() => {
    setTimeout(() => {
      if (editableIndex !== null && textAreaRef.current) {
        textAreaRef.current.focus();
        const len = textAreaRef.current.value.length;
        textAreaRef.current.setSelectionRange(len, len);
      }
    }, 0);
  }, [editableIndex]);

  // Click outside to cancel editing
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        editableIndex !== null &&
        textAreaRef.current &&
        !textAreaRef.current.contains(e.target as Node)
      ) {
        setEditableIndex(null);
      }
    };
    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [editableIndex]);

  // Convert relative [-1,1] to absolute
  const toAbsolute = (rx: number, ry: number) => ({
    x: ((rx + 1) / 2) * size.width,
    y: ((1 - ry) / 2) * size.height,
  });

  // Convert absolute to relative
  const toRelative = (x: number, y: number) => ({
    x: (x / size.width) * 2 - 1,
    y: 1 - (y / size.height) * 2,
  });

  // Drag clamp
  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    let nx = node.x(),
      ny = node.y();
    nx = Math.max(0, Math.min(size.width - postItW, nx));
    ny = Math.max(0, Math.min(size.height - postItH, ny));
    node.position({ x: nx, y: ny });
  };

  // Optional polar
  const toPolar = (x: number, y: number) => {
    const cx = size.width / 2,
      cy = size.height / 2;
    const dx = x - cx,
      dy = cy - y;
    const angle = ((Math.atan2(dy, dx) * 180) / Math.PI + 360) % 360;
    const dist = Math.hypot(dx, dy);
    const maxR = Math.min(size.width, size.height) / 2;
    return { angle, percentileDistance: Math.min(dist / maxR, 1) };
  };

  const handleContentChange = async (i: number, v: string) => {
    setEditableContent(v);
    await onPostItUpdate(i, { content: v });
  };

  if (!mandala) return <div>No mandala found</div>;

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <Stage
        width={size.width}
        height={size.height}
        style={{ position: "absolute", top: 0, left: 0 }}
      >
        <Layer>
          {mandala.postits.map((p, i) => {
            const { x, y } = toAbsolute(p.coordinates.x, p.coordinates.y);
            const isEditing = editableIndex === i;
            return (
              <Group
                key={i}
                x={x}
                y={y}
                draggable={!isEditing}
                onDragStart={onDragStart}
                onDragMove={handleDragMove}
                onDragEnd={(e) => {
                  onDragEnd();
                  const nx = e.target.x(),
                    ny = e.target.y();
                  const rel = toRelative(nx, ny);
                  const polar = toPolar(nx, ny);
                  onPostItUpdate(i, {
                    coordinates: {
                      x: rel.x,
                      y: rel.y,
                      angle: polar.angle,
                      percentileDistance: polar.percentileDistance,
                    },
                  });
                }}
                onDblClick={() => {
                  setEditableIndex(i);
                  setEditableContent(p.content);
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
              >
                <Rect
                  width={postItW}
                  height={postItH}
                  fill="yellow"
                  cornerRadius={4}
                />
                <Html
                  divProps={{
                    style: { pointerEvents: isEditing ? "auto" : "none" },
                  }}
                >
                  <textarea
                    ref={textAreaRef}
                    disabled={!isEditing}
                    value={isEditing ? editableContent : p.content}
                    onChange={(e) => handleContentChange(i, e.target.value)}
                    style={{
                      width: postItW,
                      height: postItH,
                      margin: 0,
                      padding,
                      resize: "none",
                      background: "transparent",
                      boxSizing: "border-box",
                      fontSize: 11,
                      lineHeight: 1.1,
                    }}
                  />
                </Html>
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default KonvaContainer;
