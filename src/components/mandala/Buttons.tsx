import { useState } from "react";
import { Button } from "../ui/button";
import { PersonStanding, StickyNote } from "lucide-react";
import CreateModal from "./characters/modal/CreateModal";

interface ButtonsProps {
  onCreatePostIt: () => void;
  onCreateCharacter?: (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
  }) => void;
}

const Buttons = ({ onCreatePostIt, onCreateCharacter }: ButtonsProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const handleCreateCharacter = (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
  }) => {
    if (onCreateCharacter) {
      onCreateCharacter(character);
    }
  };

  return (
    <>
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Button
          onClick={onCreatePostIt}
          variant="filled"
          color="secondary"
          icon={<StickyNote size={16} />}
        >
          New Post-It
        </Button>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="filled"
          color="primary"
          icon={<PersonStanding size={16} />}
        >
          New Character
        </Button>
      </div>

      <CreateModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCharacter={handleCreateCharacter}
      />
    </>
  );
};

export default Buttons;
