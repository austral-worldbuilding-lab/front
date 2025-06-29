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
  onPostItDelete: (id: string) => Promise<boolean>;
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
  onCharacterDelete: (id: string) => Promise<boolean>;
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

  const postItW = 64;
  const postItH = 64;
  const padding = 12;

  const {
    zOrder,
    bringToFront,
    toAbsolute,
    toRelative,
    clamp,
    getDimensionAndSectionFromCoordinates,
    toAbsolutePostit,
    toRelativePostit,
  } = useKonvaUtils(mandala.postits);

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
    (id) => {
      setSelectedPostItId(id);
      setIsChildPostItModalOpen(true);
    }
  );

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
    const rel = toRelativePostit(nx, ny);
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

  useEffect(() => {
    const handleStageMouseDown = (e: MouseEvent) => {
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
            if (!shouldShowPostIt(p, appliedFilters)) return null;
            const { x, y } = toAbsolutePostit(p.coordinates.x, p.coordinates.y);
            const isEditing = editableIndex === i;

            return (
              <PostIt
                key={`static-${p.id}`}
                postit={p}
                isEditing={isEditing}
                editingContent={editingContent}
                color={dimensionColors[p.dimension] || "#cccccc"}
                postItW={postItW}
                postItH={postItH}
                padding={padding}
                position={{ x, y }}
                onDragStart={() => {
                  onDragStart();
                  bringToFront(i);
                }}
                onDragMove={handleDragMove}
                onDragEnd={(e) => {
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
                onContextMenu={(e, i) => showContextMenu(e, i, "postit")}
                mandalaRadius={SCENE_W / 2}
              />
            );
          })}

          {mandala.characters?.map((character) => {
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
                onContextMenu={(e) =>
                  showContextMenu(e, character.id, "character")
                }
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
