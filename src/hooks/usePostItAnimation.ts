import { useContext } from "react";
import { PostItAnimationContext } from "@/context/PostItAnimationContext";

export const usePostItAnimation = (id: string) => {
  const ctx = useContext(PostItAnimationContext);
  if (!ctx) throw new Error("usePostItAnimation must be used inside provider");

  const { hasAnimated, markAnimated, isOpen, toggleOpen, setOpen } = ctx;

  return {
    shouldAnimate: !hasAnimated(id),
    markAnimated: () => markAnimated(id),
    isOpen: isOpen(id),
    toggleOpen: () => toggleOpen(id),
    setOpen: (value: boolean) => setOpen(id, value),
  };
};
