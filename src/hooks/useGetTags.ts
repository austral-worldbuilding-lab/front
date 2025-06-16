import {useEffect, useState} from "react";
import {getTags} from "@/services/projectService.ts";
import { Tag } from "@/components/mandala/postits/SelectTags";
import {BackendTag} from "@/types/mandala";


export function useGetTags(projectId: string) {
    const [tags, setTags] = useState<Tag[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        if (!projectId) return;

        const fetchTags = async () => {
            setIsLoading(true);
            try {
                const tagsFromBackend: BackendTag[] = await getTags(projectId);
                setTags(
                    tagsFromBackend.map((tag) => ({
                        label: tag.name,
                        value: tag.name.toLowerCase(),
                        color: tag.color,
                    }))
                );
                setError(null);
            } catch (err) {
                setError(err as Error);
                setTags([]);
            }
            setIsLoading(false);
        };

        fetchTags();
    }, [projectId]);

    return { tags, isLoading, error };
}
