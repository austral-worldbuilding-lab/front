import { useRef, useState } from 'react';
import axios from 'axios';
import { createProjectFiles } from '@/services/filesService';
import { useQueryClient } from '@tanstack/react-query';
import { fileKeys } from './useProjectFiles';

export const ACCEPTED_TYPES = [
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
];

interface ProjectFile {
  file_name: string;
  file_type: string;
}

interface PresignedUrl {
  url: string;
}

export const useUploadFiles = (projectId: string, onUploadComplete?: () => void) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = () => {
    const files = fileInputRef.current?.files;
    if (files) {
      const fileArray = Array.from(files).filter((file) =>
        ACCEPTED_TYPES.includes(file.type)
      );
      setSelectedFiles(fileArray);
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setLoading(true);
      setStatus(null);

      const payload: ProjectFile[] = selectedFiles.map((file) => ({
        file_name: file.name,
        file_type: file.type,
      }));

      const urls = await createProjectFiles(projectId, payload);

      await Promise.all(
        urls.map((urlObj: PresignedUrl, index: number) => {
          return axios.put(urlObj.url, selectedFiles[index], {
            headers: {
              'Content-Type': selectedFiles[index].type,
              'x-ms-blob-type': 'BlockBlob',
            },
          });
        })
      );

      setStatus('Files uploaded successfully!');
      setSelectedFiles([]);
      
      queryClient.invalidateQueries({ queryKey: fileKeys.byProject(projectId) });
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('An error occurred during upload.');
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return {
    fileInputRef,
    selectedFiles,
    status,
    loading,
    handleFileChange,
    uploadFiles,
  };
};
