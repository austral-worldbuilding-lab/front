import axiosInstance from '@/lib/axios';

export interface ProjectFile {
    file_name: string;
    file_type: string;
}

export const getProjectFiles = async (projectId: string): Promise<ProjectFile[]> => {
    try {
        const response = await axiosInstance.get<{ data: ProjectFile[] }>(`/files/${projectId}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project files:", error);
        throw error;
    }
};

export const createProjectFiles = async (
    projectId: string,
    files: ProjectFile[]
): Promise<{ url: string }[]> => {
    try {
        const response = await axiosInstance.post<{ data: { url: string }[] }>(
            `/files/${projectId}`,
            files
        );
        return response.data.data;
    } catch (error) {
        console.error("Error creating project files:", error);
        throw error;
    }
};
