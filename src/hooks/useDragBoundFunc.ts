const useDragBoundFunc = (radius: number) => {
  const cx = radius;
  const cy = radius;
  const r = radius;

  const dragBoundFunc = (pos: { x: number; y: number }) => {
    const dx = pos.x - cx;
    const dy = pos.y - cy;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > r) {
      const angle = Math.atan2(dy, dx);
      return {
        x: cx + r * Math.cos(angle),
        y: cy + r * Math.sin(angle),
      };
    }

    return pos;
  };

  return { dragBoundFunc };
};

export default useDragBoundFunc;
