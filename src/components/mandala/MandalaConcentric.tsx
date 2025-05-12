import React from "react";
import { Level } from "@/types/mandala";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MandalaConcentricProps {
  levels: Level[];
}

const MandalaConcentric: React.FC<MandalaConcentricProps> = ({ levels }) => {
  return (
    <>
      {levels.map((level, index) => {
        // Calculate the inner radius for this ring (0 for the innermost circle)
        const innerRadius = index === 0 ? 0 : levels[index - 1].radius;

        return (
          <Tooltip key={level.id}>
            <TooltipTrigger asChild>
              <div
                className="absolute rounded-full cursor-pointer"
                style={{
                  width: level.radius * 2,
                  height: level.radius * 2,
                  left: -level.radius,
                  top: -level.radius,
                  backgroundColor: level.color,
                  border: "1px solid rgba(200, 210, 255, 0.8)",
                  // Only detect events in the ring area, not in the inner part
                  clipPath:
                    innerRadius > 0
                      ? `circle(${level.radius}px) exclude circle(${innerRadius}px)`
                      : undefined,
                  zIndex: levels.length - index, // Higher z-index for inner circles
                }}
              />
            </TooltipTrigger>
            <TooltipContent
              side="top"
              className="bg-yellow-300 text-black border-yellow-400"
            >
              <p className="font-bold">{level.name}</p>
            </TooltipContent>
          </Tooltip>
        );
      })}
    </>
  );
};

export default MandalaConcentric;
