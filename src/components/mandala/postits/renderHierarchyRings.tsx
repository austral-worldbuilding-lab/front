import { JSX } from "react";
import { Postit } from "@/types/mandala";
import PostIt from "./PostIt";
import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";

interface RenderHierarchyRingsProps {
  rings: Postit[][];
  postItW: number;
  postItH: number;
  childScale: number;
  center: { x: number; y: number };
  dimensionColors: Record<string, string>;
  editableIndex: number | null;
  editingContent: string | null;
  mandalaPostits: Postit[];
  onEditStart: (index: number, content: string) => void;
  onEditChange: (index: number, value: string) => void;
  onEditEnd: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContextMenu: (
    e: KonvaEventObject<PointerEvent, Node<NodeConfig>>,
    index: number,
    type: "postit"
  ) => void;
}

export function renderHierarchyRings({
  rings,
  postItW,
  postItH,
  childScale,
  center,
  dimensionColors,
  editableIndex,
  editingContent,
  mandalaPostits,
  onEditStart,
  onEditChange,
  onEditEnd,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
}: RenderHierarchyRingsProps): JSX.Element[] {
  const radiusStep = postItW * 2;
  const all: JSX.Element[] = [];

  rings.forEach((ring, level) => {
    const radius = radiusStep * (level + 1);
    const angleStep = (2 * Math.PI) / ring.length;

    ring.forEach((postIt, index) => {
      const angle = angleStep * index;
      const x =
        center.x + radius * Math.cos(angle) - (postItW * childScale) / 2;
      const y =
        center.y + radius * Math.sin(angle) - (postItH * childScale) / 2;

      const postItIndex = mandalaPostits.findIndex((p) => p.id === postIt.id);
      const isEditing = postItIndex === editableIndex;

      all.push(
        <PostIt
          key={postIt.id}
          postit={postIt}
          position={{ x, y }}
          initialPosition={{ x, y }}
          postItW={postItW * childScale}
          postItH={postItH * childScale}
          isEditing={isEditing}
          editingContent={isEditing ? editingContent : null}
          dimensionColors={{
            [postIt.dimension]: dimensionColors[postIt.dimension],
          }}
          padding={(postItW / 4) * childScale}
          disableDragging
          shouldAnimate
          onDblClick={() => onEditStart(postItIndex, postIt.content)}
          onContentChange={(value) => onEditChange(postItIndex, value)}
          onBlur={onEditEnd}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onContextMenu={(e) => onContextMenu(e, postItIndex, "postit")}
          onDragStart={() => {}}
          onDragMove={() => {}}
          onDragEnd={() => {}}
          mandalaRadius={postItW * 10}
        />
      );
    });
  });

  return all;
}
