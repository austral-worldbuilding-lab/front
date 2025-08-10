import React, { createContext, useState, useCallback } from "react";

interface PostItAnimationContextValue {
  hasAnimated: (id: string) => boolean;
  markAnimated: (id: string) => void;
  isOpen: (id: string) => boolean;
  toggleOpen: (id: string) => void;
  setOpen: (id: string, value: boolean) => void;
}

const PostItAnimationContext =
  createContext<PostItAnimationContextValue | null>(null);

export const PostItAnimationProvider: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const [animatedIds, setAnimatedIds] = useState<Set<string>>(new Set());
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const hasAnimated = useCallback(
    (id: string) => animatedIds.has(id),
    [animatedIds]
  );

  const markAnimated = useCallback((id: string) => {
    setAnimatedIds((prev) => new Set(prev).add(id));
  }, []);

  const isOpen = useCallback((id: string) => openIds.has(id), [openIds]);

  const toggleOpen = useCallback((id: string) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  }, []);

  const setOpen = useCallback((id: string, value: boolean) => {
    setOpenIds((prev) => {
      const newSet = new Set(prev);
      if (value) newSet.add(id);
      else newSet.delete(id);
      return newSet;
    });
  }, []);

  return (
    <PostItAnimationContext.Provider
      value={{ hasAnimated, markAnimated, isOpen, toggleOpen, setOpen }}
    >
      {children}
    </PostItAnimationContext.Provider>
  );
};

export { PostItAnimationContext };
