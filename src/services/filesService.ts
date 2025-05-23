import axios from 'axios';

export interface ProjectFile {
    file_name: string;
    file_type: string;
}

export const getProjectFiles = async (projectId: string): Promise<ProjectFile[]> => {
    try {
        const response = await axios.get<{ data: ProjectFile[] }>(`/files/${projectId}`);
        return response.data.data;
    } catch (error) {
        console.error("Error fetching project files:", error);
        throw error;
    }
};


