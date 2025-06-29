import React, { useRef, useEffect, useState, useMemo } from "react";
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
  color: string;
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
  disableDragging?: boolean;
}

const PostIt: React.FC<PostItProps> = ({
  postit,
  isEditing,
  editingContent,
  color,
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
  disableDragging,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const groupRef = useRef<Konva.Group>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const { dragBoundFunc } = useDragBoundFunc(mandalaRadius, postItW, postItH);

  const backgroundColor = color;
  const textColor = isDarkColor(backgroundColor) ? "white" : "black";
  const scaleRatio = postItW / 64;
  const children = useMemo(() => postit.childrens || [], [postit.childrens]);

  const scale = 0.3;
  const radius = postItW / 2;
  const expandedRadius = radius * scale;
  const spacing = 1 - 3 * scale;
  const orbit = 2 * expandedRadius + spacing;

  const childPositions = useMemo(() => {
    return children.map((_, i) => {
      const angle = (2 * Math.PI * i) / children.length;
      return {
        x: position.x + Math.cos(angle) * (orbit + 3),
        y: position.y + Math.sin(angle) * (orbit + 3),
      };
    });
  }, [children, orbit, position.x, position.y]);

  useEffect(() => {
    if (isEditing && textAreaRef.current) {
      setTimeout(() => {
        const len = textAreaRef.current!.value.length;
        textAreaRef.current!.focus();
        textAreaRef.current!.setSelectionRange(len, len);
      }, 0);
    }
  }, [isEditing]);

  return (
    <>
      {isOpen &&
        !isDragging &&
        children.map((child, i) => (
          <PostIt
            key={child.id}
            postit={child}
            isEditing={false}
            editingContent={null}
            color={backgroundColor}
            postItW={postItW * scale}
            postItH={postItH * scale}
            padding={padding}
            position={childPositions[i]}
            onDragStart={onDragStart}
            onDragMove={onDragMove}
            onDragEnd={onDragEnd}
            onDblClick={onDblClick}
            onContentChange={onContentChange}
            onBlur={onBlur}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onContextMenu={onContextMenu}
            mandalaRadius={mandalaRadius}
            disableDragging={true}
          />
        ))}

      <Group
        ref={groupRef}
        x={position.x}
        y={position.y}
        draggable={!isEditing && !disableDragging}
        dragBoundFunc={dragBoundFunc}
        onDragStart={() => {
          onDragStart();
          setIsDragging(true);
        }}
        onDragMove={onDragMove}
        onDragEnd={(e) => {
          onDragEnd(e);
          setTimeout(() => setIsDragging(false), 100);
        }}
        onClick={() => {
          if (children.length > 0) setIsOpen((prev) => !prev);
        }}
        onDblClick={onDblClick}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onContextMenu={onContextMenu}
        scale={isOpen ? { x: scale, y: scale } : { x: 1, y: 1 }}
        offset={{ x: postItW / 2, y: postItH / 2 }}
        className="pointer-events-auto"
      >
        <Circle
          x={postItW / 2}
          y={postItH / 2}
          radius={postItW / 2}
          fill={backgroundColor}
        />
        <Html
          divProps={{ style: { pointerEvents: isEditing ? "auto" : "none" } }}
        >
          {/* <textarea
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
          /> */}
        </Html>
      </Group>
    </>
  );
};

export default PostIt;
