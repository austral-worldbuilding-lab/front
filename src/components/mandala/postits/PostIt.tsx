import React, { useRef, useEffect } from "react";
import { Circle, Group } from "react-konva";
import { Html } from "react-konva-utils";
import { KonvaEventObject } from "konva/lib/Node";
import { Postit } from "@/types/mandala";
import { isDarkColor } from "@/utils/colorUtils";
import useDragBoundFunc from "@/hooks/useDragBoundFunc";
import Konva from "konva";

interface PostItProps {
  postit: Postit;
  isEditing: boolean;
  editingContent: string | null;
  dimensionColors: Record<string, string>;
  postItW: number;
  postItH: number;
  padding: number;
  position: { x: number; y: number };
  onDragStart: () => void;
  onDragMove: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onDblClick: () => void;
  onContentChange: (newValue: string) => void;
  onBlur: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContextMenu: (e: KonvaEventObject<PointerEvent>) => void;
  mandalaRadius: number;
  shouldAnimate?: boolean;
  isExiting?: boolean;
  initialPosition?: { x: number; y: number };
}

const PostIt: React.FC<PostItProps> = ({
  postit,
  isEditing,
  editingContent,
  dimensionColors,
  postItW,
  postItH,
  padding,
  position,
  onDragStart,
  onDragMove,
  onDragEnd,
  onDblClick,
  onContentChange,
  onBlur,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
  mandalaRadius,
  shouldAnimate,
  isExiting,
  initialPosition,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const groupRef = useRef<Konva.Group>(null);
  const { dragBoundFunc } = useDragBoundFunc(mandalaRadius, postItW, postItH);

  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    if (
      groupRef.current &&
      shouldAnimate &&
      !isExiting &&
      !hasAnimatedRef.current
    ) {
      const from = initialPosition ?? { x: mandalaRadius, y: mandalaRadius };
      groupRef.current.setAttrs({ x: from.x, y: from.y });

      requestAnimationFrame(() => {
        groupRef.current?.to({
          x: position.x,
          y: position.y,
          duration: 0.4,
          easing: Konva.Easings.EaseOut,
        });
      });

      hasAnimatedRef.current = true;
    } else if (groupRef.current && isExiting) {
      groupRef.current.to({
        x: initialPosition?.x ?? mandalaRadius,
        y: initialPosition?.y ?? mandalaRadius,
        duration: 0.3,
        easing: Konva.Easings.EaseIn,
      });

      hasAnimatedRef.current = false;
    }
  }, [
    shouldAnimate,
    isExiting,
    position.x,
    position.y,
    mandalaRadius,
    initialPosition,
  ]);

  useEffect(() => {
    setTimeout(() => {
      if (isEditing && textAreaRef.current) {
        textAreaRef.current.focus();
        const len = textAreaRef.current.value.length;
        textAreaRef.current.setSelectionRange(len, len);
      }
    }, 0);
  }, [isEditing]);

  const backgroundColor = dimensionColors[postit.dimension] || "#cccccc";
  const textColor = isDarkColor(backgroundColor) ? "white" : "black";
  const scaleRatio = postItW / 64; // base size used for text

  return (
    <Group
      ref={groupRef}
      x={position.x}
      y={position.y}
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDblClick={onDblClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onContextMenu={onContextMenu}
      className="pointer-events-auto"
      dragBoundFunc={dragBoundFunc}
    >
      <Circle
        x={postItW / 2}
        y={postItH / 2}
        radius={postItW / 2}
        fill={backgroundColor}
        shadowBlur={0}
        shadowOpacity={0}
      />
      <Html
        divProps={{
          style: {
            pointerEvents: isEditing ? "auto" : "none",
          },
        }}
      >
        <textarea
          ref={isEditing ? textAreaRef : null}
          disabled={!isEditing}
          value={isEditing ? editingContent ?? "" : postit.content}
          onChange={(e) => onContentChange(e.target.value)}
          onBlur={onBlur}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          style={{
            width: postItW,
            height: postItH,
            padding,
            margin: 0,
            resize: "none",
            background: backgroundColor,
            color: textColor,
            borderRadius: "50%",
            boxShadow: "0 0 4px rgba(0,0,0,0.3)",
            boxSizing: "border-box",
            fontSize: `${11 * scaleRatio}px`,
            lineHeight: 1.1,
            overflow: "hidden",
            textAlign: "center",
          }}
        />
      </Html>
    </Group>
  );
};

export default PostIt;
