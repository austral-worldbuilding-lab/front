import { useState } from "react";
import { Tag, Postit } from "@/types/mandala";
import {updatePostItTags} from "@/services/mandalaService.ts";

export function useEditPostIt() {
    const [isOpen, setIsOpen] = useState(false);
    const [postit, setPostit] = useState<Postit | null>(null);
    const [mandalaId, setMandalaId] = useState<string | null>(null);

    const open = (mandalaId: string, postit: Postit) => {
        setMandalaId(mandalaId);
        setPostit(postit);
        setIsOpen(true);
    };

    const close = () => {
        setIsOpen(false);
        setPostit(null);
        setMandalaId(null);
    };

    const handleUpdate = async (content: string, tags: Tag[]) => {
        if (!mandalaId || !postit?.id) return;

        try {
            await updatePostItTags(mandalaId, postit.id, { content, tags });

            setPostit({ ...postit, content, tags });

            close();
            return { success: true, updated: { content, tags } };
        } catch (error) {
            console.error("Error al actualizar post-it", error);
            return { success: false };
        }
    };


    return {
        isOpen,
        postit,
        open,
        close,
        handleUpdate,
    };
}
