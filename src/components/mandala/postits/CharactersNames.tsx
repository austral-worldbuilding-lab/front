import { isDarkColor } from "@/utils/colorUtils";
import React from "react";
import { Html } from "react-konva-utils";

interface CharactersNamesProps {
  characters: string[];
  charactersColors: {
    color: string;
    name: string;
    description: string;
    id: string;
  }[];
  fontSize: number;
  zindex?: number;
  postItWidth: number;
}

const CharactersNames: React.FC<CharactersNamesProps> = ({
  characters,
  charactersColors,
  fontSize,
  postItWidth,
}) => {
  const getColor = (character: string) => {
    const characterData = charactersColors.find((c) => c.name === character);
    return characterData?.color || "#f3f4f6";
  };

  return (
    <Html
      divProps={{
        style: {
          pointerEvents: "none",
          position: "absolute",
          marginTop: "90px",
          textAlign: "center",
          marginLeft: "auto",
          marginRight: "auto",
          width: `${postItWidth}px`,
        },
      }}
    >
      <div className="flex flex-col gap-[2px] items-center justify-center w-full">
        {characters.map((character) => (
          <div
            key={character}
            style={{
              backgroundColor: getColor(character) || "#f3f4f6",
              color: isDarkColor(getColor(character) || "#f3f4f6")
                ? "white"
                : "black",
              fontSize: `${fontSize * 0.6}px`,
              fontWeight: "bold",
              padding: "2px 6px",
              borderRadius: "10px",
              minWidth: "16px",
              textAlign: "center",
              lineHeight: 1,
              border: "1px solid " + (getColor(character) || "#f3f4f6"),
              boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            {character}
          </div>
        ))}
      </div>
    </Html>
  );
};

export default CharactersNames;
