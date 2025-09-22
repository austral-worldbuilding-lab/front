import React, { useMemo } from "react";
import { Html } from "react-konva-utils";

interface MandalaBadgeProps {
  originMandalaName?: string;
  fontSize: number;
  zindex?: number;
}

const MandalaBadge: React.FC<MandalaBadgeProps> = ({
  originMandalaName,
  fontSize,
}) => {
  const badgeData = useMemo(() => {
    if (!originMandalaName) return null;
    const initials = originMandalaName
      .split(" ")
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join("");

    return {
      name: originMandalaName,
      color: "#f3f4f6",
      initials: initials,
    };
  }, [originMandalaName]);

  if (!badgeData) return null;

  return (
    <Html
      divProps={{
        style: {
          pointerEvents: "none",
          position: "absolute",
          top: -8,
          left: -8,
        },
      }}
    >
      <div
        style={{
          backgroundColor: badgeData.color,
          color: "black",
          fontSize: `${fontSize * 0.6}px`,
          fontWeight: "bold",
          padding: "2px 6px",
          borderRadius: "10px",
          minWidth: "16px",
          textAlign: "center",
          lineHeight: 1,
          border: "1px solid rgba(255,255,255,0.8)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
        }}
        title={`Mandala: ${badgeData.name}`}
      >
        {badgeData.name}
      </div>
    </Html>
  );
};

export default MandalaBadge;
