import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import { useState } from "react";
import { useMandalaBreadcrumb } from "@/hooks/useMandalaBreadcrumb";

interface CharacterItemProps {
  character: { id: string; name: string; color: string };
  onAdd?: (id: string) => void;
}

const CharacterItem: React.FC<CharacterItemProps> = ({ character, onAdd }) => {
  const [isButtonHovered, setIsButtonHovered] = useState(false);
  const { goToMandala } = useMandalaBreadcrumb();

  return (
    <div className="group flex flex-col gap-1 justify-between w-18 h-fit items-center bg-white">
      <div
        className={`flex items-center gap-3 w-18 h-18 justify-center border border-gray-200 rounded-md ${
          !isButtonHovered ? "hover:bg-gray-100" : ""
        } relative cursor-pointer`}
        onClick={() => {
          goToMandala(character.id, character.name);
        }}
      >
        <User size={36} style={{ color: character.color }} />
        {onAdd && (
          <div
            className="absolute top-[-10px] right-[-10px] z-20"
            onMouseEnter={() => setIsButtonHovered(true)}
            onMouseLeave={() => setIsButtonHovered(false)}
          >
            <Button
              onClick={(e) => {
                e.stopPropagation();
                onAdd(character.id);
              }}
              className="p-1 h-fit rounded-full"
              variant="filled"
              color="primary"
              size="sm"
              icon={<Plus size={16} />}
            ></Button>
          </div>
        )}
      </div>
      <span className="text-xs font-medium line-clamp-2 text-center">
        {character.name}
      </span>
    </div>
  );
};

export default CharacterItem;
