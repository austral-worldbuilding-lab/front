import React, { useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Character } from "@/types/mandala";
import { EyeIcon } from "lucide-react";
import { useMandalaBreadcrumb } from "@/hooks/useMandalaBreadcrumb";

interface CharacterPopoverProps {
  character: Character;
  onClose: () => void;
}

const CharacterPopover: React.FC<CharacterPopoverProps> = ({
  character,
  onClose,
}) => {
  const popoverRef = useRef<HTMLDivElement>(null);
  const { goToMandala } = useMandalaBreadcrumb();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    // Add the event listener for mousedown
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleOpenMandala = (mandalaId: string) => {
    goToMandala(mandalaId, character.name);
  };


  return (
    <div
      ref={popoverRef}
      className="bg-white border rounded-md shadow-md p-4 z-50"
      style={{
        position: "absolute",
        top: "60px",
        left: "0px",
        transform: "translate(-50%, -50%)",
        minWidth: "200px",
      }}
    >
      <div className="flex flex-col gap-2">
        <Button
          icon={<EyeIcon />}
          onClick={() => handleOpenMandala(character.id)}
        >
          Ver Mandala
        </Button>
      </div>
    </div>
  );
};

export default CharacterPopover;
