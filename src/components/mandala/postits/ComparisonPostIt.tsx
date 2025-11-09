import React, { useRef, useMemo, useState } from "react";
import { Circle, Group } from "react-konva";
import { Html } from "react-konva-utils";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Postit } from "@/types/mandala";
import { isDarkColor } from "@/utils/colorUtils";
import useDragBoundFunc from "@/hooks/useDragBoundFunc";
import { usePostItAnimation } from "@/hooks/usePostItAnimation";
import CharactersNames from "./CharactersNames";
import { ThumbsDown, ThumbsUp } from "lucide-react";

interface ComparisonPostItProps {
  postit: Postit;
  type: "SIMILITUD" | "DIFERENCIA" | "UNICO";
  position: { x: number; y: number };
  onDragStart: () => void;
  onDragMove?: (e: KonvaEventObject<DragEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onDblClick: () => void;
  onContentChange: (newValue: string, id: string) => void;
  onBlur: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContextMenu: (e: KonvaEventObject<PointerEvent>, id: string) => void;
  mandalaRadius: number;
  currentMandalaName?: string;
  characters: {
    color: string;
    name: string;
    description: string;
    id: string;
  }[];
  disableDragging?: boolean;
  scale?: number;
  zindex?: number;
}

const ComparisonPostIt = React.forwardRef<Konva.Group, ComparisonPostItProps>(
  (props, ref) => {
    const {
      postit,
      zindex,
      type,
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
      currentMandalaName,
      disableDragging,
      scale = 1,
      characters,
    } = props;

    const getBackgroundColor = () => {
      switch (type) {
        case "SIMILITUD":
          return "#33f25f";
        case "DIFERENCIA":
          return "#9f2d2d";
        case "UNICO":
          return "#c2c2c2";
      }
    };

    const groupRef = useRef<Konva.Group>(null);
    const clickTimeout = useRef<NodeJS.Timeout | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const textColor = isDarkColor(getBackgroundColor()) ? "white" : "black";
    const { shouldAnimate, markAnimated, isOpen, toggleOpen } =
      usePostItAnimation(postit.id!);
    const isEditing = false;

    const postItW = 100;
    const postItH = 100;
    const horizontalPadding = 12;
    
    const fontSize = postItW / 10;
    const lineHeight = 1.1;
    const scaleFather = 0.4 * scale;
    const scaleChildren = 0.25 * scale;
    const children = useMemo(() => postit.childrens || [], [postit.childrens]);

    const currentScale = isOpen ? scaleFather : scale;
    const { dragBoundFunc } = useDragBoundFunc(
      mandalaRadius,
      postItW,
      postItH,
      0,
      currentScale
    );

    const orbit = useMemo(() => {
      return postItW * 0.37 * scale;
    }, [postItW, scale]);

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

    const handleClick = (e: KonvaEventObject<MouseEvent>) => {
      if (e.evt.button !== 0) return; // Only proceed on left click

      if (clickTimeout.current || isAnimatingRef.current) return;

      clickTimeout.current = setTimeout(() => {
        clickTimeout.current = null;

        if (!children.length) return;

        const group = groupRef.current;
        if (!group) return;

        isAnimatingRef.current = true;

        if (hasAnimatedRef.current) {
          markAnimated();
          hasAnimatedRef.current = false;
        }

        group.to({
          scaleX: !isOpen ? scaleFather : scale,
          scaleY: !isOpen ? scaleFather : scale,
          duration: 0.1,
          easing: Konva.Easings.EaseInOut,
          onFinish: () => {
            isAnimatingRef.current = false;
          },
        });

        toggleOpen();
      }, 250);
    };

    return (
      <Group>
        {/* Círculo transparente HTML (fondo) */}
        {!isDragging && children.length !== 0 && (
          <Html
            divProps={{
              style: {
                pointerEvents: "none",
              },
            }}
          >
            <div
              style={{
                position: "absolute",
                width: postItW * scale,
                height: postItH * scale,
                borderRadius: "100%",
                backgroundColor: getBackgroundColor(),
                opacity: 0.3,
                pointerEvents: "none",
                transform: "translate(-50%, -50%)",
                left: position.x,
                top: position.y,
              }}
            />
          </Html>
        )}

        {!isDragging &&
          children.map((child, i) => (
            <ComparisonPostIt
              key={child.id}
              ref={null}
              postit={child}
              type={type}
              position={childPositions[i]}
              onDragStart={onDragStart}
              {...(onDragMove && { onDragMove })}
              onDragEnd={onDragEnd}
              onDblClick={onDblClick}
              onContentChange={onContentChange}
              onBlur={onBlur}
              onMouseEnter={onMouseEnter}
              onMouseLeave={onMouseLeave}
              onContextMenu={onContextMenu}
              mandalaRadius={mandalaRadius}
              currentMandalaName={currentMandalaName}
              disableDragging={true}
              scale={scaleChildren}
              zindex={zindex}
              characters={characters}
            />
          ))}

        <Group
          ref={(node) => {
            groupRef.current = node;
            if (typeof ref === "function") ref(node);
            else if (ref)
              (ref as React.MutableRefObject<Konva.Group | null>).current =
                node;
          }}
          x={position.x}
          y={position.y}
          draggable={!isEditing && !disableDragging}
          dragBoundFunc={dragBoundFunc}
          offset={{ x: postItW / 2, y: postItH / 2 }}
          scale={
            isOpen ? { x: scaleFather, y: scaleFather } : { x: scale, y: scale }
          }
          onDragStart={() => {
            onDragStart();
            setIsDragging(true);
          }}
          {...(onDragMove && { onDragMove })}
          onDragEnd={(e) => {
            onDragEnd(e);
            setTimeout(() => setIsDragging(false), 100);
          }}
          onClick={handleClick}
          onDblClick={() => {}}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onContextMenu={(e) => {
            onContextMenu(e, postit.id!);
          }}
        >
          <Circle
            x={postItW / 2}
            y={postItH / 2}
            radius={postItW / 2}
            strokeEnabled={false}
            onMouseEnter={(e) => {
              const container = e.target.getStage()?.container();
              if (container) {
                container.style.cursor = "pointer";
              }
            }}
            onMouseLeave={(e) => {
              const container = e.target.getStage()?.container();
              if (container) {
                container.style.cursor = "grab";
              }
            }}
          />

          {children.length > 0 && !isOpen && (
            <Html
              divProps={{
                style: {
                  pointerEvents: "none",
                  // zIndex removed to prevent Konva conflicts
                },
              }}
            >
              <div
                style={{
                  color: "white",
                  fontWeight: "bold",
                  fontSize: `${fontSize * 0.8}px`,
                  textAlign: "center",
                  pointerEvents: "none",
                  lineHeight: 1,
                  backgroundColor: "rgba(0,0,0,0.5)",
                  padding: "2px 4px",
                  borderRadius: "100px",
                }}
              >
                {children.length}
              </div>
            </Html>
          )}

          {postit.fromSummary && (
            <CharactersNames
              characters={postit.fromSummary}
              charactersColors={characters}
              fontSize={fontSize}
              zindex={zindex}
              postItWidth={postItW}
            />
          )}

          <Html
            divProps={{
              style: {
                pointerEvents: "none",
                // zIndex removed to prevent Konva conflicts
              },
            }}
          >
            <div
              ref={contentRef}
              style={{
                width: postItW,
                height: postItH,
                padding: `${horizontalPadding}px`,
                margin: 0,
                background: getBackgroundColor(),
                color: textColor,
                borderRadius: "50%",
                border: "none",
                boxSizing: "border-box",
                fontSize: `${fontSize}px`,
                lineHeight,
                textAlign: "center",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                overflow: "hidden",
              }}
            >
              {postit.content}
            </div>
            {type === "SIMILITUD" && (
              <ThumbsUp
                size={12}
                className="absolute bottom-5 left-1/2 -translate-x-1/2"
                color={textColor}
              />
            )}
            {type === "DIFERENCIA" && (
              <ThumbsDown
                size={12}
                className="absolute bottom-5 left-1/2 -translate-x-1/2"
                color={textColor}
              />
            )}
          </Html>
        </Group>
      </Group>
    );
  }
);

export default ComparisonPostIt;
