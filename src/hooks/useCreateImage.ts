import { useState } from "react";
import { useParams } from "react-router-dom";
import { useUploadFilesToS3 } from "./useUploadFilesToS3";
import { getImagePresignedUrl, confirmImage } from "@/services/imageService";
import { Tag } from "@/types/mandala";

interface UseCreateImageReturn {
  isUploading: boolean;
  error: string | null;
  uploadImage: (file: File, tags: Tag[]) => Promise<boolean>;
}

export const useCreateImage = (): UseCreateImageReturn => {
  const { mandalaId } = useParams<{ mandalaId: string }>();
  const [error, setError] = useState<string | null>(null);
  const { isUploading, uploadFileToS3 } = useUploadFilesToS3();

  const uploadImage = async (file: File, tags: Tag[]): Promise<boolean> => {
    if (!mandalaId) {
      setError("ID del mandala no encontrado");
      return false;
    }

    console.log("Tags:", tags);

    setError(null);

    try {
      // 1. Get presigned URL
      const { imageId, presignedUrl } = await getImagePresignedUrl(
        mandalaId,
        file.name
      );

      // 2. Upload file to S3
      const uploadResult = await uploadFileToS3(presignedUrl, file, {
        contentType: file.type,
      });

      if (!uploadResult.success) {
        setError("Error al subir la imagen. Por favor, inténtelo de nuevo.");
        return false;
      }

      // 3. Confirm image upload
      await confirmImage(mandalaId, imageId);

      // Success
      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error desconocido al crear la imagen";
      setError(`Error: ${errorMessage}`);
      return false;
    }
  };

  return {
    isUploading,
    error,
    uploadImage,
  };
};
