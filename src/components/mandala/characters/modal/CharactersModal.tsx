import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import CharacterItem from "./CharacterItem";

interface CharacterModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    characters: { id: string; name: string; color: string }[];
}

const CharactersModal: React.FC<CharacterModalProps> = ({ isOpen, onOpenChange, characters }) => {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Personajes del proyecto</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-h-[60vh] overflow-y-auto">
                    {characters.map((char) => (
                        <CharacterItem key={char.id} character={char} />
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default CharactersModal;