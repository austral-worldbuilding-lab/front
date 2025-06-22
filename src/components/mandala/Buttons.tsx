import { useState } from "react";
import { Button } from "../ui/button";
import { PersonStanding, StickyNote } from "lucide-react";
import CreateModal from "./characters/modal/CreateModal";
import NewPostItModal from "./postits/NewPostItModal";
import { Tag } from "@/types/mandala";

interface ButtonsProps {
  onCreatePostIt: (content: string, tag: Tag) => void;
  onNewTag: (tag: Tag) => void;
  onCreateCharacter?: (character: {
    name: string;
    description: string;
    useAIMandala: boolean;
    color: string;
    dimensions: { name: string; color?: string }[];
    scales: string[];
    parentId?: string;
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
    dimensions: { name: string; color?: string }[];
    scales: string[];
  }) => {
    if (onCreateCharacter) {
      onCreateCharacter({
        ...character,
        parentId: currentMandalaId,
      });
    }
  };
  return (
    <>
      <div className="absolute top-1/2 -translate-y-1/2 right-4 flex flex-col gap-2 z-20 bg-white rounded-lg p-2 shadow">
        <Button
          onClick={() => setPostItModalOpen(true)}
          variant="filled"
          className="w-12 h-12 bg-yellow-500 hover:bg-yellow-400"
          icon={<StickyNote size={24} />}
          tooltipText="Nuevo post-it"
        ></Button>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="filled"
          className="w-12 h-12 bg-violet-500 hover:bg-violet-400"
          icon={<PersonStanding size={24} />}
          tooltipText="Nuevo personaje"
        ></Button>
      </div>

      <CreateModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCharacter={handleCreateCharacter}
        title="Crear nuevo personaje"
        createButtonText="Crear personaje"
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
