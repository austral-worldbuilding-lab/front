import React from "react";
import MandalaConcentric from "./MandalaConcentric";
import MandalaSectors from "./MandalaSectors";
import MandalaPerson from "./MandalaPerson";
import { Levels, Sectors } from "@/constants/mandala";
import { useParams } from "react-router-dom";
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

  // Use the data from the mandala if available, otherwise use the default constants
  const levels = Levels;
  const sectors = Sectors;
  const { mandalaId } = useParams<{ mandalaId: string }>();

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


  const maxRadius = 600;
  const config = mandala.mandala.configuration;

  const levels =
    config?.scales?.map((name, index) => {
      const t = (index + 1) / config.scales.length;
      return {
        id: `level-${index}`,
        name,
        radius: t * 600,
        color: getInterpolatedLevelColor(index, config.scales.length),
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
        <MandalaPerson />

        {/* Sectors, lines, points, names, and questions */}
        <MandalaSectors
          sectors={sectors}
          maxRadius={maxRadius}
          levels={levels}
          mandalaId={mandalaId!}
        />
      </div>
    </div>
  );
};

export default Mandala;
