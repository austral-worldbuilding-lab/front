import { useState, useEffect, useRef } from "react";
import {EncyclopediaJobStatus, getEncyclopediaJobStatus, startEncyclopediaJob} from "@/services/enciclopediaService.ts";
import {getFilesWithSelection} from "@/services/filesService.ts";


export function useEncyclopediaJob(projectId: string, projectName: string) {
    const [jobId, setJobId] = useState<string | null>(null);
    const [status, setStatus] = useState<string>("none");
    const [progress, setProgress] = useState<number>(0);
    const [encyclopedia, setEncyclopedia] = useState<string | null>(null);
    const [storageUrl, setStorageUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    const startJob = async (selectedFiles: string[]) => {
        try {
            const { jobId } = await startEncyclopediaJob(projectId, selectedFiles);
            setJobId(jobId);
            setStatus("waiting");
            setProgress(0);
            setError(null);
        } catch (err: any) {
            setError(err.response?.data?.message || "Error al iniciar la generación");
        }
    };

    useEffect(() => {
        if (!jobId) return;

        const fetchStatus = async () => {
            try {
                const data: EncyclopediaJobStatus = await getEncyclopediaJobStatus(projectId);

                const isDone =
                    (data.progress === 100 && (data.storageUrl || data.encyclopedia)) ||
                    data.status === "completed";

                if (data.status === "none" && ["waiting", "active"].includes(status)) {
                    const success = await verifyIfEncyclopediaExists();
                    if (success) {
                        setStatus("completed");
                        setProgress(100);
                        if (intervalRef.current) clearInterval(intervalRef.current);
                        return;
                    }
                }

                if (status === "completed" && data.status === "none") return;

                setStatus(isDone ? "completed" : data.status);
                setProgress(data.progress || 0);
                if (data.encyclopedia) setEncyclopedia(data.encyclopedia);
                if (data.storageUrl) setStorageUrl(data.storageUrl);

                if (isDone || data.status === "failed") {
                    if (intervalRef.current) clearInterval(intervalRef.current);
                    if (isDone) await verifyIfEncyclopediaExists();
                }
            } catch (err) {
                console.error("Error consultando estado del job:", err);
                if (intervalRef.current) clearInterval(intervalRef.current);
                setError("Error consultando estado del job");
            }
        };

        intervalRef.current = setInterval(fetchStatus, 4000);
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [jobId, projectId, status]);

    const verifyIfEncyclopediaExists = async (): Promise<boolean> => {
        try {
            const files = await getFilesWithSelection("project", projectId);

            const normalize = (s: string) =>
                s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

            const targetBase = normalize("Enciclopedia del mundo");
            const targetProject = normalize(projectName);

            const found = files.find(
                (f) =>
                    normalize(f.file_name).includes(targetBase) &&
                    normalize(f.file_name).includes(targetProject)
            );

            if (found) {
                setStorageUrl(found.url || found.url);
                setStatus("completed");
                setProgress(100);
                return true;
            }
        } catch (err) {
            console.error("Error verificando enciclopedia:", err);
        }
        return false;
    };

    useEffect(() => {
        verifyIfEncyclopediaExists();
    }, [projectId]);

    return {
        jobId,
        status,
        progress,
        encyclopedia,
        storageUrl,
        error,
        startJob,
    };
}
