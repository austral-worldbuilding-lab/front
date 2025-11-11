import type { Solution} from "@/types/mandala"
import axiosInstance from "@/lib/axios.ts";


export async function getAllSolutions(projectId: string): Promise<Solution[]> {
    if (!projectId) throw new Error("projectId es requerido");

    const response = await axiosInstance.get<Solution[]>(`/project/${projectId}/solutions`);
    if (response.status !== 200) {
        throw new Error("Error fetching solutions.");
    }
    return response.data;
}

export async function createSolution(projectId: string, body: Omit<Solution, "id">): Promise<Solution> {
    const res = await axiosInstance.post<Solution>(`/project/${projectId}/solution`, body);
    return res.data;
}


export const startSolutionJob = async (projectId: string) => {
    const res = await axiosInstance.post(`/project/${projectId}/solutions/generate`);
    return res.data;
};

export const getSolutionJobStatus = async (projectId: string) => {
    const res = await axiosInstance.get(`/project/${projectId}/solutions/generate/status`);
    return res.data;
};


export const getSolutionValidation = async (projectId: string) => {

    const res = await axiosInstance.get(`/project/${projectId}/solutions/validation`);
    return res.data;
};

export const getDeliverable = async (projectId: string) => {

    const res = await axiosInstance.get(`/project/${projectId}/deliverables`);
    return res.data?.data?.deliverables || [];
};

export const getActionIntem = async (projectId: string, solutionId: string) => {

    const res = await axiosInstance.post(`/project/${projectId}/solutions/${solutionId}/action-items/generate`);
    return res.data;

};

export const getSolutionImages = async (
  projectId: string,
  solutionId: string
): Promise<{ urls: string[] }> => {
  const response = await axiosInstance.get(
    `/project/${projectId}/solutions/${solutionId}/images`
  );
  return response.data.data;
};

export const generateSolutionImages = async (
  projectId: string,
  solutionId: string
): Promise<{ urls: string[] }> => {
  const response = await axiosInstance.post(
    `/project/${projectId}/solutions/${solutionId}/images/generate`
  );
  return response.data.data;
};