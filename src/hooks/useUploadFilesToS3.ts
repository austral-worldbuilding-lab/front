import { useState } from "react";
import axios from "axios";

interface UploadOptions {
  contentType: string;
  extraHeaders?: Record<string, string>;
}

interface UploadResult {
  success: boolean;
  error?: Error;
}

export const useUploadFilesToS3 = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadFileToS3 = async (
    presignedUrl: string,
    file: File,
    options: UploadOptions
  ): Promise<UploadResult> => {
    try {
      setIsUploading(true);
      console.log("Uploading file to S3:", file.name);

      await axios.put(presignedUrl, file, {
        headers: {
          "Content-Type": options.contentType,
          "x-ms-blob-type": "BlockBlob",
          ...options.extraHeaders,
        },
      });

      return { success: true };
    } catch (error) {
      console.error("Error uploading file to S3:", error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error
            : new Error("Unknown error during upload"),
      };
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isUploading,
    uploadFileToS3,
  };
};
