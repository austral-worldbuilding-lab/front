import { useRef, useState } from 'react';
import axios from 'axios';
import {createFiles, FileScope} from '@/services/filesService.ts';
import { useQueryClient } from '@tanstack/react-query';
import { fileKeys } from './useFiles.ts';
import {FileItem} from "@/types/mandala";

export const ACCEPTED_TYPES = [
  'application/pdf',
  'text/plain',
  'image/png',
  'image/jpeg',
];


interface PresignedUrl {
  url: string;
}

export const useUploadFiles = (scope: FileScope, id: string, onUploadComplete?: () => void) => {
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

      const payload: FileItem[] = selectedFiles.map((file) => ({
        file_name: file.name,
        file_type: file.type,
        source_scope: scope,
        id: '',
        full_path: '',
      }));

      const urls = await createFiles(scope, id, payload);

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

      setStatus('Archivos cargados exitosamente');
      setSelectedFiles([]);
      
      queryClient.invalidateQueries({ queryKey: fileKeys.byScope(scope, id) });
      
      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error('Upload error:', error);
      setStatus('Un error ocurrió al cargar los archivos');
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
