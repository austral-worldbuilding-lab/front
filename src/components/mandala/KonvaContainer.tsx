import React, { useMemo, useRef, useEffect, useState } from "react";
import { Stage, Layer } from "react-konva";
import {
  Character,
  Mandala as MandalaData,
  MandalaImage,
  Postit,
} from "@/types/mandala";
import { KonvaEventObject } from "konva/lib/Node";
import { Layer as KonvaLayer } from "konva/lib/Layer";
import PostIt from "./postits/PostIt";
import CharacterIcon from "./characters/CharacterIcon";
import MandalaImageComponent from "./filters/images/MandalaImage";
import MandalaMenu from "./MandalaMenu";
import { useKonvaUtils } from "@/hooks/useKonvaUtils";
import { useContextMenu } from "@/hooks/useContextMenu.ts";
import NewPostItModal from "./postits/NewPostItModal";
import { Tag } from "@/types/mandala";
import {
  shouldShowCharacter,
  shouldShowPostIt,
  shouldShowImage,
} from "@/utils/filterUtils";
import { ReactZoomPanPinchState } from "react-zoom-pan-pinch";

import { useEditPostIt } from "@/hooks/useEditPostit.ts";
import EditPostItModal from "@/components/mandala/postits/EditPostitModal.tsx";
import ComparisonPostIt from "./postits/ComparisonPostIt";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import { useParams } from "react-router-dom";

export interface KonvaContainerProps {
  mandala: MandalaData;
  onPostItUpdate: (id: string, updates: Partial<Postit>) => Promise<boolean>;
  onPostItDelete: (id: string) => Promise<boolean>;
  onPostItChildCreate: (
    content: string,
    tags: Tag[],
    postitFatherId?: string
  ) => void;
  characters?: Character[];
  onCharacterUpdate: (
    index: number,
    updates: Partial<Character>
  ) => Promise<boolean | void>;
  onCharacterDelete: (id: string) => Promise<boolean>;
  onImageUpdate: (
    id: string,
    updates: Partial<MandalaImage>
  ) => Promise<boolean>;
  onImageDelete: (id: string) => Promise<boolean>;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onDragStart: (postitId: string) => void;
  onDragEnd: (postitId: string) => void;
  appliedFilters: Record<string, string[]>;
  tags: Tag[];
  onNewTag: (tag: Tag) => void;
  state: ReactZoomPanPinchState | null;
  onDblClick?: (postitId: string) => void;
  onBlur?: (postitId: string) => void;
  onContextMenu?: (postitId: string) => void;
}

