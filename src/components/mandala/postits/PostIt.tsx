import React, { useRef, useMemo, useState } from "react";
import { Circle, Group } from "react-konva";
import { Html } from "react-konva-utils";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Postit } from "@/types/mandala";
import { isDarkColor } from "@/utils/colorUtils";
import useDragBoundFunc from "@/hooks/useDragBoundFunc";
import { usePostItAnimation } from "@/hooks/usePostItAnimation";

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
  onContextMenu: (e: KonvaEventObject<PointerEvent>, id: string) => void;
  mandalaRadius: number;
  disableDragging?: boolean;
}

const PostIt = React.forwardRef<Konva.Group, PostItProps>((props, ref) => {
  const {
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
  } = props;

  const groupRef = useRef<Konva.Group>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textColor = isDarkColor(color) ? "white" : "black";
  const { dragBoundFunc } = useDragBoundFunc(mandalaRadius, postItW, postItH);
  const { shouldAnimate, markAnimated, isOpen, toggleOpen, setOpen } =
    usePostItAnimation(postit.id!);

  const scale = 0.3;
  const fontSize = 11 * scale;
  const children = useMemo(() => postit.childrens || [], [postit.childrens]);

  const orbit = useMemo(() => {
    const r = (postItW / 2) * scale;
    return 2 * r + (1 - 3 * scale);
  }, [postItW]);

  const childPositions = useMemo(
    () =>
      children.map((_, i) => {
        const angle = (2 * Math.PI * i) / children.length;
        return {
          x: position.x + Math.cos(angle) * orbit,
          y: position.y + Math.sin(angle) * orbit,
        };
      }),
    [children, orbit, position.x, position.y]
  );

  const isAnimatingRef = useRef(false);
  const hasAnimatedRef = useRef(shouldAnimate); // capture only once on mount

  const handleClick = () => {
    if (clickTimeout.current || isAnimatingRef.current) return;

    clickTimeout.current = setTimeout(() => {
      clickTimeout.current = null;

      if (!children.length) return;

      const group = groupRef.current;
      if (!group) return;

      isAnimatingRef.current = true;

      // Prevent multiple animations
      if (hasAnimatedRef.current) {
        markAnimated();
        hasAnimatedRef.current = false;
      }

      group.to({
        scaleX: !isOpen ? scale : 1,
        scaleY: !isOpen ? scale : 1,
        duration: 0.25,
        easing: Konva.Easings.EaseInOut,
        onFinish: () => {
          isAnimatingRef.current = false;
        },
      });

      toggleOpen();
    }, 250);
  };

  return (
    <>
      {!isDragging &&
        children.map((child, i) => (
          <PostIt
            key={child.id}
            ref={null}
            postit={child}
            isEditing={false}
            editingContent={null}
            color={color}
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
        ref={(node) => {
          groupRef.current = node;
          if (typeof ref === "function") ref(node);
          else if (ref)
            (ref as React.MutableRefObject<Konva.Group | null>).current = node;
        }}
        x={position.x}
        y={position.y}
        draggable={!isEditing && !disableDragging}
        dragBoundFunc={dragBoundFunc}
        offset={{ x: postItW / 2, y: postItH / 2 }}
        scale={isOpen ? { x: scale, y: scale } : { x: 1, y: 1 }}
        onDragStart={() => {
          onDragStart();
          setIsDragging(true);
        }}
        onDragMove={onDragMove}
        onDragEnd={(e) => {
          onDragEnd(e);
          setTimeout(() => setIsDragging(false), 100);
        }}
        onClick={handleClick}
        onDblClick={() => {
          if (clickTimeout.current) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = null;
          }
          onDblClick();
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onContextMenu={(e) => {
          onContextMenu(e, postit.id!);
          setOpen(false);
        }}
      >
        <Circle
          x={postItW / 2}
          y={postItH / 2}
          radius={postItW / 2}
          fill={color}
        />
        <Html
          divProps={{ style: { pointerEvents: isEditing ? "auto" : "none" } }}
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
              background: color,
              color: textColor,
              borderRadius: "50%",
              boxShadow: "0 0 4px rgba(0,0,0,0.3)",
              boxSizing: "border-box",
              fontSize: `${fontSize}px`,
              lineHeight: 1.1,
              overflow: "hidden",
              textAlign: "center",
            }}
          />
        </Html>
      </Group>
    </>
  );
});

export default PostIt;
