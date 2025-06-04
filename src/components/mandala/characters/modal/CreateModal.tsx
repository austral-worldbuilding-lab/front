import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CustomInput } from "@/components/ui/CustomInput";
import { colors } from "@/constants/character";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import ColorSelector from "./ColorSelector";
import { Sparkles } from "lucide-react";

interface CreateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCharacter: (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
  }) => void;
}

const CreateModal = ({
  isOpen,
  onOpenChange,
  onCreateCharacter,
}: CreateModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [mandalaType, setMandalaType] = useState("empty");

  const handleCreateCharacter = () => {
    onCreateCharacter({
      name,
      description,
      useAIMandala: mandalaType === "ai",
      color: selectedColor,
    });
    setName("");
    setDescription("");
    setSelectedColor(colors[0]);
    setMandalaType("empty");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            New Character
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <CustomInput
            id="name"
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full"
          />

          <div className="flex justify-between gap-2">
            <RadioGroup
              value={mandalaType}
              onValueChange={setMandalaType}
              className="flex flex-col gap-2"
            >
              <label className="flex items-center gap-3 cursor-pointer">
                <RadioGroupItem value="empty" />
                <span className="text-black">Empty mandala</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <RadioGroupItem value="ai" />
                <span className="text-black flex items-center gap-2">
                  AI generated <Sparkles className="w-4 h-4" />
                </span>
              </label>
            </RadioGroup>

            <ColorSelector
              className="w-1/2"
              selectedColor={selectedColor}
              setSelectedColor={setSelectedColor}
              colors={colors}
            />
          </div>

          {mandalaType === "ai" && (
            <div className="space-y-2">
              <CustomInput
                id="description"
                label="Description (optional)"
                about="This description will be usefull for the AI to generate the mandala with more precision"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                as="textarea"
                style={{ maxHeight: 160 }}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button
            variant="outline"
            color="tertiary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            variant="filled"
            color="primary"
            onClick={handleCreateCharacter}
            disabled={!name}
          >
            Create Character
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModal;
