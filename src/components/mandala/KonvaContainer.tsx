import React, { useEffect, useMemo, useState } from "react";
import { Stage, Layer } from "react-konva";
import { Character, Mandala as MandalaData, Postit } from "@/types/mandala";
import { KonvaEventObject } from "konva/lib/Node";
import PostIt from "./postits/PostIt";
import CharacterIcon from "./characters/CharacterIcon";
import MandalaMenu from "./MandalaMenu";
import { useKonvaUtils } from "@/hooks/useKonvaUtils";
import { useContextMenu } from "@/hooks/useContextMenu.ts";
import NewPostItModal from "./postits/NewPostItModal";
import { Tag } from "@/types/mandala";
import { shouldShowCharacter, shouldShowPostIt } from "@/utils/filterUtils";
import { ReactZoomPanPinchState } from "react-zoom-pan-pinch";
import { useClosestPostIt } from "@/hooks/useClosestPostIt";
import { useVisibleChildren } from "@/hooks/useVisibleChildren";
import { useChildAnimations } from "@/hooks/useChildAnimations";
import { useVisibleChildrenPositions } from "@/hooks/useVisibleChildrenPositions";

export interface KonvaContainerProps {
  mandala: MandalaData;
  onPostItUpdate: (index: number, updates: Partial<Postit>) => Promise<boolean>;
  onPostItDelete: (index: number) => Promise<boolean>;
  onPostItChildCreate: (
    content: string,
    tag: Tag,
    postitFatherId?: string
  ) => void;
  characters?: Character[];
  onCharacterUpdate: (
    index: number,
    updates: Partial<Character>
  ) => Promise<boolean | void>;
  onCharacterDelete: (index: number) => Promise<boolean>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  appliedFilters: Record<string, string[]>;
  tags: Tag[];
  onNewTag: (tag: Tag) => void;
  state: ReactZoomPanPinchState | null;
}

const SCENE_W = 1200;
const SCENE_H = 1200;

