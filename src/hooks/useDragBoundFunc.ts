const useDragBoundFunc = (
  radius: number,
  postItWidth = 0,
  postItHeight = 0,
  radiusOffset = 0
) => {
  const cx = radius;
  const cy = radius;
  const r = radius;

  const halfDiagonal =
    Math.sqrt((postItWidth / 2) ** 2 + (postItHeight / 2) ** 2) * 0.95;

  const offset = Math.max(halfDiagonal, radiusOffset);

  const dragBoundFunc = (pos: { x: number; y: number }) => {
    const centerPos =
      postItWidth && postItHeight
        ? {
            x: pos.x + postItWidth / 2,
            y: pos.y + postItHeight / 2,
          }
        : pos;

    const dx = centerPos.x - cx;
    const dy = centerPos.y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const maxDistance = r - offset;

    if (distance > maxDistance) {
      const angle = Math.atan2(dy, dx);
      const newCenterX = cx + maxDistance * Math.cos(angle);
      const newCenterY = cy + maxDistance * Math.sin(angle);

      if (postItWidth && postItHeight) {
        return {
          x: newCenterX - postItWidth / 2,
          y: newCenterY - postItHeight / 2,
        };
      } else {
        return {
          x: newCenterX,
          y: newCenterY,
        };
      }
    }

    return pos;
  };

  return { dragBoundFunc };
};

export default useDragBoundFunc;
