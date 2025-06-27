import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import CharacterItem from "./CharacterItem";

interface Character {
  id: string;
  name: string;
  color: string;
}

interface CharacterDropdownProps {
  characters: Character[];
  onAdd: (characterId: string) => void;
}

const CharacterDropdown: React.FC<CharacterDropdownProps> = ({
  characters,
  onAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block text-left">
      <Button
        variant="outline"
        color="primary"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-white hover:bg-gray-100"
      >
        Personajes <ChevronDown size={18} className="ml-2" />
      </Button>

      {isOpen && (
        <div className="absolute mt-2 w-64 max-h-64 overflow-y-auto z-50 bg-white border border-gray-200 rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95">
          {characters.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              No hay personajes disponibles
            </div>
          ) : (
            characters.map((character) => (
              <CharacterItem
                key={character.id}
                character={character}
                onAdd={onAdd}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterDropdown;
