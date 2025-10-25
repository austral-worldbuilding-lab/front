import { useMemo } from "react";

interface UseClampPositionProps {
  position: { x: number; y: number };
  mandalaRadius: number;
  elementWidth: number;
  elementHeight: number;
  scale: number;
}

export const useClampPosition = ({
  position,
  mandalaRadius,
  elementWidth,
  elementHeight,
  scale,
}: UseClampPositionProps) => {
  const clampedPosition = useMemo(() => {
    // Calcula el radio efectivo del elemento escalado
    const effectiveRadius = (Math.max(elementWidth, elementHeight) / 2) * scale;

    // Calcula la distancia máxima permitida desde el centro
    const maxRelativeDistance = 1 - effectiveRadius / mandalaRadius;

    // Centro del canvas
    const centerX = mandalaRadius;
    const centerY = mandalaRadius;

    // Convierte de posición absoluta a relativa (-1 a 1)
    const relX = (position.x - centerX) / mandalaRadius;
    const relY = (position.y - centerY) / mandalaRadius;

    // Calcula la distancia actual desde el centro
    const distance = Math.sqrt(relX * relX + relY * relY);

    // Si está fuera del límite, ajusta la posición
    if (distance > maxRelativeDistance) {
      const angle = Math.atan2(relY, relX);
      const clampedRelX = maxRelativeDistance * Math.cos(angle);
      const clampedRelY = maxRelativeDistance * Math.sin(angle);

      return {
        x: centerX + clampedRelX * mandalaRadius,
        y: centerY + clampedRelY * mandalaRadius,
      };
    }

    return position;
  }, [elementWidth, elementHeight, scale, mandalaRadius, position]);

  return clampedPosition;
};
