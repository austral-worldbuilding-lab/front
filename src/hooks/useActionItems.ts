import { useState } from "react";
import {ActionItem} from "@/types/mandala";
import {getActionIntem} from "@/services/solutionService.ts";

export default function useActionItems(projectId: string, solutionId: string) {
    const [actionItems, setActionItems] = useState<ActionItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const generateActionItems = async () => {
        setLoading(true);
        setError(null);

        try {
            const items = await getActionIntem(projectId, solutionId);
            setActionItems(items);
            return items;
        } catch (err) {
            console.error("Error generando action items:", err);
            setError("No se pudieron generar los action items");
            return [];
        } finally {
            setLoading(false);
        }
    };

    return {
        actionItems,
        loading,
        error,
        generateActionItems,
        setActionItems,
    };
}
