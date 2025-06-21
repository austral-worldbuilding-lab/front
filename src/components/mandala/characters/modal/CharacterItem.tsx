import { Plus } from "lucide-react";

interface CharacterItemProps {
    character: { id: string; name: string; color: string };
    onAdd: (id: string) => void;
}

const CharacterItem: React.FC<CharacterItemProps> = ({ character, onAdd }) => {
    return (
        <div className="flex justify-between items-center p-3 border rounded-md bg-white shadow">
            <div className="flex items-center gap-3">
                <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: character.color }}
                />
                <span className="text-sm font-medium">{character.name}</span>
            </div>
            <button onClick={() => onAdd(character.id)} className="text-blue-600 hover:text-blue-800">
                <Plus size={16} />
            </button>
        </div>
    );
};

export default CharacterItem;
