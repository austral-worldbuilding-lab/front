import { useEffect, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import CharacterItem from "./CharacterItem";

interface Character {
  id: string;
  name: string;
  color: string;
}

interface CharacterDropdownProps {
  characters: Character[];
  onAdd?: (characterId: string) => void;
}

const CharacterDropdown: React.FC<CharacterDropdownProps> = ({
  characters,
  onAdd,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (characters.length > 0) {
      setIsOpen(true);
    }
  }, [characters]);

  return (
    <div className="inline-block text-left">
      <Button
        variant="outline"
        color="primary"
        onClick={() => setIsOpen((prev) => !prev)}
        className="bg-white hover:bg-gray-100"
      >
        Personajes <ChevronUp size={18} className="ml-2" />
      </Button>

      {isOpen && (
        <div className="absolute bottom-0 right-0 w-[400px] max-h-64 z-50 bg-white border border-gray-200 rounded-md shadow-lg animate-in fade-in-0 overflow-hidden">
          <div className="flex justify-between items-center w-full p-2 px-4 sticky top-0 bg-white z-10">
            <h2 className="text-lg font-bold">Personajes</h2>
            <Button
              variant="ghost"
              color="primary"
              size="sm"
              icon={<ChevronDown size={24} />}
              onClick={() => setIsOpen(false)}
              className="hover:bg-transparent text-gray-500 p-0"
            />
          </div>
          {characters.length === 0 ? (
            <div className="p-4 pt-0 text-sm text-muted-foreground">
              No hay personajes disponibles
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 p-4 overflow-y-auto max-h-[200px]">
              {characters.length > 0 &&
                characters.map((character) => (
                  <CharacterItem
                    key={character.id}
                    character={character}
                    onAdd={onAdd}
                  />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CharacterDropdown;
