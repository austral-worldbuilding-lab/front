import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SelectTags, { Tag } from "./SelectTags";
import { CustomInput } from "@/components/ui/CustomInput";

interface NewPostItModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onCreate: (content: string, tag: Tag) => void;
  onNewTag: (tag: Tag) => void;
}

const NewPostItModal = ({
  isOpen,
  onOpenChange,
  tags,
  onCreate,
  onNewTag,
}: NewPostItModalProps) => {
  const [content, setContent] = useState("");
  const [selectedTag, setSelectedTag] = useState<Tag | null>(tags[0]);
  const isValid = content.trim() !== "" && selectedTag;

  const handleCreate = () => {
    if (isValid && selectedTag) {
      onCreate(content.trim(), selectedTag);
      setContent("");
      setSelectedTag(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Create New Post-It
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Text
            </label>
            <CustomInput
              as="textarea"
              placeholder="Write your note here..."
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
              value={selectedTag?.value || tags[0].value}
              onChange={setSelectedTag}
              onNewTag={onNewTag}
            />
          </div>
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
            onClick={handleCreate}
            disabled={!isValid}
          >
            Create Post-It
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewPostItModal;
