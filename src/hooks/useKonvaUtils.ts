import { useState, useEffect, useCallback } from "react";
import { Postit } from "@/types/mandala";

const POSTIT_W = 64;
const POSTIT_H = 64;

export const useKonvaUtils = (postits: Postit[], mandalaRadius: number) => {
  const [zOrder, setZOrder] = useState<number[]>(postits.map((_, i) => i));

  useEffect(() => {
    setZOrder(postits.map((_, idx) => idx));
  }, [postits]);

  const SCENE_W = mandalaRadius * 2;
  const SCENE_H = mandalaRadius * 2;

  const toAbsolute = useCallback(
    (rx: number, ry: number) => ({
      x: ((rx + 1) / 2) * (SCENE_W - POSTIT_W),
      y: ((1 - ry) / 2) * (SCENE_H - POSTIT_H),
    }),
    [SCENE_H, SCENE_W]
  );

  const toAbsolutePostit = useCallback(
    (rx: number, ry: number) => ({
      x: ((rx + 1) / 2) * SCENE_W,
      y: ((1 - ry) / 2) * SCENE_H,
    }),
    [SCENE_H, SCENE_W]
  );

  const toRelative = useCallback(
    (x: number, y: number) => ({
      x: (x / (SCENE_W - POSTIT_W)) * 2 - 1,
      y: 1 - (y / (SCENE_H - POSTIT_H)) * 2,
    }),
    [SCENE_H, SCENE_W]
  );

  const toRelativePostit = useCallback(
    (rx: number, ry: number) => ({
      x: (rx / SCENE_W) * 2 - 1,
      y: 1 - (ry / SCENE_H) * 2,
    }),
    [SCENE_H, SCENE_W]
  );

  const clamp = useCallback(
    (v: number, max: number) => Math.max(0, Math.min(v, max)),
    []
  );

  const bringToFront = useCallback((index: number) => {
    setZOrder((prev) => {
      const filtered = prev.filter((i) => i !== index);
      return [...filtered, index];
    });
  }, []);

  const getDimensionAndSectionFromCoordinates = useCallback(
    (
      x: number,
      y: number,
      dimensions: string[],
      sections: string[]
    ): { dimension: string; section: string } => {
      const angle = Math.atan2(y, x);
      const adjustedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

      const absX = x * mandalaRadius;
      const absY = y * mandalaRadius;
      const rawDistance = Math.sqrt(absX * absX + absY * absY);
      const normalizedDistance = Math.min(rawDistance / mandalaRadius, 1);

      const dimIndex = Math.floor(
        (adjustedAngle / (2 * Math.PI)) * dimensions.length
      );
      const secIndex = Math.floor(normalizedDistance * sections.length);

      return {
        dimension: dimensions[Math.min(dimIndex, dimensions.length - 1)],
        section: sections[Math.min(secIndex, sections.length - 1)],
      };
    },
    [mandalaRadius]
  );

  return {
    zOrder,
    bringToFront,
    toAbsolute,
    toRelative,
    clamp,
    getDimensionAndSectionFromCoordinates,
    toAbsolutePostit,
    toRelativePostit,
  };
};
