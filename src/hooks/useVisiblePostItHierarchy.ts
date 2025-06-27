import { Postit } from "@/types/mandala";
import { ReactZoomPanPinchState } from "react-zoom-pan-pinch";
import { useClosestPostIt } from "./useClosestPostIt";

export function useVisiblePostItHierarchy(
  allPostIts: Postit[],
  toAbsolute: (x: number, y: number) => { x: number; y: number },
  state: ReactZoomPanPinchState | null
): {
  centerPostIt: Postit | null;
  rings: Postit[][];
} {
  const zoom = state?.scale ?? 1;
  const centerPostIt = useClosestPostIt(allPostIts, toAbsolute, state, 1200);
  const rings: Postit[][] = [];

  if (!centerPostIt) return { centerPostIt: null, rings };

  let currentParents = [centerPostIt];
  let currentLevel = 1;

  // Este valor controla cuántos niveles mostramos por unidad de zoom
  const levelsToShow = Math.floor((zoom - 1) * 2); // Ej: zoom 1.5 → 1 nivel, zoom 2.0 → 2 niveles, etc.

  while (currentLevel <= levelsToShow) {
    const children = allPostIts.filter((p) =>
      currentParents.some((parent) => p.parentId === parent.id)
    );
    if (children.length === 0) break;

    rings.push(children);
    currentParents = children;
    currentLevel++;
  }

  return { centerPostIt, rings };
}
