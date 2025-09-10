import React, { useState, useRef } from "react";
import { Group, Circle, Text } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Character } from "@/types/mandala";
import { Html } from "react-konva-utils";
import CharacterPopover from "./CharacterPopover";
import useDragBoundFunc from "@/hooks/useDragBoundFunc";

interface CharacterIconProps {
  character: Character;
  position: { x: number; y: number };
  onDragStart: () => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
  onContextMenu?: (e: KonvaEventObject<PointerEvent>) => void;
  mandalaRadius: number;
}

const CharacterIcon: React.FC<CharacterIconProps> = ({
  character,
  position,
  onDragStart,
  onDragEnd,
  onMouseEnter,
  onMouseLeave,
  onContextMenu,
  mandalaRadius,
}) => {
  const [showPopover, setShowPopover] = useState(false);
  const isDragging = useRef(false);
  const { dragBoundFunc } = useDragBoundFunc(mandalaRadius, 0, 0, 12);

  const handleClick = (e: KonvaEventObject<PointerEvent>) => {
    // Solo mostrar el popover en clic izquierdo (button = 0)
    // Esto previene que se abra en Windows cuando se hace clic derecho
    if (!isDragging.current && e.evt.button === 0) {
      setShowPopover(true);
    }
  };

  const handleDragStart = (e: KonvaEventObject<DragEvent>) => {
    e.cancelBubble = true;
    isDragging.current = true;
    onDragStart();
  };

  const handleDragEnd = (e: KonvaEventObject<DragEvent>) => {
    // Resetear el estado de arrastre después de un breve tiempo para evitar que el clic se active inmediatamente
    setTimeout(() => {
      isDragging.current = false;
    }, 10);
    onDragEnd(e);
  };

  return (
    <>
      <Group
        x={position.x}
        y={position.y}
        draggable
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={handleClick}
        onContextMenu={onContextMenu}
        className="pointer-events-auto"
        dragBoundFunc={dragBoundFunc}
      >
        <Circle
          radius={12}
          fill={character.color}
          shadowBlur={0}
          shadowOpacity={0}
        />
        <Text
          text={character.name}
          fontSize={14}
          fontStyle="bold"
          fill="#000"
          y={-35}
          x={-50}
          width={100}
          align="center"
          ellipsis
        />

        {showPopover && (
          <Html
            divProps={{
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
              },
            }}
          >
            <CharacterPopover
              character={character}
              onClose={() => setShowPopover(false)}
            />
          </Html>
        )}
      </Group>
    </>
  );
};

export default CharacterIcon;
