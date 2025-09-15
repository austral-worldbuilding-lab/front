import { useState, useEffect } from "react";
import { Provocation } from "@/types/mandala";
import {provocationsService} from "@/services/provocationService.ts";

export default function useProvocations(projectId: string) {
    const [provocations, setProvocations] = useState<Provocation[]>([]);
    const [loading, setLoading] = useState(false);

    const reload = async () => {
        setLoading(true);
        setLoading(false);
    };

    const generateAI = async () => {
        setLoading(true);
        const data = await provocationsService.generateAIProvocations(projectId);
        setProvocations(data);
        setLoading(false);
    };

    const createManual = async (body: Omit<Provocation, "id">) => {
        setLoading(true);
        const newProv = await provocationsService.createManualProvocation(projectId, body);
        setProvocations((prev) => [...prev, newProv]);
        setLoading(false);
    };

    useEffect(() => {
        reload();
    }, [projectId]);

    return { provocations, loading, setProvocations, generateAI, createManual };
}
