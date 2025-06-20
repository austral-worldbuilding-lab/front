import React from "react";
import { Level } from "@/types/mandala";

interface MandalaConcentricProps {
  levels: Level[];
}

const MandalaConcentric: React.FC<MandalaConcentricProps> = ({ levels }) => {
  return (
    <>
      {levels.map((level, index) => {
        const innerRadius = index === 0 ? 0 : levels[index - 1].radius;

        return (
          <div
            key={index}
            className="absolute rounded-full"
            style={{
              width: level.radius * 2,
              height: level.radius * 2,
              left: -level.radius,
              top: -level.radius,
              backgroundColor: level.color,
              border: "1px solid rgba(200, 210, 255, 0.8)",
              clipPath:
                innerRadius > 0
                  ? `circle(${level.radius}px) exclude circle(${innerRadius}px)`
                  : undefined,
              zIndex: levels.length - index,
            }}
          />
        );
      })}
    </>
  );
};

export default MandalaConcentric;
