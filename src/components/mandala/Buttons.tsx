import { useState } from "react";
import { Button } from "../ui/button";
import { PersonStanding, StickyNote } from "lucide-react";
import CreateModal from "./characters/modal/CreateModal";
import NewPostItModal from "./postits/NewPostItModal";
import { Tag } from "./postits/SelectTags";

interface ButtonsProps {
  onCreatePostIt: (content: string, tag: Tag) => void;
  onNewTag: (tag: Tag) => void;
  onCreateCharacter?: (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
    dimensions: { name: string; color?: string }[],
    scales: string[];
    linkedToId?: string;
  }) => void;
  tags: Tag[];
  currentMandalaId?: string;
}

const Buttons = ({
  onCreatePostIt,
  onCreateCharacter,
  onNewTag,
  tags,
  currentMandalaId,
}: ButtonsProps) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPostItModalOpen, setPostItModalOpen] = useState(false);

  const handleCreateCharacter = (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
    dimensions: { name: string; color?: string }[],
    scales: string[];
  }) => {
    if (onCreateCharacter) {
      onCreateCharacter({
        ...character,
        linkedToId: currentMandalaId,
      });
    }
  };
  return (
    <>
      <div className="absolute top-4 right-4 flex gap-2 z-20">
        <Button
          onClick={() => setPostItModalOpen(true)}
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
        title="Create New Character"
        createButtonText="Create new character"
      />
      <NewPostItModal
        isOpen={isPostItModalOpen}
        onOpenChange={setPostItModalOpen}
        tags={tags}
        onNewTag={onNewTag}
        onCreate={onCreatePostIt}
      />
    </>
  );
};

export default Buttons;
