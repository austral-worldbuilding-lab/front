import React, { useState } from "react";
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
}) => {
  const [editableIndex, setEditableIndex] = useState<number | null>(null);
  const [postItW, postItH, padding] = [64, 64, 5];
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [isChildPostItModalOpen, setIsChildPostItModalOpen] = useState(false);
  const [selectedPostItId, setSelectedPostItId] = useState<string | undefined>(
    undefined
  );

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

  const shouldShowPostIt = (postit: Postit): boolean => {
    if (!postit) return false;
    const { dimension, section } = postit;

    const dimensionFilter = appliedFilters["Dimensiones"] || [];
    const scaleFilter = appliedFilters["Escalas"] || [];
    const tagFilter = appliedFilters["Tags"] || [];

    return (
      (dimensionFilter.length === 0 || dimensionFilter.includes(dimension)) &&
      (scaleFilter.length === 0 || scaleFilter.includes(section)) &&
      (tagFilter.length === 0 || tagFilter.includes(postit.tag?.label || ""))
    );
  };

  const dimensionColors: Record<string, string> =
    mandala.mandala.configuration?.dimensions?.reduce((acc, d) => {
      acc[d.name] = d.color;
      return acc;
    }, {} as Record<string, string>) ?? {};

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

    // Find the index of this character in the mandala.characters array
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

  if (!mandala) return <div>No mandala found</div>;

  return (
    <div style={{ position: "relative" }} onClick={hideContextMenu}>
      <Stage width={SCENE_W} height={SCENE_H} offsetX={0} offsetY={0}>
        <Layer>
          {zOrder.map((i) => {
            const p = mandala.postits[i];
            if (!shouldShowPostIt(p)) return null;
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
              />
            );
          })}
          {mandala.characters?.map((character, index) => {
            const { x, y } = toAbsolute(
              character.position.x,
              character.position.y
            );

            return (
              <CharacterIcon
                key={`character-${character.id}`}
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
          console.log("postItFatherId", postItFatherId);
          onPostItChildCreate(content, tag, postItFatherId);
          setIsChildPostItModalOpen(false);
          setSelectedPostItId(undefined);
        }}
      />
    </div>
  );
};

export default KonvaContainer;
