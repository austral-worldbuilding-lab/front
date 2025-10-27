import React from "react";
import { Sector, Level } from "@/types/mandala";
import QuestionBubble from "./QuestionBubble";
import { useNavigate, useLocation } from "react-router-dom";

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
  const navigate = useNavigate();
  const location = useLocation();

  const computedAngles = sectors.map((sector, index) => ({
    ...sector,
    angle: (360 / sectors.length) * (sectors.length - index),
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
      {computedAngles.map((sector) =>
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
      )}

      {/* Nombres de los sectores con navegación */}
      {computedAngles.map((sector, index) => {
        const nextSector = computedAngles[(index + 1) % computedAngles.length];
        let midAngle = (sector.angle + nextSector.angle) / 2;
        if (index === computedAngles.length - 1) {
          midAngle = (sector.angle + (nextSector.angle + 360)) / 2;
          if (midAngle >= 360) midAngle -= 360;
        }

        let textRotationAngle = midAngle + 90;
        if (textRotationAngle > 90 && textRotationAngle < 270) {
          textRotationAngle += 180;
        }

        return (
          <div
            key={`name-${sector.id}`}
            className="absolute cursor-pointer"
            style={{
              left: Math.cos((midAngle * Math.PI) / 180) * (maxRadius + 60),
              top: Math.sin((midAngle * Math.PI) / 180) * (maxRadius + 60),
              transform: `translate(-50%, -50%) rotate(${textRotationAngle}deg)`,
              transformOrigin: "center center",
              width: "max-content",
            }}
            onClick={() => {
              const encodedName = encodeURIComponent(sector.name);
              navigate(`${location.pathname}/dimension/${encodedName}`);
            }}
          >
            <div
              className="text-primary font-bold tracking-wider hover:text-blue-600"
              style={{
                fontSize: "1.2rem",
                whiteSpace: "nowrap",
                pointerEvents: "auto",
              }}
            >
              {sector.name}
            </div>
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
          <QuestionBubble question={sector.question} />
        </div>
      ))}
    </>
  );
};

export default MandalaSectors;
