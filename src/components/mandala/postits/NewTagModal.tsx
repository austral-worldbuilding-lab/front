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
}

const NewTagModal = ({ isOpen, onOpenChange, onCreate }: NewTagModalProps) => {
    const [name, setName] = useState("");
    const [color, setColor] = useState(colors[0]);

    const handleCreate = () => {
        if (!name.trim()) return;
        onCreate({ label: name, value: name.toLowerCase(), color });
        setName("");
        setColor(colors[0]);
        onOpenChange(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center">
                        Create New Tag
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <Input
                        placeholder="Tag name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />

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
                        Cancel
                    </Button>
                    <Button
                        onClick={handleCreate}
                        disabled={!name.trim()}
                    >
                        Create Tag
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default NewTagModal;
