import { Postit } from "@/types/mandala";

export function getVisibleChildren(
  zoomLevel: number | undefined,
  parent: Postit | null,
  allPostIts: Postit[]
): Postit[] {
  if ((zoomLevel ?? 0) > 2 && parent) {
    return allPostIts
      .filter((p) => p.parentId === parent.id)
      .map((child) => ({
        ...child,
        dimension: parent.dimension,
      }));
  }
  return [];
}
