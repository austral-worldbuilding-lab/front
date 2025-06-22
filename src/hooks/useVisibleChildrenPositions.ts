import { useMemo } from "react";
import { Postit } from "@/types/mandala";

export function useVisibleChildrenPositions(
  parent: Postit | null,
  visibleChildren: Postit[],
  toAbsolute: (x: number, y: number) => { x: number; y: number },
  postItW: number,
  postItH: number,
  childScale: number
): Map<string, { x: number; y: number }> {
  return useMemo(() => {
    const map = new Map<string, { x: number; y: number }>();
    if (!parent) return map;

    const parentAbs = toAbsolute(parent.coordinates.x, parent.coordinates.y);
    const parentCenterX = parentAbs.x + postItW / 2;
    const parentCenterY = parentAbs.y + postItH / 2;

    const postItRadius = (postItW * childScale) / 2;
    const spacing = 10;
    const requiredCircumference =
      visibleChildren.length * (2 * postItRadius + spacing);
    const adjustedOrbitRadius = requiredCircumference / (2 * Math.PI);
    const orbitRadius = Math.max(adjustedOrbitRadius, 60);

    visibleChildren.forEach((child, i) => {
      const angle = (2 * Math.PI * i) / visibleChildren.length;

      const rawX = parentCenterX + orbitRadius * Math.cos(angle);
      const rawY = parentCenterY + orbitRadius * Math.sin(angle);

      const finalX = rawX - postItRadius;
      const finalY = rawY - postItRadius;

      map.set(child.id!, { x: finalX, y: finalY });
    });

    return map;
  }, [parent, visibleChildren, toAbsolute, postItW, postItH, childScale]);
}
