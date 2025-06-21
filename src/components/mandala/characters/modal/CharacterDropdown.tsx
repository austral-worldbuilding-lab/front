import { useState } from "react";
import { Plus, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Character {
    id: string;
    name: string;
    color: string;
}

interface CharacterDropdownProps {
    characters: Character[];
    onAdd: (characterId: string) => void;
}

const CharacterDropdown: React.FC<CharacterDropdownProps> = ({ characters, onAdd }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative inline-block text-left">
            <Button variant="outline" onClick={() => setIsOpen((prev) => !prev)}>
                Personajes <ChevronDown className="ml-2 w-4 h-4" />
            </Button>

            {isOpen && (
                <div className="absolute mt-2 w-48 max-h-64 overflow-y-auto z-50 bg-white border border-gray-200 rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95">
                    {characters.length === 0 ? (
                        <div className="p-4 text-sm text-muted-foreground">No hay personajes disponibles</div>
                    ) : (
                        characters.map((character) => (
                            <div
                                key={character.id}
                                className="flex justify-between items-center px-4 py-2 hover:bg-gray-100 transition-colors"
                            >
                                <div className="flex items-center gap-2">
                                    <span
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: character.color }}
                                    />
                                    <span className="text-sm">{character.name}</span>
                                </div>
                                <button
                                    onClick={() => {
                                        onAdd(character.id);
                                        setIsOpen(false);
                                    }}
                                    className="text-blue-600 hover:text-blue-800 transition"
                                    title="Añadir a mandala"
                                >
                                    <Plus size={16} />
                                </button>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
};

export default CharacterDropdown;
