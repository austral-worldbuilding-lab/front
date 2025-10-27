import axiosInstance from "@/lib/axios";
import { Tag } from "@/types/mandala";

export interface GetPresignedUrlResponse {
  imageId: string;
  presignedUrl: string;
}

export interface ConfirmImageRequest {
  id: string;
}

export const getImagePresignedUrl = async (
  mandalaId: string,
  fileName: string
): Promise<GetPresignedUrlResponse> => {
  try {
    const response = await axiosInstance.post<{
      data: GetPresignedUrlResponse;
    }>(`/mandala/${mandalaId}/images/presigned-url`, { fileName });
    return response.data.data;
  } catch (error) {
    console.error("Error getting presigned URL:", error);
    throw error;
  }
};

export const confirmImage = async (
  mandalaId: string,
  imageId: string,
  tags?: Tag[]
): Promise<void> => {
  try {
    await axiosInstance.post(`/mandala/${mandalaId}/images/confirm`, {
      id: imageId,
      tags: tags?.map(tag => ({ name: tag.name, color: tag.color })) || [],
    });
  } catch (error) {
    console.error("Error confirming image:", error);
    throw error;
  }
};

export async function generateImagesService(mandalaId: string, payload: any): Promise<string[]> {
  const res = await axiosInstance.post<{ data: { id: string; url: string }[] }>(
      `/mandala/${mandalaId}/generate-images`,
      payload
  );
  return res.data.data?.map(img => img.url) ?? [];
}

export async function getCachedImagesService(mandalaId: string): Promise<string[]> {
  const res = await axiosInstance.get<{ data: { id: string; url: string }[] }>(
      `/mandala/${mandalaId}/cached-images`
  );
  return res.data.data?.map(img => img.url) ?? [];
}
