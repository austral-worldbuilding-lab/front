import axiosInstance from "@/lib/axios";
import {Organization} from "@/types/mandala";


export const getOrganizations = async (page: number, limit: number): Promise<Organization[]> => {
    const response = await axiosInstance.get<{ data: Organization[] }>(
        `/organization?page=${page}&limit=${limit}`
    );

    if (response.status !== 200) {
        throw new Error("Error al cargar organizaciones");
    }

    return response.data.data;
};

export const createOrganization = async ({ name }: { name: string }) => {
  const response = await axiosInstance.post("/organization", { name });
  return response.data;
};

export const getOrganizationById = async (id: string): Promise<Organization> => {
    const response = await axiosInstance.get<{data: Organization}>(`/organization/${id}`);
    if (response.status !== 200) {
        throw new Error("Error al cargar organización");
    }
    return response.data.data;
};

export const deleteOrganization = async (id: string): Promise<void> => {
    const response = await axiosInstance.delete(`/organization/${id}`);
    if (response.status !== 200) {
        throw new Error("Error al eliminar organización");
    }
};

export const addImage = async (id: string, imageId: string): Promise<void> => {
  const response = await axiosInstance.post(
    `/organization/${id}/image/confirm`,
    {
      imageId,
      imageType: 'profilePicture',
    }
  );
  if (response.status !== 201) {
    throw new Error("Error al agregar la imagen");
  }
};

export interface OrganizationWithPresignedUrl extends Organization {
  profilePicture: {
    imageId: string;
    presignedUrl: string;
  };
  bannerPicture: {
    imageId: string;
    presignedUrl: string;
  };
}

export const updateOrganization = async (
  id: string,
  data: { name?: string }
): Promise<OrganizationWithPresignedUrl> => {
  const response = await axiosInstance.patch<{ data: OrganizationWithPresignedUrl }>(
    `/organization/${id}`,
    data
  );

  if (response.status !== 200) {
    throw new Error(response.statusText || "Error actualizando organización.");
  }

  return response.data.data;
};

export const addBannerImage = async (id: string, bannerImageId: string): Promise<void> => {
  const response = await axiosInstance.post(
    `/organization/${id}/image/confirm`,
    {
      imageId: bannerImageId,
      imageType: 'bannerPicture',
    }
  );
  if (response.status !== 201) {
    throw new Error("Error al agregar la imagen de banner");
  }
};
