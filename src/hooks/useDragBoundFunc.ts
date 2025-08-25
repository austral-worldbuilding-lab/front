const useDragBoundFunc = (
  radius: number,
  postItWidth = 0,
  postItHeight = 0,
  radiusOffset = 0,
  scale = 1
) => {
  const cx = radius;
  const cy = radius;
  const r = radius;
  const VISUAL_MARGIN = 2;

  const dragBoundFunc = (pos: { x: number; y: number }) => {
    const centerPos = pos;

    const dx = centerPos.x - cx;
    const dy = centerPos.y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const scaledHalfWidth = (postItWidth / 2) * scale;
    const scaledHalfHeight = (postItHeight / 2) * scale;
    const effectiveRadius = Math.max(scaledHalfWidth, scaledHalfHeight);
    
    const totalOffset = Math.max(effectiveRadius + VISUAL_MARGIN, radiusOffset);
    const maxDistance = r - totalOffset;

    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      const newCenterX = cx + maxDistance * Math.cos(angle);
      const newCenterY = cy + maxDistance * Math.sin(angle);

      return {
        x: newCenterX,
        y: newCenterY,
      };
    }

    return pos;
  };

  return { dragBoundFunc };
};

export default useDragBoundFunc;
