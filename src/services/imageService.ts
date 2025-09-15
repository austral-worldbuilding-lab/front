import axiosInstance from "@/lib/axios";

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
  imageId: string
): Promise<void> => {
  try {
    await axiosInstance.post(`/mandala/${mandalaId}/images/confirm`, {
      id: imageId,
    });
  } catch (error) {
    console.error("Error confirming image:", error);
    throw error;
  }
};
