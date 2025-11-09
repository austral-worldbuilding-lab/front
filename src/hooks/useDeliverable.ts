import { useEffect, useState } from "react";
import {getDeliverable} from "@/services/solutionService.ts";

export interface Deliverable {
    id: string;
    type: string;
    fileName: string;
    url: string;
    created_at?: string;
}

export function useDeliverables(projectId: string) {
    const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchDeliverables = async () => {
        if (!projectId) return;
        setLoading(true);
        try {
            const data = await getDeliverable(projectId);
            setDeliverables(data || []);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDeliverables();
    }, [projectId]);

    return { deliverables, loading, error, refresh: fetchDeliverables };
}
