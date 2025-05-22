

export interface ProjectFile {
    file_name: string;
    file_type: string;
}

/*export const getProjectFiles = async (projectId: string): Promise<ProjectFile[]> => {
    try {
        const response = await axios.get(`/files/${projectId}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching project files:", error);
        throw error;
    }
};*/


export const getProjectFiles = async (projectId: string) => {
    
    await new Promise(resolve => setTimeout(resolve, 500));

    return [
        { file_name: 'ejemplo1.csv', file_type: 'text/csv' },
        { file_name: 'analisis.pdf', file_type: 'application/pdf' },
    ];
};
