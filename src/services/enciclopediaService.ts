import axiosInstance from "@/lib/axios";

export interface EncyclopediaJobStatus {
    status: string;
    progress: number;
    storageUrl?: string;
    encyclopedia?: string;
}

export const startEncyclopediaJob = async (projectId: string, selectedFiles: string[]) => {
    const res = await axiosInstance.post(`/project/${projectId}/encyclopedia`, { selectedFiles });
    return res.data;
};

export const getEncyclopediaJobStatus = async (projectId: string): Promise<EncyclopediaJobStatus> => {
    const res = await axiosInstance.get(`/project/${projectId}/encyclopedia/status`);
    return res.data;
};
