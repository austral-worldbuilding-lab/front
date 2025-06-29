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
    onCreate: (tag: { label: string; value: string; color: string }) => void;
    existingTags: { value: string }[];
}

const NewTagModal = ({ isOpen, onOpenChange, onCreate, existingTags }: NewTagModalProps) => {
    const [name, setName] = useState("");
    const [color, setColor] = useState(colors[0]);
    const [error, setError] = useState("");

    const handleCreate = () => {
        const trimmedName = name.trim();
        const lowerCaseName = trimmedName.toLowerCase();

        const alreadyExists = existingTags.some(
            (t) => t.value.toLowerCase() === lowerCaseName
        );

        if (!trimmedName) return;

        if (alreadyExists) {
            setError("Ya existe un tag con ese nombre.");
            return;
        }

        onCreate({ label: trimmedName, value: lowerCaseName, color });
        setName("");
        setColor(colors[0]);
        setError("");
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
                            if (error) setError("");
                        }}                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}

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
