import { useEffect, useState, useCallback } from "react";
import { Postit } from "@/types/mandala";

export type ChildInstance = {
  postit: Postit;
  initialPosition: { x: number; y: number };
};

export type AnimatedParent = {
  postit: Postit;
  fromPosition: { x: number; y: number };
  toPosition: { x: number; y: number };
  fromScale: number;
  toScale: number;
};

export function usePostItExpansion({
  postits,
  toAbsolute,
}: {
  postits: Postit[];
  toAbsolute: (x: number, y: number) => { x: number; y: number };
}) {
  const [expandedParentIds, setExpandedParentIds] = useState<Set<string>>(
    new Set()
  );
  const [visibleChildren, setVisibleChildren] = useState<Postit[]>([]);
  const [exitingChildren, setExitingChildren] = useState<ChildInstance[]>([]);
  const [animatedParents, setAnimatedParents] = useState<AnimatedParent[]>([]);

  const toggleParentExpansion = useCallback((parentId: string) => {
    setExpandedParentIds((prev) => {
      const next = new Set(prev);
      if (next.has(parentId)) next.delete(parentId);
      else next.add(parentId);
      return next;
    });
  }, []);

  useEffect(() => {
    const currentChildren = postits.filter(
      (p) => p.parentId && expandedParentIds.has(p.parentId)
    );

    const entering = currentChildren.filter(
      (c) => !visibleChildren.some((v) => v.id === c.id)
    );

    const exiting = visibleChildren.filter(
      (v) => !currentChildren.some((c) => c.id === v.id)
    );

    const exitingWithPosition: ChildInstance[] = exiting.map((c) => ({
      postit: c,
      initialPosition: toAbsolute(c.coordinates.x, c.coordinates.y),
    }));

    if (entering.length > 0 || exiting.length > 0) {
      setVisibleChildren((prev) => [
        ...prev.filter((v) => !exiting.find((e) => e.id === v.id)),
        ...entering,
      ]);
      setExitingChildren((prev) => [...prev, ...exitingWithPosition]);

      setTimeout(() => {
        setExitingChildren((prev) =>
          prev.filter((e) => !exiting.some((v) => v.id === e.postit.id))
        );
      }, 300);
    }
  }, [expandedParentIds, postits, toAbsolute, visibleChildren]);

  useEffect(() => {
    const animationInstances: AnimatedParent[] = [];

    postits
      .filter((p) => !p.parentId)
      .forEach((parent) => {
        const isNowExpanded = expandedParentIds.has(parent.id!);
        const hasChildren = postits.some((c) => c.parentId === parent.id);
        const isAnimating = animatedParents.some(
          (a) => a.postit.id === parent.id
        );

        // Avoid re-adding animation if already exists
        if (!hasChildren || isAnimating) return;

        const currentlyVisible = visibleChildren.some(
          (c) => c.parentId === parent.id
        );

        if (isNowExpanded !== currentlyVisible) {
          const abs = toAbsolute(parent.coordinates.x, parent.coordinates.y);
          animationInstances.push({
            postit: parent,
            fromPosition: abs,
            toPosition: abs,
            fromScale: isNowExpanded ? 1 : 0.5,
            toScale: isNowExpanded ? 0.5 : 1,
          });
        }
      });

    if (animationInstances.length > 0) {
      setAnimatedParents(animationInstances);

      const timeout = setTimeout(() => {
        setAnimatedParents([]);
      }, 300);

      return () => clearTimeout(timeout);
    }
  }, [
    animatedParents,
    expandedParentIds,
    postits,
    toAbsolute,
    visibleChildren,
  ]);

  const isExpanded = useCallback(
    (parentId: string) => expandedParentIds.has(parentId),
    [expandedParentIds]
  );

  return {
    expandedParentIds,
    toggleParentExpansion,
    visibleChildren,
    exitingChildren,
    animatedParents,
    isExpanded,
  };
}
