import { useEditPostIt } from "@/hooks/useEditPostit";
import { useKonvaUtils } from "@/hooks/useKonvaUtils";
import { useProjectAccess } from "@/hooks/useProjectAccess";
import { Character, Mandala, MandalaImage, Postit, Tag } from "@/types/mandala";
import {
  shouldShowCharacter,
  shouldShowPostIt,
  shouldShowImage,
} from "@/utils/filterUtils";
import { useEffect, useMemo, useRef, useState } from "react";
import { Layer, Stage } from "react-konva";
import { useParams } from "react-router-dom";
import { ReactZoomPanPinchState } from "react-zoom-pan-pinch";
import PostIt from "./postits/PostIt";
import CharacterIcon from "./characters/CharacterIcon";
import MandalaImageComponent from "./filters/images/MandalaImage";
import MandalaMenu from "./MandalaMenu";
import NewPostItModal from "./postits/NewPostItModal";
import EditPostItModal from "./postits/EditPostitModal";
import { useContextMenu } from "@/hooks/useContextMenu";
import { Layer as KonvaLayer } from "konva/lib/Layer";

export const MandalaCanvas: React.FC<{
  mandala: Mandala;
  offsetX: number;
  offsetY: number;
  scale: number;
  readOnly: boolean;
  appliedFilters: Record<string, string[]>;
  onPostItUpdate?: (id: string, updates: Partial<Postit>) => Promise<boolean>;
  onCharacterUpdate?: (
    index: number,
    updates: Partial<Character>
  ) => Promise<boolean | void>;
  onPostItDelete?: (id: string) => Promise<boolean>;
  onCharacterDelete?: (id: string) => Promise<boolean>;
  onImageUpdate?: (
    id: string,
    updates: Partial<MandalaImage>
  ) => Promise<boolean>;
  onImageDelete?: (id: string) => Promise<boolean>;
  onPostItChildCreate?: (
    content: string,
    tags: Tag[],
    postitFatherId?: string
  ) => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onDragStart: (postitId: string) => void;
  onDragEnd: (postitId: string) => void;
  tags?: Tag[];
  onNewTag?: (tag: Tag) => void;
  state?: ReactZoomPanPinchState | null;
  onDblClick?: (postitId: string) => void;
  onBlur?: (postitId: string) => void;
  onContextMenu?: (postitId: string) => void;
}> = ({
  mandala,
  offsetX,
  offsetY,
  scale,
  readOnly,
  appliedFilters,
  onPostItUpdate,
  onCharacterUpdate,
  onPostItDelete,
  onCharacterDelete,
  onImageUpdate,
  onImageDelete,
  onPostItChildCreate,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDragEnd,
  tags,
  onNewTag,
  state,
  onContextMenu,
  onBlur,
  onDblClick,
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
  const canvasSize = maxRadius * 2;

  const charactersLayerRef = useRef<KonvaLayer>(null);

  const { toAbsolutePostit, toRelativePostit } = useKonvaUtils(
    mandala.postits,
    maxRadius,
    mandala.images
  );
  const {
    toAbsolute,
    toRelative,
    getDimensionAndSectionFromCoordinates,
    zOrder,
    bringToFront,
  } = useKonvaUtils(mandala.postits, maxRadius, mandala.images);

  const getImageUrl = (imageId: string) => {
    const image = mandala.images?.find((img) => img.id === imageId);
    return image?.url;
  };

  const {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    handleDelete,
    handleCreateChild,
    handleEditPostIt,
    handleDownloadImage,
  } = useContextMenu(
    onPostItDelete || (() => Promise.resolve(false)),
    onCharacterDelete || (() => Promise.resolve(false)),
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
    onImageDelete || (() => Promise.resolve(false)),
    getImageUrl,
    mandala.mandala.name
  );

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
    open: openEditPostItModal,
    close: closeEditModal,
    handleUpdate,
  } = useEditPostIt();

  const openEditModal = (mandalaId: string, postit: Postit) => {
    openEditPostItModal(mandalaId, postit);
  };

  const dimensionColors = useMemo(() => {
    return (
      mandala.mandala.configuration?.dimensions?.reduce((acc, d) => {
        acc[d.name] = d.color;
        return acc;
      }, {} as Record<string, string>) ?? {}
    );
  }, [mandala.mandala.configuration?.dimensions]);

  return (
    <div
      className="absolute"
      style={{
        left: offsetX,
        top: offsetY,
        width: canvasSize,
        height: canvasSize,
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      <Stage width={canvasSize} height={canvasSize} listening={!readOnly}>
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
              return (
                <PostIt
                  isUnifiedMandala
                  currentMandalaName=" "
                  key={`p-${mandala.id}-${p.id}`}
                  postit={p}
                  color={dimensionColors[p.dimension] || "#cccccc"}
                  position={{ x, y }}
                  onDragStart={() => {
                    if (!readOnly) {
                      onDragStart?.(p.id!);
                      bringToFront({ type: "postit", id: id });
                    }
                  }}
                  onDragEnd={async (e) => {
                    if (readOnly || !onPostItUpdate) return;
                    onDragEnd?.(p.id!);
                    const rel = toRelativePostit(e.target.x(), e.target.y());
                    const { dimension, section } =
                      getDimensionAndSectionFromCoordinates(
                        rel.x,
                        rel.y,
                        mandala.mandala.configuration?.dimensions.map(
                          (d) => d.name
                        ) || [],
                        mandala.mandala.configuration?.scales || []
                      );
                    await onPostItUpdate(p.id!, {
                      coordinates: { ...p.coordinates, x: rel.x, y: rel.y },
                      dimension,
                      section,
                    });
                  }}
                  onMouseEnter={onMouseEnter || (() => {})}
                  onMouseLeave={onMouseLeave || (() => {})}
                  onDblClick={() => {
                    bringToFront({ type: "postit", id: id });
                    onDblClick?.(p.id!);
                  }}
                  onContentChange={(newValue, id) => {
                    if (onPostItUpdate) {
                      onPostItUpdate(id, { content: newValue });
                    }
                  }}
                  onBlur={() => {
                    window.getSelection()?.removeAllRanges();
                    setEditableIndex(null);
                    onBlur?.(p.id!);
                  }}
                  onContextMenu={(e, i) => {
                    showContextMenu(e, i, "postit");
                    onContextMenu?.(p.id!);
                  }}
                  mandalaRadius={maxRadius}
                  zindex={orderIndex}
                />
              );
            }

            if (item.type === "image") {
              const image = mandala.images?.find((img) => img.id === id);
              if (!image) return null;
              if (!shouldShowImage(image, appliedFilters)) return null;
              const { x, y } = toAbsolutePostit(
                image.coordinates.x,
                image.coordinates.y
              );
              return (
                <MandalaImageComponent
                  key={`image-${mandala.id}-${image.id}`}
                  image={image}
                  position={{ x, y }}
                  onDragStart={(postitId) => {
                    if (!readOnly) {
                      onDragStart?.(postitId);
                      bringToFront({ type: "image", id: image.id });
                    }
                  }}
                  onDragEnd={async (e) => {
                    if (readOnly || !onImageUpdate) return;
                    onDragEnd?.(image.id);
                    const rel = toRelativePostit(e.target.x(), e.target.y());
                    const { dimension, section } =
                      getDimensionAndSectionFromCoordinates(
                        rel.x,
                        rel.y,
                        mandala.mandala.configuration?.dimensions.map(
                          (d) => d.name
                        ) || [],
                        mandala.mandala.configuration?.scales || []
                      );
                    await onImageUpdate(image.id, {
                      coordinates: { x: rel.x, y: rel.y },
                      dimension,
                      section,
                    });
                  }}
                  onMouseEnter={onMouseEnter || (() => {})}
                  onMouseLeave={onMouseLeave || (() => {})}
                  onContextMenu={(e) => showContextMenu(e, image.id, "image")}
                  mandalaRadius={maxRadius}
                  zindex={orderIndex}
                />
              );
            }

            return null;
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
                key={`c-${mandala.id}-${character.id}`}
                mandalaRadius={maxRadius}
                character={character}
                position={{ x, y }}
                onDragStart={() => {
                  if (!readOnly) {
                    onDragStart?.(character.id!);
                  }
                }}
                onDragEnd={async (e) => {
                  if (readOnly || !onCharacterUpdate) return;
                  onDragEnd?.(character.id!);
                  const rel = toRelative(e.target.x(), e.target.y());
                  const { dimension, section } =
                    getDimensionAndSectionFromCoordinates(
                      rel.x,
                      rel.y,
                      mandala.mandala.configuration?.dimensions.map(
                        (d) => d.name
                      ) || [],
                      mandala.mandala.configuration?.scales || []
                    );
                  const idx =
                    mandala.characters?.findIndex(
                      (c) => c.id === character.id
                    ) ?? -1;
                  if (idx >= 0)
                    await onCharacterUpdate(idx, {
                      id: character.id,
                      position: { x: rel.x, y: rel.y },
                      dimension,
                      section,
                    });
                }}
                onMouseEnter={onMouseEnter || (() => {})}
                onMouseLeave={onMouseLeave || (() => {})}
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
            onDownloadImage={
              contextMenu.type === "image" ? handleDownloadImage : undefined
            }
            isContextMenu={true}
            canEdit={canEdit}
          />
        </div>
      )}

      <NewPostItModal
        isOpen={isChildPostItModalOpen}
        onOpenChange={setIsChildPostItModalOpen}
        tags={tags || []}
        onNewTag={onNewTag || (() => {})}
        postItFatherId={selectedPostItId}
        onCreate={(content, tags, postItFatherId) => {
          if (onPostItChildCreate) {
            onPostItChildCreate(content, tags, postItFatherId);
          }
          setIsChildPostItModalOpen(false);
          setSelectedPostItId(undefined);
        }}
      />
      {editingPostit && (
        <EditPostItModal
          isOpen={isEditModalOpen}
          onOpenChange={(open) => {
            if (!open) closeEditModal();
          }}
          tags={tags || []}
          onUpdate={handleUpdate}
          initialContent={editingPostit.content}
          initialTags={editingPostit.tags}
          onNewTag={onNewTag || (() => {})}
        />
      )}
    </div>
  );
};
