import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Group, Rect } from "react-konva";
import { Html } from "react-konva-utils";
import { Mandala as MandalaData, Postit } from "@/types/mandala";
import { KonvaEventObject } from "konva/lib/Node";

export interface KonvaContainerProps {
  mandala: MandalaData;
  onPostItUpdate: (index: number, updates: Partial<Postit>) => Promise<boolean>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

const SCENE_W = 1200;
const SCENE_H = 1200;

const KonvaContainer: React.FC<KonvaContainerProps> = ({
  mandala,
  onPostItUpdate,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDragEnd,
}) => {
  const [editableIndex, setEditableIndex] = useState<number | null>(null);
  const [editableContent, setEditableContent] = useState("");
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [postItW, postItH, padding] = [64, 64, 5];

  useEffect(() => {
    if (editableIndex !== null && textAreaRef.current) {
      textAreaRef.current.focus();
      const len = textAreaRef.current.value.length;
      textAreaRef.current.setSelectionRange(len, len);
    }
  }, [editableIndex]);

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

  const toAbsolute = (rx: number, ry: number) => ({
    x: ((rx + 1) / 2) * SCENE_W,
    y: ((1 - ry) / 2) * SCENE_H,
  });

  const toRelative = (x: number, y: number) => ({
    x: (x / SCENE_W) * 2 - 1,
    y: 1 - (y / SCENE_H) * 2,
  });

  const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max));
  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    node.position({
      x: clamp(node.x(), SCENE_W - postItW),
      y: clamp(node.y(), SCENE_H - postItH),
    });
  };

  if (!mandala) return <div>No mandala found</div>;

  return (
    <Stage width={SCENE_W} height={SCENE_H} offsetX={0} offsetY={0}>
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
              onDragEnd={async (e) => {
                onDragEnd();
                const nx = e.target.x(),
                  ny = e.target.y();
                const rel = toRelative(nx, ny);
                await onPostItUpdate(i, {
                  coordinates: { ...p.coordinates, x: rel.x, y: rel.y },
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
                  onChange={(e) => setEditableContent(e.target.value)}
                  onBlur={() => setEditableIndex(null)}
                  style={{
                    width: postItW,
                    height: postItH,
                    padding: padding,
                    margin: 0,
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
  );
};

export default KonvaContainer;
