import { useMemo } from "react";
import { Postit } from "@/types/mandala";
import { ReactZoomPanPinchState } from "react-zoom-pan-pinch";

export function useClosestPostIt(
  postits: Postit[],
  toAbsolute: (x: number, y: number) => { x: number; y: number },
  state: ReactZoomPanPinchState | null,
  width: number
) {
  const center = useMemo(() => {
    if (!state) return { x: width / 2, y: width / 2 };
    return {
      x: (width / 2 - state.positionX) / state.scale,
      y: (width / 2 - state.positionY) / state.scale,
    };
  }, [state, width]);

  return useMemo(() => {
    const candidates = postits
      .filter((p) => !p.parentId)
      .map((p) => ({
        ...p,
        abs: toAbsolute(p.coordinates.x, p.coordinates.y),
      }));

    return candidates.length > 0
      ? candidates.reduce((closest, current) => {
          const d1 = Math.hypot(
            closest.abs.x - center.x,
            closest.abs.y - center.y
          );
          const d2 = Math.hypot(
            current.abs.x - center.x,
            current.abs.y - center.y
          );
          return d1 < d2 ? closest : current;
        }, candidates[0])
      : null;
  }, [postits, toAbsolute, center]);
}
