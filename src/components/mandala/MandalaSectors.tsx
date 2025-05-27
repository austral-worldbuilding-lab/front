import React from "react";
import { Sector, Level } from "@/types/mandala";
import QuestionBubble from "./QuestionBubble";

interface MandalaSectorsProps {
  sectors: Sector[];
  maxRadius: number;
  levels: Level[];
}

const MandalaSectors: React.FC<MandalaSectorsProps> = ({
  sectors,
  maxRadius,
  levels,
}) => {
  const computedAngles = sectors.map((sector, index) => ({
    ...sector,
    angle: (360 / sectors.length) * index,
  }));


  return (
    <>
      {/* Líneas divisorias de sectores */}
      {computedAngles.map((sector) => (
            <div
                key={sector.id}
                className="absolute"
                style={{
                  width: maxRadius,
                  height: "2px",
                  left: 0,
                  top: 0,
                  borderTop: "2px dotted rgba(100, 150, 255, 0.5)",
                  transform: `rotate(${sector.angle}deg)`,
                  transformOrigin: "left center",
                  zIndex: 50,
                }}
            />
        ))}

      {/* Puntos en las intersecciones */}
      {computedAngles.map((sector) => (
        levels.map((level) => (
          <div
            key={`${sector.id}-${level.id}`}
            className="absolute w-2 h-2 bg-blue-900 rounded-full z-50"
            style={{
              left: Math.cos((sector.angle * Math.PI) / 180) * level.radius,
              top: Math.sin((sector.angle * Math.PI) / 180) * level.radius,
              transform: "translate(-50%, -50%)",
              zIndex: 50,
            }}
          />
        ))
      ))}

      {/* Nombres de los sectores */}
      {computedAngles.map((sector, index) => {
        const nextSector = computedAngles[(index + 1) % computedAngles.length];
        let midAngle = (sector.angle + nextSector.angle) / 2;
        if (index === computedAngles.length - 1) {
          midAngle = (sector.angle + (nextSector.angle + 360)) / 2;
          if (midAngle >= 360) midAngle -= 360;
        }

        const textRotationAngle = midAngle + 90;

        return (
          <div
            key={`name-${sector.id}`}
            className="absolute text-blue-900 font-bold tracking-wider z-10"
            style={{
              left: Math.cos((midAngle * Math.PI) / 180) * (maxRadius + 60),
              top: Math.sin((midAngle * Math.PI) / 180) * (maxRadius + 60),
              transform: `translate(-50%, -50%) rotate(${textRotationAngle}deg)`,
              transformOrigin: "center",
              fontSize: "1.2rem",
            }}
          >
            <div>{sector.name}</div>
          </div>
        );
      })}

      {/* Burbujas de preguntas predefinidas */}
      {computedAngles.map((sector) => (
          <div
                key={`question-${sector.id}`}
                className="absolute z-20"
                style={{
                  left: Math.cos((sector.angle * Math.PI) / 180) * (maxRadius + 120),
                  top: Math.sin((sector.angle * Math.PI) / 180) * (maxRadius + 120),
                  transform: "translate(-50%, -50%)",
                }}
            >
              <QuestionBubble question={sector.question}/>
            </div>
        ))}
    </>
  );
};

export default MandalaSectors;
