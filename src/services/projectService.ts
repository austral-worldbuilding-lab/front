import axiosInstance from "@/lib/axios";
import {CreateProject, Project, BackendTag} from "@/types/mandala";
import { BackendTimelineResponse} from "@/utils/timelineUtils.ts";

export interface CreateMandalaDto {
  name: string;
  projectId: string;
}


export const getProjects = async (organizationId: string, page : number, limit : number): Promise<Project[]> => {
  const response = await axiosInstance.get<{ data: Project[] }>(
      `/organization/${organizationId}/projects?page=${page}&limit=${limit}`
  );

  return response.data.data;
}

export const getProject = async (id: string): Promise<Project> => {
    const response = await axiosInstance.get<{ data: Project }>(`/project/${id}`);
    return response.data.data;
}

export const createProject = async (project: CreateProject): Promise<Project> => {

  const response = await axiosInstance.post("/project", project);

  if (response.status !== 201) {
    throw new Error(response.data.message || "Error creating project.");
  }

  return response.data.data;
}

export const updateProject = async (
    id: string,
    data: { name?: string; description?: string }
): Promise<Project> => {
  const response = await axiosInstance.patch<{ data: Project }>(
      `/project/${id}`,
      data
  );

  if (response.status !== 200) {
    throw new Error(response.statusText || "Error actualizando proyecto.");
  }

  return response.data.data;
};



export const getTags = async(
    projectId: string,
) => {
  const response = await axiosInstance.get<{ data: BackendTag[] }>(
      `/project/${projectId}/tags`
  );

  if (response.status !== 200) {
    throw new Error("Error fetching filters.");
  }

  return response.data.data;
}

export const createTag = async (
  projectId: string,
  tag: { name: string; color: string }
): Promise<BackendTag> => {
  const response = await axiosInstance.post<{ data: BackendTag }>(
    `/project/${projectId}/tag`,
    tag
  );

  if (response.status !== 201) {
    throw new Error("Error creating tag.");
  }

  return response.data.data;
};

export const deleteTagService = async (
    projectId: string,
    tagId: string
): Promise<void> => {
  const response = await axiosInstance.delete(
      `/project/${projectId}/tags/${tagId}`
  );

  if (response.status !== 200) {
    throw new Error("Error deleting tag.");
  }
};

export const createProjectFromProvocation = async (body: {
  fromProvocationId: string;
  organizationId: string;
}): Promise<Project> => {
  const response = await axiosInstance.post<{ data: Project }>(
      `/project/from-provocation`,
      body
  );

  if (response.status !== 201 && response.status !== 200) {
    throw new Error( "Error creando proyecto desde provocación");
  }

  return response.data.data;
};

export const getTimelineForProject = async (projectId: string): Promise<BackendTimelineResponse> => {
  const response = await axiosInstance.get<{data: BackendTimelineResponse } >(`/project/${projectId}/timeline`);

  if (response.status !== 200) {
    throw new Error("Error fetching timeline");
  }

  return response.data.data;
};
