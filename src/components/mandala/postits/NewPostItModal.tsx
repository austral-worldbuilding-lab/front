import {useEffect, useState} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SelectTags from "./SelectTags";
import { CustomInput } from "@/components/ui/CustomInput";
import { Tag } from "@/types/mandala";
import { useTags } from "@/hooks/useTags";
import {useParams} from "react-router-dom";

interface NewPostItModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onCreate: (content: string, tags: Tag[], postItFatherId?: string, dimension?: string, section?: string) => void;
  onNewTag: (tag: Tag) => void;
  postItFatherId?: string;
  defaultContent?: string;
  defaultDimension?: string;
  defaultSection?: string;
}

const NewPostItModal = ({
  isOpen,
  onOpenChange,
  tags,
  onCreate,
  onNewTag,
  postItFatherId,
  defaultContent = "",
  defaultDimension,
  defaultSection,
}: NewPostItModalProps) => {
  const [content, setContent] = useState("");
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const isValid = content.trim() !== "";
  const { projectId } = useParams<{ projectId: string }>();
  const { deleteTag } = useTags(projectId!);

  useEffect(() => {
    if (isOpen) setContent((defaultContent ?? "").trim());
  }, [isOpen, defaultContent]);

  const handleCreate = () => {
    if (isValid) {
      onCreate(content.trim(), selectedTags, postItFatherId, defaultDimension, defaultSection);
      setContent("");
      setSelectedTags([]);
      onOpenChange(false);
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag(tagId);
      setSelectedTags((prev) => prev.filter(tag => tag.id !== tagId));
    } catch (err) {
      console.error("Error deleting tag:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Crear nuevo Post-It
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Texto
            </label>
            <CustomInput
              as="textarea"
              placeholder="Escriba su nota aquí..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="resize-none border w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tag
            </label>
            <SelectTags
              tags={tags}
              value={selectedTags}
              onChange={setSelectedTags}
              onNewTag={onNewTag}
              onDeleteTag={handleDeleteTag}
            />
          </div>
        </div>

        <DialogFooter className="flex sm:justify-between">
          <Button
            variant="outline"
            color="tertiary"
            onClick={() => onOpenChange(false)}
          >
            Cancelar
          </Button>
          <Button
            variant="filled"
            color="primary"
            onClick={handleCreate}
            disabled={!isValid}
          >
            Crear Post-It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewPostItModal;
