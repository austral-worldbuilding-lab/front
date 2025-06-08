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
import TagInput, { Item } from "@/components/common/TagInput.tsx";
import { Sectors, Levels } from "@/constants/mandala";


const initialDimensions: Item[] = Sectors.map(sector => ({
  id: sector.id,
  value: sector.name,
  color: "rgba(180, 210, 255, 0.7)",
}));

const initialScales: Item[] = Levels.map(level => ({
  id: level.id,
  value: level.name,
  color: "rgba(180, 210, 255, 0.7)",
}));

interface CreateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onCreateCharacter: (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
  }) => void;
  title?: string;
  createButtonText?: string;
}

const CreateModal = ({
  isOpen,
  onOpenChange,
  onCreateCharacter, title = "New Character", createButtonText = "Create Character"
}: CreateModalProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedColor, setSelectedColor] = useState(colors[0]);
  const [mandalaType, setMandalaType] = useState("empty");
  const [dimensions, setDimensions] = useState<Item[]>(initialDimensions);
  const [scales, setScales] = useState<Item[]>(initialScales);

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
    setDimensions(dimensions);
    setScales(scales);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {title}
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
          <div className="grid  sm:grid-cols-2 gap-4">
            <TagInput
                label="Dimensions"
                initialItems={initialDimensions}
                onChange={setDimensions}
            />

            <TagInput
                label="Scales"
                initialItems={initialScales}
                onChange={setScales}
                colorPicker={false}
            />
          </div>


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
            disabled={!name || dimensions.length === 0 || scales.length === 0}
          >
            {createButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateModal;
