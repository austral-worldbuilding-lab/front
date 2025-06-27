import { JSX } from "react";
import PostIt from "./PostIt";
import { Postit } from "@/types/mandala";
import { KonvaEventObject, Node, NodeConfig } from "konva/lib/Node";

interface RenderChildrenProps {
  closestPostIt: Postit;
  visibleChildren: Postit[];
  exitingChildren: {
    postit: Postit;
    initialPosition: { x: number; y: number };
  }[];
  visibleChildrenPositions: Map<string, { x: number; y: number }>;
  postItW: number;
  postItH: number;
  childScale: number;
  dimensionColors: Record<string, string>;
  editableIndex: number | null;
  editingContent: string | null;
  mandalaPostits: Postit[];
  toAbsolute: (x: number, y: number) => { x: number; y: number };
  onEditStart: (index: number, content: string) => void;
  onEditChange: (index: number, content: string) => void;
  onEditEnd: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContextMenu: (
    e: KonvaEventObject<PointerEvent, Node<NodeConfig>>,
    index: number,
    type: "postit"
  ) => void;
}

export function renderChildren({
  closestPostIt,
  visibleChildren,
  exitingChildren,
  visibleChildrenPositions,
  postItW,
  postItH,
  childScale,
  dimensionColors,
  editableIndex,
  editingContent,
  mandalaPostits,
  toAbsolute,
  onEditStart,
  onEditChange,
  onEditEnd,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
}: RenderChildrenProps): JSX.Element[] {
  const parentAbs = toAbsolute(
    closestPostIt.coordinates.x,
    closestPostIt.coordinates.y
  );
  const parentCenterX = parentAbs.x + postItW / 2;
  const parentCenterY = parentAbs.y + postItH / 2;

  const visible = visibleChildren.map((child) => {
    const pos = visibleChildrenPositions.get(child.id!);
    if (!pos) return null;
    const index = mandalaPostits.findIndex((p) => p.id === child.id);
    const isEditing = editableIndex === index;

    return (
      <PostIt
        disableDragging
        key={child.id}
        postit={child}
        isEditing={isEditing}
        editingContent={isEditing ? editingContent : null}
        dimensionColors={{
          [child.dimension]: dimensionColors[child.dimension],
        }}
        postItW={postItW * childScale}
        postItH={postItH * childScale}
        padding={(postItW / 4) * childScale}
        position={pos}
        initialPosition={{
          x: parentCenterX - (postItW * childScale) / 2,
          y: parentCenterY - (postItH * childScale) / 2,
        }}
        shouldAnimate
        onDragStart={() => {}}
        onDragMove={() => {}}
        onDragEnd={() => {}}
        onDblClick={() => onEditStart(index, child.content)}
        onContentChange={(value) => onEditChange(index, value)}
        onBlur={onEditEnd}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onContextMenu={(e) => onContextMenu(e, index, "postit")}
        mandalaRadius={postItW * 10}
      />
    );
  });

  const exiting = exitingChildren.map(({ postit: child, initialPosition }) => {
    const finalX = parentCenterX - (postItW * childScale) / 2;
    const finalY = parentCenterY - (postItH * childScale) / 2;

    return (
      <PostIt
        disableDragging
        key={`exiting-${child.id}`}
        postit={child}
        isEditing={false}
        editingContent={null}
        dimensionColors={{
          [child.dimension]: dimensionColors[child.dimension],
        }}
        postItW={postItW * childScale}
        postItH={postItH * childScale}
        padding={(postItW / 4) * childScale}
        position={{ x: finalX, y: finalY }}
        initialPosition={initialPosition}
        shouldAnimate
        onDragStart={() => {}}
        onDragMove={() => {}}
        onDragEnd={() => {}}
        onDblClick={() => {}}
        onContentChange={() => {}}
        onBlur={() => {}}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onContextMenu={() => {}}
        mandalaRadius={postItW * 10}
      />
    );
  });

  return [...visible, ...exiting].filter(
    (el): el is JSX.Element => el !== null
  );
}
