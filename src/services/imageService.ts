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
