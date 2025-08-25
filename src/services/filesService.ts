import axiosInstance from '@/lib/axios';
import {FileItem} from "@/types/mandala";


export type FileScope = 'organization' | 'project' | 'mandala';
const getBaseUrl = (scope: FileScope, id: string) => `/files/${scope}/${id}`;


export const getFiles = async (scope: FileScope, id: string): Promise<FileItem[]> => {
    try {
        const response = await axiosInstance.get<{ data: FileItem[] }>(getBaseUrl(scope, id));
        const mappedFiles = response.data.data.map(file => ({
            ...file,
            source_scope: file.source_scope === 'org' ? 'organization' : file.source_scope,
        }));

        return mappedFiles;
    } catch (error) {
        console.error(`Error fetching ${scope} files:`, error);
        throw error;
    }
};

export const createFiles = async (
    scope: FileScope,
    id: string,
    files: FileItem[]
): Promise<{ url: string }[]> => {
    try {
        const response = await axiosInstance.post<{ data: { url: string }[] }>(
            getBaseUrl(scope, id),
            files
        );
        return response.data.data;
    } catch (error) {
        console.error(`Error creating ${scope} files:`, error);
        throw error;
    }
};

export const deleteFile = async (
    scope: FileScope,
    id: string,
    fileName: string
): Promise<void> => {
    try {
        await axiosInstance.delete(`${getBaseUrl(scope, id)}/${encodeURIComponent(fileName)}`);
    } catch (error) {
        console.error(`Error deleting ${scope} file:`, error);
        throw error;
    }
};
