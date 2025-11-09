import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import SelectTags from "./SelectTags";
import { Tag } from "@/types/mandala";
import { useParams } from "react-router-dom";
import { useTags } from "@/hooks/useTags";
import { Image as ImageIcon, Loader2 } from "lucide-react";
import { useCreateImage } from "@/hooks/useCreateImage";

interface NewImageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  tags: Tag[];
  onCreate?: (imageFile: File, tags: Tag[]) => void;
  onNewTag: (tag: Tag) => void;
  onUploadComplete?: () => void;
  initialImageUrl?: string;
}

const NewImageModal = ({
  isOpen,
  onOpenChange,
  tags,
  onCreate,
  onNewTag,
  onUploadComplete,
    initialImageUrl,
}: NewImageModalProps) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedTags, setSelectedTags] = useState<Tag[]>([]);

  const { projectId } = useParams<{ projectId: string }>();
  const { deleteTag } = useTags(projectId!);
  const { isUploading, error, uploadImage } = useCreateImage();

  // Reset the form when the modal is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedImage(null);
      setPreviewUrl(null);
      setSelectedTags([]);
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && initialImageUrl) {
      setPreviewUrl(initialImageUrl);
    }
  }, [isOpen, initialImageUrl]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedImage(file);

      // Create preview URL
      const fileReader = new FileReader();
      fileReader.onload = () => {
        setPreviewUrl(fileReader.result as string);
      };
      fileReader.readAsDataURL(file);
    }
  };

  const handleCreate = async () => {
    let imageToUpload: File | null = selectedImage;

    if (!selectedImage && initialImageUrl) {
      const response = await fetch(initialImageUrl);
      const blob = await response.blob();
      imageToUpload = new File([blob], "generated-image.png", { type: blob.type });
    }

    if (imageToUpload) {
      if (onCreate) {
        onCreate(imageToUpload, selectedTags);
        onOpenChange(false);
        return;
      }

      const success = await uploadImage(imageToUpload, selectedTags);

      if (success) {
        if (onUploadComplete) onUploadComplete();
        onOpenChange(false);
      }
    }
  };

  const handleDeleteTag = async (tagId: string) => {
    try {
      await deleteTag(tagId);
      setSelectedTags((prev) => prev.filter((tag) => tag.id !== tagId));
    } catch (err) {
      console.error("Error deleting tag:", err);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Agregar nueva imagen
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Imagen
            </label>
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="image-upload"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Haga clic para cargar</span>
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, JPEG, WEBP</p>
                </div>
                <input
                  id="image-upload"
                  type="file"
                  className="hidden"
                  accept="image/png, image/jpeg, image/webp"
                  onChange={handleImageChange}
                />
              </label>
            </div>
            {previewUrl && (
              <div className="mt-4">
                <p className="text-sm font-medium text-gray-700 mb-1">
                  Vista previa:
                </p>
                <div className="relative w-full rounded-lg overflow-hidden border border-gray-300">
                  <img
                    src={previewUrl}
                    alt="Vista previa"
                    className="w-full h-auto max-h-64 object-contain"
                  />
                </div>
              </div>
            )}
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-3 text-sm">
            {error}
          </div>
        )}

        <DialogFooter className="flex sm:justify-between">
          <Button
            variant="outline"
            color="tertiary"
            onClick={() => onOpenChange(false)}
            disabled={isUploading}
          >
            Cancelar
          </Button>
          <Button
            variant="filled"
            color="primary"
            onClick={handleCreate}
            disabled={!selectedImage && !initialImageUrl|| isUploading}
          >
            {isUploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Subiendo...
              </>
            ) : (
              "Agregar Imagen"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default NewImageModal;
