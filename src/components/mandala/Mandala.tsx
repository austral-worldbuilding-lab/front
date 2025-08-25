import React from "react";
import MandalaConcentric from "./MandalaConcentric";
import MandalaSectors from "./MandalaSectors";
import MandalaPerson from "./MandalaPerson";
import { Levels, Sectors } from "@/constants/mandala";
import { Mandala as MandalaData } from "@/types/mandala";

interface MandalaProps {
  scale?: number;
  position?: { x: number; y: number };
  mandala: MandalaData;
}

const Mandala: React.FC<MandalaProps> = ({
  scale = 0.7,
  position = { x: 0, y: 0 },
  mandala,
}) => {
  function getInterpolatedLevelColor(index: number, total: number): string {
    const from = [200, 220, 255, 0.9];
    const to = [140, 190, 255, 0.3];
    const t = index / (total - 1);
    const interpolated = from.map((start, i) => start + (to[i] - start) * t);
    const [r, g, b, a] = interpolated;
    return `rgba(${Math.round(r)}, ${Math.round(g)}, ${Math.round(
      b
    )}, ${a.toFixed(2)})`;
  }

  const config = mandala.mandala.configuration;
  const scaleCount = config?.scales?.length || 1;
  const maxRadius = 150 * scaleCount;

  const levels =
    config?.scales?.map((name, index) => {
      return {
        id: `level-${index}`,
        name,
        radius: 150 * (index + 1),
        color: getInterpolatedLevelColor(index, scaleCount),
      };
    }) ?? Levels;

  const sectors =
    config?.dimensions?.map((dimension, index) => ({
      id: `sector-${index}`,
      name: dimension.name,
      question: `¿Qué pasa en ${dimension.name}?`,
      color: dimension.color,
    })) ?? Sectors;

  return (
    <div
      className="absolute w-full h-full"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
      }}
    >
      {/* Center of the mandala */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Concentric circles */}
        <MandalaConcentric levels={levels} />

        {/* Person in the center */}
        <MandalaPerson type={mandala.mandala.type} />

        {/* Sectors, lines, points, names, and questions */}
        <MandalaSectors
          sectors={sectors}
          maxRadius={maxRadius}
          levels={levels}
        />
      </div>
    </div>
  );
};

export default Mandala;
