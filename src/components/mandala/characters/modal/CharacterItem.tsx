import { Plus } from "lucide-react";

interface CharacterItemProps {
    character: { id: string; name: string; color: string };
}

const CharacterItem: React.FC<CharacterItemProps> = ({ character}) => {
    return (
        <div className="flex justify-between items-center p-3 border rounded-md shadow-sm bg-white">
            <div className="flex items-center gap-3">
                <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: character.color }}
                />
                <span className="text-sm font-medium">{character.name}</span>
            </div>
            <button
                className="text-blue-600 hover:text-blue-800 transition"
                title="Añadir a mandala"
            >
                <Plus size={16} />
            </button>
        </div>
    );
};

export default CharacterItem;
