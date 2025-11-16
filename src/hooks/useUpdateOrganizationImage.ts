import { useState } from "react";
import { addImage, addBannerImage } from "@/services/organizationService";
import { useUploadFilesToS3 } from "./useUploadFilesToS3";

export const useUpdateOrganizationImage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { uploadFileToS3 } = useUploadFilesToS3();

  const updateImage = async (
    organizationId: string,
    imageFile: File,
    presignedUrl: string,
    imageId: string,
    isBanner: boolean = false
  ) => {
    setLoading(true);
    setError(null);
    try {
      const uploadResult = await uploadFileToS3(presignedUrl, imageFile, {
        contentType: imageFile.type,
      });
      
      if (uploadResult.error) {
        setError(uploadResult.error.message);
        return false;
      }
      
      if (isBanner) {
        await addBannerImage(organizationId, imageId);
      } else {
        await addImage(organizationId, imageId);
      }
      
      return true;
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = error?.response?.data?.message ?? error?.message ?? "Error al actualizar la imagen";
      setError(msg);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { updateImage, loading, error };
};

