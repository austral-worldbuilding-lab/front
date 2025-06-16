import React, { useRef, useEffect } from "react";
import { Group, Rect } from "react-konva";
import { Html } from "react-konva-utils";
import { KonvaEventObject } from "konva/lib/Node";
import { Postit } from "@/types/mandala";
import { isDarkColor } from "@/utils/colorUtils";

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
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

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

  return (
    <Group
      x={position.x}
      y={position.y}
      draggable={!isEditing}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDblClick={onDblClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <Rect
        width={postItW}
        height={postItH}
        fill={dimensionColors[postit.dimension] || "#cccccc"}
        cornerRadius={4}
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
          onChange={(e) => {
            onContentChange(e.target.value);
          }}
          onBlur={onBlur}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
          }}
          style={{
            width: postItW,
            height: postItH,
            padding: padding,
            margin: 0,
            resize: "none",
            background: `${dimensionColors[postit.dimension] || "#cccccc"}`,
            color: textColor,
            borderRadius: 4,
            boxShadow: "0 0 4px rgba(0,0,0,0.3)",
            boxSizing: "border-box",
            fontSize: 11,
            lineHeight: 1.1,
            overflow: "hidden",
          }}
        />
      </Html>
    </Group>
  );
};

export default PostIt;