const KonvaContainer: React.FC<KonvaContainerProps> = ({
  mandala,
  onPostItUpdate,
  onPostItDelete,
  onPostItChildCreate,
  onCharacterUpdate,
  onCharacterDelete,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDragEnd,
  appliedFilters,
  tags,
  onNewTag,
  state,
}) => {
  const [editableIndex, setEditableIndex] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [isChildPostItModalOpen, setIsChildPostItModalOpen] = useState(false);
  const [selectedPostItId, setSelectedPostItId] = useState<string | undefined>(
    undefined
  );
  const [visibleChildren, setVisibleChildren] = useState<Postit[]>([]);
  const [isDraggingParent, setIsDraggingParent] = useState(false);
  const [exitingChildren, setExitingChildren] = useState<
    { postit: Postit; initialPosition: { x: number; y: number } }[]
  >([]);

  const postItW = 64;
  const postItH = 64;
  const padding = 12;
  const childScale = 0.6;

  const handleCreateChildPostIt = (postItId?: string) => {
    setSelectedPostItId(postItId);
    setIsChildPostItModalOpen(true);
  };

  const {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    handleDelete,
    handleCreateChild,
  } = useContextMenu(
    onPostItDelete,
    onCharacterDelete,
    editableIndex,
    setEditableIndex,
    setEditingContent,
    (index) => {
      const postItId = mandala.postits[index]?.id;
      handleCreateChildPostIt(postItId);
    }
  );

  const {
    zOrder,
    bringToFront,
    toAbsolute,
    toRelative,
    clamp,
    getDimensionAndSectionFromCoordinates,
  } = useKonvaUtils(mandala.postits);

  const dimensionColors = useMemo(() => {
    return (
      mandala.mandala.configuration?.dimensions?.reduce((acc, d) => {
        acc[d.name] = d.color;
        return acc;
      }, {} as Record<string, string>) ?? {}
    );
  }, [mandala.mandala.configuration?.dimensions]);

  const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
    const node = e.target;
    node.position({
      x: clamp(node.x(), SCENE_W - postItW),
      y: clamp(node.y(), SCENE_H - postItH),
    });
  };

  const handleOnDragEndPostIt = async (
    e: KonvaEventObject<DragEvent>,
    index: number,
    postit: Postit
  ) => {
    onDragEnd();
    const nx = e.target.x(),
      ny = e.target.y();
    const rel = toRelative(nx, ny);
    const { dimension, section } = getDimensionAndSectionFromCoordinates(
      rel.x,
      rel.y,
      mandala.mandala.configuration?.dimensions.map((d) => d.name) || [],
      mandala.mandala.configuration?.scales || []
    );
    await onPostItUpdate(index, {
      coordinates: { ...postit.coordinates, x: rel.x, y: rel.y },
      dimension,
      section,
    });
  };

  const handleOnDragEndCharacter = async (
    e: KonvaEventObject<DragEvent>,
    character: Character
  ) => {
    onDragEnd();
    const nx = e.target.x(),
      ny = e.target.y();
    const rel = toRelative(nx, ny);
    const { dimension, section } = getDimensionAndSectionFromCoordinates(
      rel.x,
      rel.y,
      mandala.mandala.configuration?.dimensions.map((d) => d.name) || [],
      mandala.mandala.configuration?.scales || []
    );

    const characterIndex =
      mandala.characters?.findIndex((c) => c.id === character.id) ?? -1;

    if (characterIndex !== -1) {
      await onCharacterUpdate(characterIndex, {
        position: { x: rel.x, y: rel.y },
        dimension,
        section,
      });
    }
  };

  const zoomLevel = state?.scale;
  const closestPostIt = useClosestPostIt(
    mandala.postits,
    toAbsolute,
    state,
    SCENE_W
  );

  const visibleChildrenPositions = useVisibleChildrenPositions(
    closestPostIt,
    visibleChildren,
    toAbsolute,
    postItW,
    postItH,
    childScale
  );

  const childrenToShow = useVisibleChildren(
    zoomLevel,
    closestPostIt,
    mandala.postits
  );

  useChildAnimations(
    childrenToShow,
    visibleChildren,
    setVisibleChildren,
    setExitingChildren,
    toAbsolute,
    visibleChildrenPositions
  );

  useEffect(() => {
    const handleStageMouseDown = (e: MouseEvent) => {
      // Si hay algo editando y se hizo clic fuera del textarea => blur
      if (editableIndex !== null) {
        const clickedOnTextarea = (e.target as HTMLElement).closest("textarea");
        if (!clickedOnTextarea) {
          setEditableIndex(null);
          setEditingContent(null);
          window.getSelection()?.removeAllRanges();
        }
      }
    };

    const container = document.getElementById("konva-container");
    container?.addEventListener("mousedown", handleStageMouseDown);

    return () => {
      container?.removeEventListener("mousedown", handleStageMouseDown);
    };
  }, [editableIndex]);

  if (!mandala || !state) return <div>No mandala found</div>;

  return (
    <div
      id="konva-container"
      style={{
        position: "relative",
        clipPath: `circle(${SCENE_W / 2}px at center)`,
      }}
      onClick={hideContextMenu}
    >
      <Stage width={SCENE_W} height={SCENE_H}>
        <Layer>
          {zOrder.map((i) => {
            const p = mandala.postits[i];
            if (p.parentId) return null;
            if (!shouldShowPostIt(p, appliedFilters)) return null;
            const { x, y } = toAbsolute(p.coordinates.x, p.coordinates.y);
            const isEditing = editableIndex === i;

            return (
              <PostIt
                key={i}
                postit={p}
                isEditing={isEditing}
                editingContent={editingContent}
                dimensionColors={dimensionColors}
                postItW={postItW}
                postItH={postItH}
                padding={padding}
                position={{ x, y }}
                onDragStart={() => {
                  setIsDraggingParent(true);
                  onDragStart();
                  setVisibleChildren([]);
                  bringToFront(i);
                }}
                onDragMove={handleDragMove}
                onDragEnd={(e) => {
                  setIsDraggingParent(false);
                  handleOnDragEndPostIt(e, i, p);
                }}
                onDblClick={() => {
                  setEditableIndex(i);
                  setEditingContent(p.content);
                  bringToFront(i);
                }}
                onContentChange={(newValue) => {
                  setEditingContent(newValue);
                  onPostItUpdate(i, { content: newValue });
                }}
                onBlur={() => {
                  window.getSelection()?.removeAllRanges();
                  setEditableIndex(null);
                  setEditingContent(null);
                }}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onContextMenu={(e) => showContextMenu(e, i, "postit")}
                mandalaRadius={SCENE_W / 2}
              />
            );
          })}

          {closestPostIt &&
            !isDraggingParent &&
            visibleChildren.map((child, i) => {
              const parentAbs = toAbsolute(
                closestPostIt.coordinates.x,
                closestPostIt.coordinates.y
              );

              const parentCenterX = parentAbs.x + postItW / 2;
              const parentCenterY = parentAbs.y + postItH / 2;

              const postItRadius = (postItW * childScale) / 2;
              const spacing = 10;
              const requiredCircumference =
                visibleChildren.length * (2 * postItRadius + spacing);
              const adjustedOrbitRadius = requiredCircumference / (2 * Math.PI);
              const orbitRadius = Math.max(adjustedOrbitRadius, 60);

              const angle = (2 * Math.PI * i) / visibleChildren.length;

              const rawX = parentCenterX + orbitRadius * Math.cos(angle);
              const rawY = parentCenterY + orbitRadius * Math.sin(angle);

              const finalX = rawX - postItRadius;
              const finalY = rawY - postItRadius;

              const globalIndex = mandala.postits.findIndex(
                (p) => p.id === child.id
              );
              const isEditing = editableIndex === globalIndex;

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
                  padding={padding * childScale}
                  position={{ x: finalX, y: finalY }}
                  onDragStart={() => {}}
                  onDragMove={() => {}}
                  onDragEnd={() => {}}
                  onDblClick={() => {
                    setEditableIndex(globalIndex);
                    setEditingContent(child.content);
                  }}
                  onContentChange={(newValue) => {
                    setEditingContent(newValue);
                    onPostItUpdate(globalIndex, { content: newValue });
                  }}
                  onBlur={() => {
                    window.getSelection()?.removeAllRanges();
                    setEditableIndex(null);
                    setEditingContent(null);
                  }}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  onContextMenu={(e) =>
                    showContextMenu(e, globalIndex, "postit")
                  }
                  mandalaRadius={SCENE_W / 2}
                  shouldAnimate={true}
                  initialPosition={{
                    x: parentCenterX - (postItW * childScale) / 2,
                    y: parentCenterY - (postItH * childScale) / 2,
                  }}
                />
              );
            })}

          {closestPostIt &&
            exitingChildren.map(({ postit: child, initialPosition }) => {
              const parentAbs = toAbsolute(
                closestPostIt.coordinates.x,
                closestPostIt.coordinates.y
              );

              const finalX =
                parentAbs.x + postItW / 2 - (postItW * childScale) / 2;
              const finalY =
                parentAbs.y + postItH / 2 - (postItH * childScale) / 2;

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
                  padding={padding * childScale}
                  position={{ x: finalX, y: finalY }}
                  initialPosition={initialPosition}
                  shouldAnimate={true}
                  onDragStart={() => {}}
                  onDragMove={() => {}}
                  onDragEnd={() => {}}
                  onDblClick={() => {}}
                  onContentChange={() => {}}
                  onBlur={() => {}}
                  onMouseEnter={() => {}}
                  onMouseLeave={() => {}}
                  onContextMenu={() => {}}
                  mandalaRadius={SCENE_W / 2}
                />
              );
            })}

          {mandala.characters?.map((character, index) => {
            if (!shouldShowCharacter(character, appliedFilters)) return null;
            const { x, y } = toAbsolute(
              character.position.x,
              character.position.y
            );

            return (
              <CharacterIcon
                key={`character-${character.id}`}
                mandalaRadius={SCENE_W / 2}
                character={character}
                position={{ x, y }}
                onDragStart={onDragStart}
                onDragEnd={(e) => handleOnDragEndCharacter(e, character)}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onContextMenu={(e) => showContextMenu(e, index, "character")}
              />
            );
          })}
        </Layer>
      </Stage>

      {contextMenu.visible && (
        <div
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
            zIndex: 1000,
          }}
          onClick={hideContextMenu}
        >
          <MandalaMenu
            onDelete={handleDelete}
            onCreateChild={
              contextMenu.type === "postit" ? handleCreateChild : undefined
            }
            isContextMenu={true}
          />
        </div>
      )}

      <NewPostItModal
        isOpen={isChildPostItModalOpen}
        onOpenChange={setIsChildPostItModalOpen}
        tags={tags}
        onNewTag={onNewTag}
        postItFatherId={selectedPostItId}
        onCreate={(content, tag, postItFatherId) => {
          onPostItChildCreate(content, tag, postItFatherId);
          setIsChildPostItModalOpen(false);
          setSelectedPostItId(undefined);
        }}
      />
    </div>
  );
};

export default KonvaContainer;
