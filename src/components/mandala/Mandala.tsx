import React from "react";
import MandalaConcentric from "./MandalaConcentric";
import MandalaSectors from "./MandalaSectors";
import MandalaPerson from "./MandalaPerson";
import { Levels, Sectors } from "@/constants/mandala";

interface MandalaProps {
  scale?: number;
  position?: { x: number; y: number };
}

const Mandala: React.FC<MandalaProps> = ({
  scale = 0.7,
  position = { x: 0, y: 0 },
}) => {
  // Use the data from the mandala if available, otherwise use the default constants
  const levels = Levels;
  const sectors = Sectors;

  // Get the maximum radius (the outermost circle)
  const maxRadius = levels[levels.length - 1].radius;

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
        />
      </div>
    </div>
  );
};

export default Mandala;
