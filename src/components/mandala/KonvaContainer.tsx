import React, { useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import { Character, Mandala as MandalaData, Postit } from "@/types/mandala";
import { KonvaEventObject } from "konva/lib/Node";
import PostIt from "./postits/PostIt";
import CharacterIcon from "./characters/CharacterIcon";

export interface KonvaContainerProps {
  mandala: MandalaData;
  onPostItUpdate: (index: number, updates: Partial<Postit>) => Promise<boolean>;
  characters?: Character[];
  onCharacterUpdate: (
    index: number,
    updates: Partial<Character>
  ) => Promise<boolean | void>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
  appliedFilters: Record<string, string[]>;
}

const SCENE_W = 1200;
const SCENE_H = 1200;

const KonvaContainer: React.FC<KonvaContainerProps> = ({
  mandala,
  onPostItUpdate,
  onCharacterUpdate,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDragEnd, appliedFilters

}) => {
  const [editableIndex, setEditableIndex] = useState<number | null>(null);
  const [postItW, postItH, padding] = [64, 64, 5];
  const [editingContent, setEditingContent] = useState<string | null>(null);
  const [zOrder, setZOrder] = useState<number[]>(
    mandala.postits.map((_, idx) => idx)
  );

  const shouldShowPostIt = (postit: Postit): boolean => {
    const { dimension, section } = postit;

    const dimensionFilter = appliedFilters["Dimensiones"] || [];
    const scaleFilter = appliedFilters["Escalas"] || [];
    const tagFilter = appliedFilters["Tags"] || [];

    return (
        (dimensionFilter.length === 0 || dimensionFilter.includes(dimension)) &&
        (scaleFilter.length === 0 || scaleFilter.includes(section))
    );
  };

  const dimensionColors: Record<string, string> =
    mandala.mandala.configuration?.dimensions?.reduce((acc, d) => {
      acc[d.name] = d.color;
      return acc;
    }, {} as Record<string, string>) ?? {};

  useEffect(() => {
    setZOrder(mandala.postits.map((_, idx) => idx));
  }, [mandala.postits, mandala.postits.length]);

  const toAbsolute = (rx: number, ry: number) => ({
    x: ((rx + 1) / 2) * (SCENE_W - postItW),
    y: ((1 - ry) / 2) * (SCENE_H - postItH),
  });

  const toRelative = (x: number, y: number) => ({
    x: (x / (SCENE_W - postItW)) * 2 - 1,
    y: 1 - (y / (SCENE_H - postItH)) * 2,
  });

  const clamp = (v: number, max: number) => Math.max(0, Math.min(v, max));
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
      rel.y
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
      rel.y
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

  const getDimensionAndSectionFromCoordinates = (
    x: number,
    y: number
  ): { dimension: string; section: string } => {
    const dimensions =
      mandala.mandala.configuration?.dimensions?.map((d) => d.name) ?? [];
    const sections = mandala.mandala.configuration?.scales ?? [];
    const angle = Math.atan2(y, x);
    const adjustedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

    const rawDistance = Math.sqrt(x * x + y * y);
    const normalizedDistance = Math.min(rawDistance / Math.SQRT2, 1);

    const dimIndex = Math.floor(
      (adjustedAngle / (2 * Math.PI)) * dimensions.length
    );
    const secIndex = Math.floor(normalizedDistance * sections.length);

    return {
      dimension: dimensions[Math.min(dimIndex, dimensions.length - 1)],
      section: sections[Math.min(secIndex, sections.length - 1)],
    };
  };

  const bringToFront = (index: number) => {
    setZOrder((prev) => {
      const filtered = prev.filter((i) => i !== index);
      return [...filtered, index]; // último = más arriba
    });
  };

  if (!mandala) return <div>No mandala found</div>;

  return (
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
            />
          );
        })}
        {mandala.characters?.map((character) => {
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
            />
          );
        })}
      </Layer>
    </Stage>
  );
};

export default KonvaContainer;
