import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface CharacterItemProps {
  character: { id: string; name: string; color: string };
  onAdd: (id: string) => void;
}

const CharacterItem: React.FC<CharacterItemProps> = ({ character, onAdd }) => {
  const navigate = useNavigate();
  const location = useLocation();
  return (
    <div
      onClick={() => {
        navigate(
          `${location.pathname.split("/").slice(0, -1).join("/")}/${
            character.id
          }`
        );
      }}
      className="flex justify-between items-center p-3 bg-white hover:bg-gray-100 shadow cursor-pointer"
    >
      <div className="flex items-center gap-3">
        <div
          className="w-4 h-4 rounded-full"
          style={{ backgroundColor: character.color }}
        />
        <span className="text-sm font-medium">{character.name}</span>
      </div>
      <Button
        onClick={(e) => {
          e.stopPropagation();
          onAdd(character.id);
        }}
        variant="filled"
        color="primary"
        size="sm"
        icon={<Plus size={16} />}
      ></Button>
    </div>
  );
};

export default CharacterItem;
