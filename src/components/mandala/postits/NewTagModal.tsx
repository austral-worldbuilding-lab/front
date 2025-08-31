import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import ColorSelector from "../characters/modal/ColorSelector";
import { colors } from "@/constants/character";
import {DialogFooter} from "../../ui/dialog";

interface NewTagModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    onCreate: (tag: { id: string, name: string; value: string; color: string }) => void;
    existingTags:  string[];
}

const NewTagModal = ({ isOpen, onOpenChange, onCreate, existingTags }: NewTagModalProps) => {
    const [name, setName] = useState("");
    const [color, setColor] = useState(colors[0]);
    const [error, setError] = useState<string | null>(null);

    const handleCreate = () => {
        if (!name.trim()) return;

        const normalizedName = name.trim().toLowerCase();
        const alreadyExists = existingTags.some(
            (existing) => existing.trim().toLowerCase() === normalizedName
        );

        if (alreadyExists) {
            setError("Ya existe un tag con ese nombre");
            return;
        }

        onCreate({ id: name, name: name, value: normalizedName, color });
        setName("");
        setColor(colors[0]);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Crear Nuevo Tag
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <Input
                        placeholder="Nombre del tag"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (error) setError(null);
                        }}
                    />
                    {error && <p className="text-sm text-red-600 mt-1">{error}</p>}

                    <ColorSelector
                        selectedColor={color}
                        setSelectedColor={setColor}
                        colors={colors}
                    />
                </div>

                <DialogFooter className="flex sm:justify-between">
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!name.trim()}
                    >
                        Crear Tag
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewTagModal;
