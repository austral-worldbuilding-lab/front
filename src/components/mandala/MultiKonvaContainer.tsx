import React, {
  useMemo,
  useRef,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Stage, Layer } from "react-konva";
import {
  Character,
  Mandala as MandalaData,
  Postit,
  Tag,
} from "@/types/mandala";
import { Layer as KonvaLayer } from "konva/lib/Layer";
import PostIt from "./postits/PostIt";
import CharacterIcon from "./characters/CharacterIcon";
import { useKonvaUtils } from "@/hooks/useKonvaUtils";
import { shouldShowCharacter, shouldShowPostIt } from "@/utils/filterUtils";
import { ReactZoomPanPinchState } from "react-zoom-pan-pinch";
import useMandala from "@/hooks/useMandala";
import MandalaConcentric from "./MandalaConcentric";
import MandalaSectors from "./MandalaSectors";
import MandalaPerson from "./MandalaPerson";
import { Levels, Sectors } from "@/constants/mandala";
import { useContextMenu } from "@/hooks/useContextMenu";
import { useEditPostIt } from "@/hooks/useEditPostit";
import EditPostItModal from "./postits/EditPostitModal";
import NewPostItModal from "./postits/NewPostItModal";
import MandalaMenu from "./MandalaMenu";
import { useParams } from "react-router-dom";
import { useProjectAccess } from "../../hooks/useProjectAccess";

interface MultiKonvaContainerProps {
  // unified: MandalaData; // ⬅ eliminado
  sourceMandalaIds: string[];
  appliedFilters: Record<string, string[]>;
  onPostItUpdate: (id: string, updates: Partial<Postit>) => Promise<boolean>;
  onCharacterUpdate: (
    index: number,
    updates: Partial<Character>
  ) => Promise<boolean | void>;
  onPostItDelete: (id: string) => Promise<boolean>;
  onCharacterDelete: (id: string) => Promise<boolean>;
  onPostItChildCreate: (
    content: string,
    tags: Tag[],
    postitFatherId?: string
  ) => void;
  state: ReactZoomPanPinchState | null;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
  onDragStart: (postitId: string) => void;
  onDragEnd: (postitId: string) => void;
  tags: Tag[];
  onNewTag: (tag: Tag) => void;
  onDblClick?: (postitId: string) => void;
  onBlur?: (postitId: string) => void;
  onContextMenu?: (postitId: string) => void;
}

const GAP = 400;
const PREVIEW_SCALE = 0.4;
const PREVIEW_Y_NUDGE = -355;

