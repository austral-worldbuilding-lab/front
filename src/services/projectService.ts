import { ICON_OPTIONS } from "@/constants/icon-options";
import axiosInstance from "@/lib/axios";
import {BackendTag, CreateProject, CreateProjectFromQuestion, Project, ProjectConfiguration} from "@/types/mandala";
import {BackendTimelineEdge, BackendTimelineNode} from "@/utils/timelineUtils.ts";

export interface CreateMandalaDto {
  name: string;
  projectId: string;
}


export const getProjects = async (organizationId: string, page : number, limit : number, rootsOnly?: boolean): Promise<Project[]> => {
  if (rootsOnly) {
    const response = await axiosInstance.get<{ data: Project[] }>(
        `/project?page=${page}&limit=${limit}&rootOnly=true`
    );

    const allRootProjects = response.data.data;
    return allRootProjects.filter(project =>
        project.organizationId === organizationId
    );
  }
  
  // Endpoint original para todos los proyectos de la organización
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
    data: { name?: string; description?: string, icon: string, iconColor?: string }
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

export const createProjectFromProvocationId = async (body: {
  fromProvocationId: string;
  organizationId: string;
}): Promise<Project> => {
  const response = await axiosInstance.post<{ data: Project }>(
      `/project/from-provocationId`,
      { ...body, icon: ICON_OPTIONS[0] }
  );

  if (response.status !== 201 && response.status !== 200) {
    throw new Error( "Error creando proyecto desde el id de la provocación");
  }

  return response.data.data;
};

export const createProjectFromQuestion = async (
  body: CreateProjectFromQuestion
): Promise<Project> => {
  const response = await axiosInstance.post<{ data: Project }>(
    `/project/from-provocation`,
    body
  );

  if (response.status !== 201 && response.status !== 200) {
    throw new Error("Error creando proyecto desde provocación");
  }

  return response.data.data;
};

export const getTimelineForProject = async (
    projectId: string
): Promise<{ nodes: BackendTimelineNode[]; edges: BackendTimelineEdge[] }> => {
  const response = await axiosInstance.get<{ data: { nodes: BackendTimelineNode[]; edges: BackendTimelineEdge[] } }>(
      `/project/${projectId}/timeline`
  );

  if (response.status !== 200) {
    throw new Error("Error fetching timeline");
  }

  return response.data.data;
};

export const getProjectConfiguration = async (projectId: string): Promise<ProjectConfiguration> => {
  const response = await axiosInstance.get<{ data: ProjectConfiguration }>(`/project/${projectId}/configuration`);

  if (response.status !== 200) {
    throw new Error("Error obteniendo la configuración del proyecto");
  }

  return response.data.data;
};

export const createChildProject = async (
    projectId:string,
    body: {
      name: string;
      description?: string;
      organizationId: string;
      icon?: string;
      dimensions?: { name: string; color: string }[];
      scales?: string[];
      userId: string;
      iconColor?: string;
    }
): Promise<Project> => {
  const response = await axiosInstance.post<{ data: Project }>(`/project/${projectId}/child`,
      { ...body }
  );

  if (response.status !== 201 && response.status !== 200) {
    throw new Error("Error al crear subproyecto");
  }

  return response.data.data;
};

export const deleteProject = async (projectId: string): Promise<void> => {
  const response = await axiosInstance.delete(`/project/${projectId}`);

  if (response.status !== 200) {
    throw new Error("Error al eliminar proyecto");
  }
};
