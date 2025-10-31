/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import {
  addImage,
  createOrganization as createOrgService,
} from "@/services/organizationService";
import { useNavigate } from "react-router-dom";
import { useUploadFilesToS3 } from "./useUploadFilesToS3";

export const useCreateOrganization = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { uploadFileToS3 } = useUploadFilesToS3();

  const createOrganization = async (name: string, icon: File) => {
    setLoading(true);
    setError(null);
    try {
      const response = await createOrgService({ name });
      const result = await uploadFileToS3(response.data.presignedUrl, icon, {
        contentType: icon.type,
      });
      if (result.error) {
        setError(result.error.message);
        return;
      }
      const objectUrl = response.data.imageId;
      await addImage(response.data.id, objectUrl);
      navigate(`/app/organization/${response.data.id}/projects`);
      return response;
    } catch (err: any) {
      const msg = err?.message ?? "Error al crear organización";
      setError(msg);
      throw new Error(msg);
    } finally {
      setLoading(false);
    }
  };

  return { createOrganization, loading, error };
};
