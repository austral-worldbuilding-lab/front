import React, { useState, useRef, useEffect } from "react";
import { Group, Path } from "react-konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Group as KonvaGroup } from "konva/lib/Group";
import { Character } from "@/types/mandala";
import { Html } from "react-konva-utils";
import { User } from "lucide-react";
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
  const groupRef = useRef<KonvaGroup>(null);
  const { dragBoundFunc } = useDragBoundFunc(mandalaRadius, 0, 0, 20);

  useEffect(() => {
    if (groupRef.current) {
      groupRef.current.moveToTop();
    }
  }, []);

  const handleClick = (e: KonvaEventObject<PointerEvent>) => {
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
    setTimeout(() => {
      isDragging.current = false;
    }, 10);
    onDragEnd(e);
  };

  return (
    <>
      <Group
        ref={groupRef}
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
        <Path
          data="M 0 -20 C -8 -20 -15 -13 -15 -5 C -15 3 0 15 0 15 C 0 15 15 3 15 -5 C 15 -13 8 -20 0 -20 Z"
          fill="transparent"
          stroke="transparent"
        />
        
        <Html
          divProps={{
            style: {
              position: "absolute",
              top: "-20px",
              left: "-15px",
              width: "30px",
              height: "35px",
              pointerEvents: "none",
              zIndex: 9998,
            },
          }}
        >
          <div
            style={{
              position: "relative",
              width: "30px",
              height: "30px",
            }}
          >
            <div
              style={{
                width: "30px",
                height: "30px",
                backgroundColor: character.color,
                borderRadius: "50%",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            />
            <div
              style={{
                position: "absolute",
                bottom: "-8px", 
                left: "50%",
                transform: "translateX(-50%)",
                width: "0",
                height: "0",
                borderLeft: "12px solid transparent",
                borderRight: "12px solid transparent",
                borderTop: `14px solid ${character.color}`,
                borderRadius: "1px",
              }}
            />
          </div>
        </Html>
        
        <Html
          divProps={{
            style: {
              position: "absolute",
              top: "-12px",
              left: "-8px",
              width: "16px",
              height: "16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              zIndex: 9999,
            },
          }}
        >
          <User 
            size={12} 
            color="#ffffff" 
            strokeWidth={2.5}
          />
        </Html>
        
        <Html
          divProps={{
            style: {
              position: "absolute",
              top: "-45px",
              left: "-50px",
              width: "100px",
              textAlign: "center",
              pointerEvents: "none",
              zIndex: 9999,
              fontWeight: "bold",
              fontSize: "12px",
              color: "#000",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
          }}
        >
          {character.name}
        </Html>

        {showPopover && (
          <Html
            divProps={{
              style: {
                position: "absolute",
                top: "0px",
                left: "0px",
                zIndex: 9999,
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
