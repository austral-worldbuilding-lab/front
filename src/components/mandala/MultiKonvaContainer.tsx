/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useMemo, useCallback } from "react";
import {
  Character,
  Mandala as MandalaData,
  MandalaImage,
  Postit,
  Tag,
} from "@/types/mandala";
import { ReactZoomPanPinchState } from "react-zoom-pan-pinch";
import useMandala from "@/hooks/useMandala";
import { MandalaBackground } from "./MandalaBackground";
import { MandalaCanvas } from "./MandalaCanvas";

interface MultiKonvaContainerProps {
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
  hidePreviews?: boolean;
}

const GAP = 400;
const PREVIEW_SCALE = 0.4;
const PREVIEW_Y_NUDGE = -355;

const MultiKonvaContainer: React.FC<MultiKonvaContainerProps> = ({
  sourceMandalaIds,
  appliedFilters,
  onPostItUpdate,
  onPostItDelete,
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
  hidePreviews = false,
}) => {
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

  const idToMandalaId = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of sourceMandalas) {
      for (const p of s.mandala.postits ?? []) m.set(p.id!, s.id);
      for (const c of s.mandala.characters ?? []) m.set(c.id!, s.id);
      for (const img of s.mandala.images ?? []) m.set(img.id, s.id);
    }
    return m;
  }, [sourceMandalas]);

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
        updateImage: (id: string, d: Partial<MandalaImage>) => Promise<boolean>;
        deleteImage: (id: string) => Promise<boolean>;
      }
    >();
    for (const s of sourceMandalas) {
      map.set(s.id, {
        updatePostit: s.hook.updatePostit,
        updateCharacter: s.hook.updateCharacter,
        deletePostit: s.hook.deletePostit,
        deleteCharacter: s.hook.deleteCharacter,
        updateImage: s.hook.updateImage,
        deleteImage: s.hook.deleteImage,
      });
    }
    return map;
  }, [sourceMandalas]);

  const merged: MandalaData | null = useMemo(() => {
    if (sourceMandalas.length === 0) return null;
    const base = sourceMandalas[0].mandala;
    return {
      id: "merged",
      mandala: {
        type: base.mandala.type,
        configuration: base.mandala.configuration,
      },
      postits: sourceMandalas.flatMap((s) => {
        if (!s.mandala.postits) {
          return [];
        }
        const from = {
          id: s.mandala.id,
          name: s.mandala.mandala.name,
        };
        return s.mandala.postits.map((p) => ({ ...p, from }));
      }),
      characters: sourceMandalas.flatMap((s) => s.mandala.characters ?? []),
      images: sourceMandalas.flatMap((s) => {
        if (!s.mandala.images) {
          return [];
        }
        const from = {
          id: s.mandala.id,
          name: s.mandala.mandala.name,
        };
        return s.mandala.images.map((i) => ({ ...i, from }));
      }),
    } as MandalaData;
  }, [sourceMandalas]);

  const routedPostItUpdate = useCallback(
    async (postitId: string, d: Partial<Postit>) => {
      const owner = idToMandalaId.get(postitId);
      if (owner) {
        const u = updaterByMandalaId.get(owner);
        if (u) return u.updatePostit(postitId, d);
      }
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

  const routedImageUpdate = useCallback(
    async (imageId: string, d: Partial<MandalaImage>) => {
      const owner = idToMandalaId.get(imageId);
      if (owner) {
        const u = updaterByMandalaId.get(owner);
        if (u) return u.updateImage(imageId, d);
      }
      return false;
    },
    [idToMandalaId, updaterByMandalaId]
  );

  const routedDeleteImage = useCallback(
    async (imageId: string) => {
      const owner = idToMandalaId.get(imageId);
      if (owner) {
        const u = updaterByMandalaId.get(owner);
        if (u) return u.deleteImage(imageId);
      }
      return false;
    },
    [idToMandalaId, updaterByMandalaId]
  );

  if (!state || !merged) return <div />;

  const unifiedMaxRadius =
    150 * (merged.mandala.configuration?.scales.length || 1);
  const unifiedSize = unifiedMaxRadius * 2;

  if (hidePreviews) {
    return (
      <div
        id="multi-konva"
        style={{
          position: "relative",
          width: unifiedSize,
          height: unifiedSize,
        }}
      >
        <MandalaBackground mandala={merged} offsetX={0} offsetY={0} scale={1} />
        <MandalaCanvas
          mandala={merged}
          offsetX={0}
          offsetY={0}
          scale={1}
          readOnly={false}
          appliedFilters={appliedFilters}
          onPostItUpdate={routedPostItUpdate}
          onCharacterUpdate={routedCharacterUpdate}
          onImageUpdate={routedImageUpdate}
          onImageDelete={routedDeleteImage}
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
  }

  // ----- MODO CON PREVIEWS (layout original) -----
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

      {/* canvases fuentes */}
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
            onImageUpdate={s.hook.updateImage}
            onImageDelete={s.hook.deleteImage}
            onPostItDelete={s.hook.deletePostit}
            onCharacterDelete={(id) => routedDeleteCharacter(id)}
            onPostItChildCreate={onPostItChildCreate}
            tags={tags}
            onNewTag={onNewTag}
          />
        );
      })}

      {/* canvas grande merged */}
      <MandalaCanvas
        mandala={merged}
        offsetX={unifiedX - unifiedSize / 2}
        offsetY={unifiedY - unifiedSize / 2}
        scale={1}
        readOnly={false}
        appliedFilters={appliedFilters}
        onPostItUpdate={routedPostItUpdate}
        onCharacterUpdate={routedCharacterUpdate}
        onImageUpdate={routedImageUpdate}
        onImageDelete={routedDeleteImage}
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
