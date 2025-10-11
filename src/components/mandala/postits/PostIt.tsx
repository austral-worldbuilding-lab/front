import React, { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Circle, Group, Transformer } from "react-konva";
import { Html } from "react-konva-utils";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Postit } from "@/types/mandala";
import { isDarkColor } from "@/utils/colorUtils";
import useDragBoundFunc from "@/hooks/useDragBoundFunc";
import { usePostItAnimation } from "@/hooks/usePostItAnimation";
import MandalaBadge from "./MandalaBadge";
import { useAuth } from "@/hooks/useAuth";

interface PostItProps {
  postit: Postit;
  color: string;
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
  isUnifiedMandala?: boolean;
  currentMandalaName?: string;
  disableDragging?: boolean;
  scale?: number;
  zindex?: number;
}

const PostIt = React.forwardRef<Konva.Group, PostItProps>((props, ref) => {
  const {
    postit,
    color,
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
    isUnifiedMandala,
    currentMandalaName,
    disableDragging,
    scale = 1,
    zindex
  } = props;

  const groupRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const clickTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const textColor = isDarkColor(color) ? "white" : "black";
  const { shouldAnimate, markAnimated, isOpen, toggleOpen } =
    usePostItAnimation(postit.id!);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContent, setEditingContent] = useState<string>(
    postit.content ?? ""
  );
  const [resizeScale, setResizeScale] = useState<number>(1);

  const postItW = 100;
  const postItH = 100;
  const padding = 12;
  const scaleFather = 0.4 * scale;
  const scaleChildren = 0.25 * scale;
  const fontSize = postItW / 10;
  const children = useMemo(() => postit.childrens || [], [postit.childrens]);

  const baseScale = isOpen ? scaleFather : scale;
  const currentScale = baseScale * resizeScale;
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

  const exitEditMode = () => {
    setIsEditing(false);
    window.getSelection()?.removeAllRanges();
  };

  const emitSyntheticDragEnd = useCallback(() => {
    const node = groupRef.current;
    if (!node) return;
    const synthetic = ({ target: node } as unknown) as KonvaEventObject<DragEvent>;
    onDragEnd(synthetic);
  }, [onDragEnd]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isEditing) return;

      // If clicked inside textarea, ignore
      if (textAreaRef.current && textAreaRef.current.contains(e.target as Node)) {
        return;
      }

      // If clicked on Transformer handles, ignore
      const stage = groupRef.current?.getStage();
      const tr = trRef.current as unknown as Konva.Transformer | null;
      try {
        const pos = stage?.getPointerPosition();
        if (stage && tr && pos) {
          const shape = stage.getIntersection(pos);
          if (shape) {
            const transformerAncestor = shape.findAncestor((n: Konva.Node) => n.getClassName() === "Transformer", true);
            if (transformerAncestor && transformerAncestor === tr) {
              return; // interacting with handles
            }
          }
        }
      } catch {
        // no-op
      }

      // Otherwise, exit edit mode and ensure parent re-enables zoom/pan
      exitEditMode();
      onBlur();
      emitSyntheticDragEnd();
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("contextmenu", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("contextmenu", handleClickOutside);
    };
  }, [isEditing, onBlur, emitSyntheticDragEnd]);

  const { user } = useAuth();

  const externalEditors = useMemo(() => {
    return postit.editingUsers?.filter(
      (editingUser) => editingUser.id !== user?.uid
    );
  }, [postit.editingUsers, user]);

  const editorCount = externalEditors?.length ?? 0;
  const primaryEditorName = externalEditors?.[0]?.displayName ?? "";
  const showExtraCount = editorCount > 1 ? editorCount - 1 : 0;

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

  // While resizing (transforming), notify parent to disable zoom/pan
  useEffect(() => {
    const node = groupRef.current;
    if (!node) return;
    const handleTransformStart = () => {
      onDragStart();
    };
    const handleTransformEnd = () => {
      emitSyntheticDragEnd();
    };
    node.on("transformstart", handleTransformStart);
    node.on("transformend", handleTransformEnd);
    return () => {
      node.off("transformstart", handleTransformStart);
      node.off("transformend", handleTransformEnd);
    };
  }, [onDragStart, emitSyntheticDragEnd]);

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
              backgroundColor: color,
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
          <PostIt
            key={child.id}
            ref={null}
            postit={child}
            color={color}
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
            isUnifiedMandala={isUnifiedMandala}
            currentMandalaName={currentMandalaName}
            disableDragging={true}
            scale={scaleChildren}
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
        scale={{ x: currentScale, y: currentScale }}
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
        onDblClick={() => {
          if (clickTimeout.current) {
            clearTimeout(clickTimeout.current);
            clickTimeout.current = null;
          }
          setIsEditing(true);
          setEditingContent(postit.content ?? "");

          setTimeout(() => {
            const textarea = textAreaRef.current;
            if (textarea) {
              textarea.focus();
              textarea.selectionStart = textarea.selectionEnd =
                textarea.value.length;
            }
          }, 0);
          onDblClick();
        }}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onContextMenu={(e) => {
          onContextMenu(e, postit.id!);
        }}
        onTransformEnd={() => {
          const node = groupRef.current;
          if (!node) return;
          const scaleX = node.scaleX();
          const nextResize = Math.max(0.25, Math.min(4, scaleX / baseScale));
          setResizeScale(nextResize);
        }}
      >
        {/* Transformer moved outside of the target group */}
        <Circle
          x={postItW / 2}
          y={postItH / 2}
          radius={postItW / 2}
          stroke={editorCount ? "white" : undefined}
          strokeWidth={4}
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

        {isUnifiedMandala && currentMandalaName && (
          <MandalaBadge
            originMandalaName={postit.from?.name}
            fontSize={fontSize}
          />
        )}
        <Html
          divProps={{
            style: {
              pointerEvents: isEditing ? "auto" : "none",
              zIndex: zindex
            },
          }}
        >
          <textarea
            ref={textAreaRef}
            disabled={!isEditing}
            value={isEditing ? editingContent ?? "" : postit.content}
            onChange={(e) => {
              setEditingContent(e.target.value);
              onContentChange(e.target.value, postit.id!);
            }}
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
              border: "solid 1px rgba(0,0,0,0.3)",
              boxSizing: "border-box",
              fontSize: `${fontSize}px`,
              lineHeight: 1.1,
              overflow: "hidden",
              textAlign: "center",
            }}
          />
          {editorCount > 0 && (
            <div
              style={{
                position: "absolute",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                fontSize: `${fontSize * 0.9}px`,
                fontWeight: 600,
                color: "#fff",
                left: "50%",
                transform: "translateX(-50%)",
                top: "-28px"
              }}
            >
              <div
                style={{
                  background: "rgba(0,0,0,0.75)",
                  padding: "4px 8px",
                  borderRadius: 8,
                  border: "1px solid black",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                }}
              >
                {primaryEditorName}
              </div>
              {showExtraCount > 0 && (
                <div
                  style={{
                    minWidth: "22px",
                    height: "22px",
                    borderRadius: "50%",
                    background: "rgba(0,0,0,0.75)",
                    border: "1px solid black",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: `${fontSize * 0.8}px`,
                    fontWeight: 600,
                  }}
                >
                  +{showExtraCount}
                </div>
              )}
            </div>
          )}
        </Html>
      </Group>
      {isEditing && (
        <Transformer
          ref={trRef}
          rotateEnabled={false}
          keepRatio
          enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
          boundBoxFunc={(_oldBox, newBox) => {
            const min = 30;
            const max = 600;
            const width = Math.max(min, Math.min(max, newBox.width));
            return { ...newBox, width, height: width };
          }}
        />
      )}
    </Group>
  );
});

export default PostIt;