// ---------- Background ----------
const MandalaBackground: React.FC<{
  mandala: MandalaData;
  offsetX: number;
  offsetY: number;
  scale: number;
}> = ({ mandala, offsetX, offsetY, scale }) => {
  const config = mandala.mandala.configuration;
  const scaleCount = config?.scales?.length || 1;
  const maxRadius = 150 * scaleCount;

  function getInterpolatedLevelColor(index: number, total: number): string {
    const from = [200, 220, 255, 0.9];
    const to = [140, 190, 255, 0.3];
    const t = total > 1 ? index / (total - 1) : 0;
    const interpolated = from.map((start, i) => start + (to[i] - start) * t);
    const [r, g, b, a] = interpolated;
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
      b
    )}, ${a.toFixed(2)})`;
  }

  const levels =
    config?.scales?.map((name, index) => {
      return {
        id: `level-${index}`,
        name,
        radius: 150 * (index + 1),
        color: getInterpolatedLevelColor(index, scaleCount),
      };
    }) ?? Levels;

  const sectors =
    config?.dimensions?.map((dimension, index) => ({
      id: `sector-${index}`,
      name: dimension.name,
      question: `¿Qué pasa en ${dimension.name}?`,
      color: dimension.color,
    })) ?? Sectors;

  return (
    <div
      className="absolute"
      style={{
        left: offsetX,
        top: offsetY,
        width: maxRadius * 2,
        height: maxRadius * 2,
        transform: `scale(${scale})`,
        transformOrigin: "center",
      }}
    >
      <div className="relative w-full h-full flex items-center justify-center">
        <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <MandalaConcentric levels={levels} />
          <MandalaPerson type={mandala.mandala.type} />
          <MandalaSectors
            sectors={sectors}
            maxRadius={maxRadius}
            levels={levels}
          />
        </div>
      </div>
    </div>
  );
};

// ---------- Canvas ----------
const MandalaCanvas: React.FC<{
  mandala: MandalaData;
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
    (userRole === null || ["owner", "admin", "member"].includes(userRole));

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
    maxRadius
  );
  const {
    toAbsolute,
    toRelative,
    getDimensionAndSectionFromCoordinates,
    zOrder,
    bringToFront,
  } = useKonvaUtils(mandala.postits, maxRadius);

  const {
    contextMenu,
    showContextMenu,
    hideContextMenu,
    handleDelete,
    handleCreateChild,
    handleEditPostIt,
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
    }
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
    open: openEditModal,
    close: closeEditModal,
    handleUpdate,
  } = useEditPostIt();

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
            if (item.type !== "postit") return;
            const p = mandala.postits.find((postit) => postit.id === id)!;
            if (!shouldShowPostIt(p, appliedFilters)) return null;
            const { x, y } = toAbsolutePostit(p.coordinates.x, p.coordinates.y);
            return (
              <PostIt
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
                      id: character.id, // ⭐ agregamos id para ruteo seguro
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
        onCreate={(content, tags, postItFatherId, _dimension, _section) => {
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

// ---------- Multi ----------
const MultiKonvaContainer: React.FC<MultiKonvaContainerProps> = ({
  // unified, // ⬅ eliminado
  sourceMandalaIds,
  appliedFilters,
  onPostItUpdate,
  onCharacterUpdate,
  onPostItDelete,
  onCharacterDelete,
  onPostItChildCreate,
  state,
  onMouseEnter,
  onMouseLeave,
  onDragStart,
  onDragEnd,
  onDblClick,
  onBlur,
  onContextMenu,
  tags,
  onNewTag,
}) => {
  // hooks por fuente
  const s1 = useMandala(sourceMandalaIds[0] || "");
  const s2 = useMandala(sourceMandalaIds[1] || "");
  const s3 = useMandala(sourceMandalaIds[2] || "");
  const s4 = useMandala(sourceMandalaIds[3] || "");
  const s5 = useMandala(sourceMandalaIds[4] || "");

  const sourceMandalas = [
    { id: sourceMandalaIds[0], hook: s1 },
    { id: sourceMandalaIds[1], hook: s2 },
    { id: sourceMandalaIds[2], hook: s3 },
    { id: sourceMandalaIds[3], hook: s4 },
    { id: sourceMandalaIds[4], hook: s5 },
  ]
    .filter((x) => x.id && x.hook?.mandala)
    .map((x) => ({
      id: x.id as string,
      mandala: x.hook!.mandala as MandalaData,
      hook: x.hook!,
    }));

  // map id -> mandalaId (dueño)
  const idToMandalaId = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of sourceMandalas) {
      for (const p of s.mandala.postits ?? []) m.set(p.id!, s.id);
      for (const c of s.mandala.characters ?? []) m.set(c.id!, s.id);
    }
    return m;
  }, [sourceMandalas]);

  // índice de updaters por mandalaId (para rutear desde el merged)
  const updaterByMandalaId = useMemo(() => {
    const map = new Map<
      string,
      {
        updatePostit: (id: string, d: Partial<Postit>) => Promise<boolean>;
        updateCharacter: (
          idx: number,
          d: Partial<Character>
        ) => Promise<boolean | void>;
        deletePostit: (id: string) => Promise<boolean>;
        deleteCharacter: (idx: number) => Promise<boolean>;
      }
    >();
    for (const s of sourceMandalas) {
      map.set(s.id, {
        updatePostit: s.hook.updatePostit,
        updateCharacter: s.hook.updateCharacter,
        deletePostit: s.hook.deletePostit,
        deleteCharacter: s.hook.deleteCharacter,
      });
    }
    return map;
  }, [sourceMandalas]);

  // merged en tiempo real
  const merged: MandalaData | null = useMemo(() => {
    if (sourceMandalas.length === 0) return null;
    const base = sourceMandalas[0].mandala;
    return {
      id: "merged",
      mandala: {
        type: base.mandala.type,
        configuration: base.mandala.configuration,
      },
      postits: sourceMandalas.flatMap((s) => s.mandala.postits ?? []),
      characters: sourceMandalas.flatMap((s) => s.mandala.characters ?? []),
    } as MandalaData;
  }, [sourceMandalas]);

  // wrappers (mantienen firma original)
  const routedPostItUpdate = useCallback(
    async (postitId: string, d: Partial<Postit>) => {
      const owner = idToMandalaId.get(postitId);
      if (owner) {
        const u = updaterByMandalaId.get(owner);
        if (u) return u.updatePostit(postitId, d);
      }
      // fallback al prop global si algo falla
      return onPostItUpdate(postitId, d);
    },
    [idToMandalaId, updaterByMandalaId, onPostItUpdate]
  );

  const routedCharacterUpdate = useCallback(
    async (_idx: number, d: Partial<Character>) => {
      const id = (d as any).id as string | undefined;
      if (!id) return;
      const owner = idToMandalaId.get(id);
      if (!owner) return;
      const u = updaterByMandalaId.get(owner);
      if (!u) return;
      const mandala = sourceMandalas.find((s) => s.id === owner)?.mandala;
      const idx = mandala?.characters?.findIndex((c) => c.id === id) ?? -1;
      if (idx < 0) return;
      return u.updateCharacter(idx, d);
    },
    [idToMandalaId, updaterByMandalaId, sourceMandalas]
  );

  const routedDeletePostit = useCallback(
    async (postitId: string) => {
      const owner = idToMandalaId.get(postitId);
      if (owner) {
        const u = updaterByMandalaId.get(owner);
        if (u) return u.deletePostit(postitId);
      }
      return onPostItDelete(postitId);
    },
    [idToMandalaId, updaterByMandalaId, onPostItDelete]
  );

  const routedDeleteCharacter = useCallback(
    async (charId: string) => {
      const owner = idToMandalaId.get(charId);
      if (!owner) return false;
      const u = updaterByMandalaId.get(owner);
      if (!u) return false;
      const mandala = sourceMandalas.find((s) => s.id === owner)?.mandala;
      const idx = mandala?.characters?.findIndex((c) => c.id === charId) ?? -1;
      if (idx < 0) return false;
      const res = await u.deleteCharacter(idx);
      return !!res;
    },
    [idToMandalaId, updaterByMandalaId, sourceMandalas]
  );

  // layout basado en merged
  if (!state || !merged) return <div />;

  const unifiedMaxRadius =
    150 * (merged.mandala.configuration?.scales.length || 1);
  const unifiedSize = unifiedMaxRadius * 2;

  const gap = GAP;
  const previewScale = PREVIEW_SCALE;
  const previewSize = unifiedSize * previewScale;

  const leftColumnWidth = previewSize;
  const rightColumnWidth = unifiedSize;
  const totalGap = gap * 2;
  const totalWidth = leftColumnWidth + totalGap + rightColumnWidth;

  const sourceComputed = sourceMandalas.map((s) => {
    const scalesLen = s.mandala.mandala.configuration?.scales?.length || 1;
    const unscaledSize = 2 * 150 * scalesLen;
    const scaledSize = unscaledSize * previewScale;
    return { id: s.id, mandala: s.mandala, unscaledSize, scaledSize };
  });

  const totalLeftHeight =
    sourceComputed.reduce((acc, it) => acc + it.scaledSize, 0) +
    (sourceComputed.length > 0 ? (sourceComputed.length - 1) * gap : 0);

  const totalHeight = Math.max(unifiedSize, totalLeftHeight);

  const unifiedX = leftColumnWidth + totalGap + rightColumnWidth / 2;
  const unifiedY = totalHeight / 2;

  const previewX = leftColumnWidth / 2;
  const previewStartY = unifiedY - totalLeftHeight / 2 + PREVIEW_Y_NUDGE;

  return (
    <div
      id="multi-konva"
      style={{
        position: "relative",
        width: totalWidth,
        height: totalHeight,
      }}
    >
      {/* fondos fuentes */}
      {sourceMandalas.map((s, index) => {
        const offsetY = previewStartY + index * (previewSize + gap);
        return (
          <MandalaBackground
            key={`bg-src-${s.id}`}
            mandala={s.mandala}
            offsetX={previewX - previewSize / 2}
            offsetY={offsetY}
            scale={previewScale}
          />
        );
      })}

      {/* fondo merged */}
      <MandalaBackground
        mandala={merged}
        offsetX={unifiedX - unifiedSize / 2}
        offsetY={unifiedY - unifiedSize / 2}
        scale={1}
      />

      {/* canvases fuentes (editables + tags/child/delete) */}
      {sourceMandalas.map((s, index) => {
        const offsetY = previewStartY + index * (previewSize + gap);
        return (
          <MandalaCanvas
            key={`canvas-src-${s.id}`}
            mandala={s.mandala}
            offsetX={previewX - previewSize / 2}
            offsetY={offsetY}
            scale={previewScale}
            readOnly={false}
            appliedFilters={appliedFilters}
            state={state}
            onDblClick={onDblClick}
            onBlur={onBlur}
            onContextMenu={onContextMenu}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onPostItUpdate={s.hook.updatePostit}
            onCharacterUpdate={(idx, d) => s.hook.updateCharacter(idx, d)}
            onPostItDelete={s.hook.deletePostit}
            onCharacterDelete={(id) => routedDeleteCharacter(id)}
            onPostItChildCreate={onPostItChildCreate}
            tags={tags}
            onNewTag={onNewTag}
          />
        );
      })}

      {/* canvas grande merged (ruteado por dueño) */}
      <MandalaCanvas
        mandala={merged}
        offsetX={unifiedX - unifiedSize / 2}
        offsetY={unifiedY - unifiedSize / 2}
        scale={1}
        readOnly={false}
        appliedFilters={appliedFilters}
        onPostItUpdate={routedPostItUpdate}
        onCharacterUpdate={routedCharacterUpdate}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onPostItDelete={routedDeletePostit}
        onCharacterDelete={(id) => routedDeleteCharacter(id)}
        onPostItChildCreate={onPostItChildCreate}
        tags={tags}
        onNewTag={onNewTag}
        state={state}
        onDblClick={onDblClick}
        onBlur={onBlur}
        onContextMenu={onContextMenu}
      />
    </div>
  );
};

export default MultiKonvaContainer;
