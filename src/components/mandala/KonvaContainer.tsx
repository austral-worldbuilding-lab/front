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
  const center = useMemo(() => {
    if (!state) return { x: SCENE_W / 2, y: SCENE_H / 2 };

    const scale = state.scale;
    const offsetX = state.positionX;
    const offsetY = state.positionY;

    return {
      x: (SCENE_W / 2 - offsetX) / scale,
      y: (SCENE_H / 2 - offsetY) / scale,
    };
  }, [state]);

  const postitsWithAbs = mandala.postits
    .filter((p) => !p.parentId)
    .map((p) => ({
      ...p,
      abs: toAbsolute(p.coordinates.x, p.coordinates.y),
    }));

  const closestPostIt =
    postitsWithAbs.length > 0
      ? postitsWithAbs.reduce((closest, current) => {
          const d1 = Math.hypot(
            closest.abs.x - center.x,
            closest.abs.y - center.y
          );
          const d2 = Math.hypot(
            current.abs.x - center.x,
            current.abs.y - center.y
          );
          return d1 < d2 ? closest : current;
        }, postitsWithAbs[0])
      : null;

  const childrenToShow = useMemo(() => {
    if ((zoomLevel ?? 0) > 2 && closestPostIt) {
      return mandala.postits
        .filter((p) => p.parentId === closestPostIt.id)
        .map((child) => ({
          ...child,
          dimension: closestPostIt.dimension,
        }));
    }
    return [];
  }, [zoomLevel, closestPostIt, mandala.postits]);

  useEffect(() => {
    const entering = childrenToShow.filter(
      (c) => !visibleChildren.some((v) => v.id === c.id)
    );
    const exiting = visibleChildren.filter(
      (v) => !childrenToShow.some((c) => c.id === v.id)
    );

    if (entering.length > 0 || exiting.length > 0) {
      setVisibleChildren((prev) => [
        ...prev.filter((v) => !exiting.find((e) => e.id === v.id)),
        ...entering,
      ]);

      exiting.forEach((exitingChild) => {
        setTimeout(() => {
          setVisibleChildren((prev) =>
            prev.filter((p) => p.id !== exitingChild.id)
          );
        }, 300);
      });
    }
  }, [childrenToShow, visibleChildren]);

  if (!mandala || !state) return <div>No mandala found</div>;

  return (
    <div
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
                  onDragStart();
                  setVisibleChildren([]);
                  bringToFront(i);
                }}
                onDragMove={handleDragMove}
                onDragEnd={(e) => handleOnDragEndPostIt(e, i, p)}
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

              return (
                <PostIt
                  key={child.id}
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
                  shouldAnimate={true}
                  isExiting={!childrenToShow.find((p) => p.id === child.id)}
                  initialPosition={{
                    x: parentCenterX - (postItW * childScale) / 2,
                    y: parentCenterY - (postItH * childScale) / 2,
                  }}
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
