import { useState, useEffect, useRef } from "react";
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
import {useTags} from "@/hooks/useTags.ts";
import {useParams} from "react-router-dom";

interface EditPostItModalProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    tags: Tag[];
    onUpdate: (content: string, tags: Tag[]) => void;
    initialContent: string;
    initialTags: Tag[];
    onNewTag: (tag: Tag) => void;
}


const EditPostItModal = ({
                             isOpen,
                             onOpenChange,
                             tags,
                             onUpdate,
                             initialContent,
                             initialTags,
                             onNewTag,
                         }: EditPostItModalProps) => {
    const [content, setContent] = useState(initialContent);
    const [selectedTags, setSelectedTags] = useState<Tag[]>(initialTags);
    const inputRef = useRef<HTMLTextAreaElement | null>(null);
    const { projectId } = useParams<{ projectId: string }>();
    const { deleteTag } = useTags(projectId!);


    useEffect(() => {
        if (isOpen) {
            setContent(initialContent);

            const normalizedSelectedTags = initialTags
                .map((tag) => tags.find((t) => t.name === tag.name))
                .filter((t): t is Tag => !!t);

            setSelectedTags(normalizedSelectedTags);

            setTimeout(() => {
                if (inputRef.current) {
                    const length = inputRef.current.value.length;
                    inputRef.current.focus();
                    inputRef.current.setSelectionRange(length, length);
                }
            }, 0);
        }
    }, [isOpen, initialContent, initialTags]);




    const isValid = content.trim() !== "";

    const handleUpdate = () => {
        if (isValid) {
            onUpdate(content.trim(), selectedTags);
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
                        Editar Post-It
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Texto
                        </label>
                        <CustomInput
                            as="textarea"
                            placeholder="Editar nota..."
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="resize-none border w-full"
                            ref={inputRef}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Tags
                        </label>
                        <SelectTags
                            tags={tags}
                            value={selectedTags}
                            onChange={setSelectedTags}
                            onNewTag={(newTag) => {
                                onNewTag(newTag);
                                setSelectedTags((prev) => [...prev, newTag]);
                            }}
                            onDeleteTag={handleDeleteTag}
                        />

                    </div>
                </div>

                <DialogFooter className="flex sm:justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                    </Button>
                    <Button
                        variant="filled"
                        color="primary"
                        onClick={handleUpdate}
                        disabled={!isValid}
                    >
                        Actualizar Post-It
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default EditPostItModal;
