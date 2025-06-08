import axiosInstance from "@/lib/axios";
import {CreateProject, Project, SimpleMandala} from "@/types/mandala";

export interface CreateMandalaDto {
  name: string;
  projectId: string;
}

export const createMandala = async (
  type: "blank" | "ai",
  dto: CreateMandalaDto
): Promise<string> => {
  if (type === "ai") {
    const response = await axiosInstance.post("/mandala/generate", dto);
    if (response.status !== 201) {
      throw new Error(
        response.data.message || "Error generating mandala with AI."
      );
    }
    return response.data.data.mandala.id;
  }
  const response = await axiosInstance.post("/mandala", dto);
  if (response.status !== 201) {
    throw new Error(response.data.message || "Error creating mandala.");
  }
  return response.data.data.id;
};

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