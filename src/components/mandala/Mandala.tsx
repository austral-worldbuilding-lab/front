import React from "react";
import { Levels, Sectors } from "@/constants/mandala";
import MandalaConcentric from "./MandalaConcentric";
import MandalaSectors from "./MandalaSectors";
import MandalaPerson from "./MandalaPerson";

interface MandalaProps {
  scale?: number;
  position?: { x: number; y: number };
}

const Mandala: React.FC<MandalaProps> = ({
  scale = 0.7,
  position = { x: 0, y: 0 },
}) => {
  // Get the maximum radius (the outermost circle)
  const maxRadius = Levels[Levels.length - 1].radius;

  return (
    <div
      className="absolute w-full h-full"
      style={{
        transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
      }}
    >
      {/* Centro de la mandala */}
      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
        {/* Círculos concéntricos */}
        <MandalaConcentric levels={Levels} />

        {/* Persona en el centro */}
        <MandalaPerson />

        {/* Sectores, líneas, puntos, nombres y preguntas */}
        <MandalaSectors
          sectors={Sectors}
          maxRadius={maxRadius}
          levels={Levels}
        />
      </div>
    </div>
  );
};

export default Mandala;