const KonvaContainer: React.FC<KonvaContainerProps> = ({
  mandala,
  onPostItUpdate,
  onPostItDelete,
  onPostItChildCreate,
  onCharacterUpdate,
  onCharacterDelete,
  onImageUpdate,
  onImageDelete,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDragEnd,
  appliedFilters,
  tags,
  onNewTag,
  state,
  onDblClick,
  onBlur,
  onContextMenu,
}) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { hasAccess, userRole } = useProjectAccess(projectId || "");
  const canEdit =
    !!hasAccess &&
    (userRole === null || ["dueño", "facilitador", "worldbuilder"].includes(userRole));
  const [, setEditableIndex] = useState<number | null>(null);
  const [, setEditingContent] = useState<string | null>(null);
  const [isChildPostItModalOpen, setIsChildPostItModalOpen] = useState(false);
  const [selectedPostItId, setSelectedPostItId] = useState<string | undefined>(
    undefined
  );

  const maxRadius = 150 * (mandala.mandala.configuration?.scales.length || 1);
  const SCENE_W = maxRadius * 2;
  const SCENE_H = maxRadius * 2;

  const charactersLayerRef = useRef<KonvaLayer>(null);

  const { toAbsolutePostit, toRelativePostit } = useKonvaUtils(
    mandala.postits,
    maxRadius
  );

  const {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    handleDelete,
    handleCreateChild,
    handleEditPostIt,
  } = useContextMenu(
    onPostItDelete,
    onCharacterDelete,
    setEditableIndex,
    setEditingContent,
    (id) => {
      setSelectedPostItId(id);
      setIsChildPostItModalOpen(true);
    },
    (id) => {
      const postit = mandala.postits.find((p) => p.id === id);
      if (postit) {
        openEditModal(mandala.id, postit);
      }
    },
    onImageDelete
  );

  // Ensure we call onBlur (to remove editing user) when context menu closes
  const lastPostItIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (
      contextMenu.visible &&
      contextMenu.type === "postit" &&
      contextMenu.postItId
    ) {
      lastPostItIdRef.current = contextMenu.postItId;
    }
  }, [contextMenu.visible, contextMenu.type, contextMenu.postItId]);
  useEffect(() => {
    if (!contextMenu.visible && lastPostItIdRef.current) {
      onBlur?.(lastPostItIdRef.current);
      lastPostItIdRef.current = null;
    }
  }, [contextMenu.visible, onBlur]);

  const {
    isOpen: isEditModalOpen,
    postit: editingPostit,
    open: openEditModal,
    close: closeEditModal,
    handleUpdate,
  } = useEditPostIt();

  const {
    zOrder,
    bringToFront,
    toAbsolute,
    toRelative,
    getDimensionAndSectionFromCoordinates,
  } = useKonvaUtils(mandala.postits, SCENE_W / 2, mandala.images);

  const dimensionColors = useMemo(() => {
    return (
      mandala.mandala.configuration?.dimensions?.reduce((acc, d) => {
        acc[d.name] = d.color;
        return acc;
      }, {} as Record<string, string>) ?? {}
    );
  }, [mandala.mandala.configuration?.dimensions]);

  const handleOnDragEndPostIt = async (
    e: KonvaEventObject<Event>,
    id: string,
    postit: Postit
  ) => {
    const nx = e.target.x(),
      ny = e.target.y();
    const rel = toRelativePostit(nx, ny);
    const { dimension, section } = getDimensionAndSectionFromCoordinates(
      rel.x,
      rel.y,
      mandala.mandala.configuration?.dimensions.map((d) => d.name) || [],
      mandala.mandala.configuration?.scales || []
    );
    await onPostItUpdate(id, {
      coordinates: { ...postit.coordinates, x: rel.x, y: rel.y },
      dimension,
      section,
      scale: postit.scale ?? 1,
    });
    onDragEnd(postit.id!);
  };

  const handleOnDragEndCharacter = async (
    e: KonvaEventObject<DragEvent>,
    character: Character
  ) => {
    onDragEnd(character.id);
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

  const handleOnDragEndImage = async (
    e: KonvaEventObject<Event>,
    image: MandalaImage
  ) => {
    const nx = e.target.x(),
      ny = e.target.y();
    const rel = toRelativePostit(nx, ny);
    const { dimension, section } = getDimensionAndSectionFromCoordinates(
      rel.x,
      rel.y,
      mandala.mandala.configuration?.dimensions.map((d) => d.name) || [],
      mandala.mandala.configuration?.scales || []
    );

    await onImageUpdate(image.id, {
      coordinates: { x: rel.x, y: rel.y },
      dimension,
      section,
      scale: image.scale ?? 1,
    });
    onDragEnd(image.id);
  };

  if (!mandala || !state) return <div>No mandala found</div>;

  return (
    <div
      id="konva-container"
      style={{
        position: "relative",
        clipPath: `circle(${maxRadius}px at center)`,
      }}
      onClick={hideContextMenu}
    >
      <Stage width={SCENE_W} height={SCENE_H} offset={{ x: 0, y: 0 }}>
        <Layer>
          {zOrder.map((item, orderIndex) => {
            const id = item.id;

            if (item.type === "postit") {
              const p = mandala.postits.find((postit) => postit.id === id)!;
              if (!shouldShowPostIt(p, appliedFilters)) return null;
              const { x, y } = toAbsolutePostit(
                p.coordinates.x,
                p.coordinates.y
              );
              const mandalaType = mandala.mandala.type;

              if (mandalaType === "OVERLAP_SUMMARY") {
                return (
                  <ComparisonPostIt
                    key={`static-${p.id}`}
                    postit={p}
                    type={p.type || "UNICO"}
                    position={{ x, y }}
                    onDragStart={() => {
                      onDragStart(p.id!);
                      bringToFront({ type: "postit", id: id });
                    }}
                    onDragEnd={(e) => {
                      handleOnDragEndPostIt(e, p.id!, p);
                    }}
                    onDblClick={() => {
                      bringToFront({ type: "postit", id: id });
                      onDblClick?.(p.id!);
                    }}
                    onContentChange={(newValue, id) => {
                      onPostItUpdate(id, { content: newValue });
                    }}
                    onBlur={() => {
                      window.getSelection()?.removeAllRanges();
                      setEditableIndex(null);
                      onBlur?.(p.id!);
                    }}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onContextMenu={(e) => {
                      showContextMenu(e, p.id!, "postit");
                      onContextMenu?.(p.id!);
                    }}
                    mandalaRadius={SCENE_W / 2}
                    currentMandalaName={mandala.mandala.name}
                    characters={
                      mandala.mandala.configuration?.center?.characters ?? []
                    }
                  />
                );
              }

              return (
                <PostIt
                  key={`static-${p.id}`}
                  postit={p}
                  color={dimensionColors[p.dimension] || "#cccccc"}
                  position={{ x, y }}
                  onDragStart={() => {
                    onDragStart(p.id!);
                    bringToFront({ type: "postit", id: id });
                  }}
                  onDragEnd={(e) => {
                    handleOnDragEndPostIt(e, p.id!, p);
                  }}
                  onDblClick={() => {
                    bringToFront({ type: "postit", id: id });
                    onDblClick?.(p.id!);
                  }}
                  onContentChange={(newValue, id) => {
                    onPostItUpdate(id, { content: newValue });
                  }}
                  onBlur={() => {
                    window.getSelection()?.removeAllRanges();
                    setEditableIndex(null);
                    onBlur?.(p.id!);
                  }}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  onContextMenu={(e, i) => {
                    showContextMenu(e, i, "postit");
                    onContextMenu?.(i);
                  }}
                  mandalaRadius={SCENE_W / 2}
                  isUnifiedMandala={mandala.mandala.type === "OVERLAP"}
                  currentMandalaName={mandala.mandala.name}
                  zindex={orderIndex}
                  onTransformEnd={async (e, scale) => {
                    handleOnDragEndPostIt(e, p.id!, { ...p, scale: scale });
                  }}
                />
              );
            }

            if (item.type === "image") {
              const image = mandala.images!.find((image) => image.id === id)!;
              if (!shouldShowImage(image, appliedFilters)) return null;
              const { x, y } = toAbsolutePostit(
                image.coordinates.x,
                image.coordinates.y
              );
              return (
                <MandalaImageComponent
                  key={`image-${image.id}`}
                  image={image}
                  position={{ x, y }}
                  onDragStart={(postitId) => {
                    onDragStart(postitId);
                    bringToFront({ type: "image", id: image.id });
                  }}
                  onDragEnd={(e) => handleOnDragEndImage(e, image)}
                  onMouseEnter={onMouseEnter}
                  onMouseLeave={onMouseLeave}
                  onContextMenu={(e) => showContextMenu(e, image.id, "image")}
                  mandalaRadius={SCENE_W / 2}
                  zindex={orderIndex}
                  onTransformEnd={async (e, scale) => {
                    handleOnDragEndImage(e, {
                      ...image,
                      scale: scale,
                    });
                  }}
                />
              );
            }
          })}
        </Layer>

        <Layer ref={charactersLayerRef}>
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
            transform: state ? `scale(${1 / state.scale})` : "none",
            transformOrigin: "top left",
          }}
          onClick={hideContextMenu}
        >
          <MandalaMenu
            onDelete={handleDelete}
            onCreateChild={
              contextMenu.type === "postit" ? handleCreateChild : undefined
            }
            onEdit={
              contextMenu.type === "postit" ? handleEditPostIt : undefined
            }
            isContextMenu={true}
            canEdit={canEdit}
          />
        </div>
      )}

      <NewPostItModal
        isOpen={isChildPostItModalOpen}
        onOpenChange={setIsChildPostItModalOpen}
        tags={tags}
        onNewTag={onNewTag}
        postItFatherId={selectedPostItId}
        onCreate={(content, tags, postItFatherId) => {
          onPostItChildCreate(content, tags, postItFatherId);
          setIsChildPostItModalOpen(false);
          setSelectedPostItId(undefined);
        }}
      />
      {editingPostit && (
        <EditPostItModal
          isOpen={isEditModalOpen}
          onOpenChange={(open) => {
            onBlur?.(editingPostit.id!);
            if (!open) closeEditModal();
          }}
          tags={tags}
          onUpdate={handleUpdate}
          initialContent={editingPostit.content}
          initialTags={editingPostit.tags}
          onNewTag={onNewTag}
        />
      )}
    </div>
  );
};

export default KonvaContainer;
