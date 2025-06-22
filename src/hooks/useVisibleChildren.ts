import { useMemo } from "react";
import { Postit } from "@/types/mandala";

export function useVisibleChildren(
  zoomLevel: number | undefined,
  parent: Postit | null,
  allPostIts: Postit[]
): Postit[] {
  return useMemo(() => {
    if ((zoomLevel ?? 0) > 2 && parent) {
      return allPostIts
        .filter((p) => p.parentId === parent.id)
        .map((child) => ({
          ...child,
          dimension: parent.dimension,
        }));
    }
    return [];
  }, [zoomLevel, parent, allPostIts]);
}
