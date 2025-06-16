import axiosInstance from "@/lib/axios";
import {CreateProject, Project, SimpleMandala, Tag} from "@/types/mandala";

export interface CreateMandalaDto {
  name: string;
  projectId: string;
}


export const getMandalas = async (
  projectId: string
): Promise<SimpleMandala[]> => {
  const response = await axiosInstance.get<{ data: SimpleMandala[] }>(
    "/mandala",
    {
      params: { projectId },
    }
  );

  return response.data.data;
};

export const getProjects = async (page : number, limit : number): Promise<Project[]> => {
  const response = await axiosInstance.get<{ data: Project[] }>(
    `/project?page=${page}&limit=${limit}`
  );

  return response.data.data;
}

export const createProject = async (project: CreateProject): Promise<Project> => {

  const response = await axiosInstance.post("/project", project);

  if (response.status !== 201) {
    throw new Error(response.data.message || "Error creating project.");
  }

  return response.data.data;
}


export const getTags = async(
    projectId: string,
) => {
  const response = await axiosInstance.get<{ data: Tag[] }>(
      `/project/${projectId}/tags`
  );

  if (response.status !== 200) {
    throw new Error("Error fetching filters.");
  }

  console.log("Tags response:", response.data.data);
  return response.data.data;
}
