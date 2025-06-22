import { useEffect } from "react";
import { Postit } from "@/types/mandala";

export function useChildAnimations(
  childrenToShow: Postit[],
  visibleChildren: Postit[],
  setVisibleChildren: React.Dispatch<React.SetStateAction<Postit[]>>,
  setExitingChildren: React.Dispatch<
    React.SetStateAction<
      { postit: Postit; initialPosition: { x: number; y: number } }[]
    >
  >,
  toAbsolute: (x: number, y: number) => { x: number; y: number },
  visibleChildrenPositions: Map<string, { x: number; y: number }>
) {
  useEffect(() => {
    const entering = childrenToShow.filter(
      (c) => !visibleChildren.some((v) => v.id === c.id)
    );
    const exiting = visibleChildren.filter(
      (v) => !childrenToShow.some((c) => c.id === v.id)
    );

    if (entering.length > 0 || exiting.length > 0) {
      setVisibleChildren((prev) => [
        ...prev.filter((v) => !exiting.find((e) => e.id === v.id)),
        ...entering,
      ]);

      const exitingWithPosition = exiting.map((child) => {
        const pos =
          visibleChildrenPositions.get(child.id!) ??
          toAbsolute(child.coordinates.x, child.coordinates.y);
        return { postit: child, initialPosition: pos };
      });

      setExitingChildren((prev) => [...prev, ...exitingWithPosition]);

      setTimeout(() => {
        setExitingChildren((prev) =>
          prev.filter((e) => !exiting.some((v) => v.id === e.postit.id))
        );
      }, 300);
    }
  }, [
    childrenToShow,
    visibleChildren,
    setVisibleChildren,
    setExitingChildren,
    toAbsolute,
    visibleChildrenPositions,
  ]);
}
