import { useState, useEffect } from "react";
import { Button } from "../ui/button";
import { PersonStanding, StickyNote, Image } from "lucide-react";
import CreateModal from "./characters/modal/CreateModal";
import NewPostItModal from "./postits/NewPostItModal";
import NewImageModal from "./postits/NewImageModal";
import { Tag } from "@/types/mandala";
import { useParams } from "react-router-dom";
import { useProjectPermissions } from "@/hooks/usePermissionsLoader";

const MODAL_CLOSE_DELAY = 500; // 500 milisegundos

interface ButtonsProps {
  onCreatePostIt: (content: string, tags: Tag[], postItFatherId?: string, dimension?: string, section?: string) => void;
  onUploadImage?: (imageFile: File, tags: Tag[]) => void;
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
  loading?: boolean;
}

const Buttons = ({
  onCreatePostIt,
  onUploadImage,
  onCreateCharacter,
  onNewTag,
  tags,
  currentMandalaId,
  loading = false,
}: ButtonsProps) => {
  const { projectId } = useParams<{ projectId: string }>();
  const { canEdit } = useProjectPermissions(projectId || "");

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPostItModalOpen, setPostItModalOpen] = useState(false);
  const [isImageModalOpen, setImageModalOpen] = useState(false);
  const [wasCreating, setWasCreating] = useState(false);

  useEffect(() => {
    if (loading) {
      setWasCreating(true);
    } else if (wasCreating && !loading) {
      const timer = setTimeout(() => {
        setIsCreateModalOpen(false);
        setWasCreating(false);
      }, MODAL_CLOSE_DELAY);
      return () => clearTimeout(timer);
    }
  }, [loading, wasCreating]);

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

  if (!canEdit) {
    return null;
  }

  return (
    <>
      <div
        className="absolute top-1/2 -translate-y-1/2 left-4 flex flex-col gap-2 z-[10] bg-white rounded-lg p-2 shadow"
        data-floating-buttons
      >
        <Button
          onClick={() => setPostItModalOpen(true)}
          variant="filled"
          className="w-12 h-12 bg-yellow-500 hover:bg-yellow-400 active:bg-yellow-400"
          icon={<StickyNote size={24} />}
          tooltipText="Nuevo post-it"
        ></Button>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          variant="filled"
          className="w-12 h-12 bg-violet-500 hover:bg-violet-400 active:bg-violet-400"
          icon={<PersonStanding size={24} />}
          tooltipText="Nuevo personaje"
        ></Button>
        <Button
          onClick={() => setImageModalOpen(true)}
          variant="filled"
          className="w-12 h-12 bg-blue-500 hover:bg-blue-400 active:bg-blue-400"
          icon={<Image size={24} />}
          tooltipText="Agregar imagen"
        ></Button>
      </div>

      <CreateModal
        isOpen={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onCreateCharacter={handleCreateCharacter}
        title="Crear nuevo personaje"
        createButtonText="Crear personaje"
        loading={loading}
      />
      <NewPostItModal
        isOpen={isPostItModalOpen}
        onOpenChange={setPostItModalOpen}
        tags={tags}
        onNewTag={onNewTag}
        onCreate={(content, tags, postItFatherId, dimension, section) => 
          onCreatePostIt(content, tags, postItFatherId, dimension, section)
        }
      />
      <NewImageModal
        isOpen={isImageModalOpen}
        onOpenChange={setImageModalOpen}
        tags={tags}
        onNewTag={onNewTag}
        onCreate={onUploadImage}
        onUploadComplete={() => setImageModalOpen(false)}
      />
    </>
  );
};

export default Buttons;
