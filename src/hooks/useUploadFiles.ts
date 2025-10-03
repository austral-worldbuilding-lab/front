import { useRef, useState } from "react";
import axios from "axios";
import { createFiles, FileScope } from "@/services/filesService.ts";
import { useQueryClient } from "@tanstack/react-query";
import { fileKeys } from "./useFiles.ts";
import { FileItem } from "@/types/mandala";

// csv
export type AcceptedTypes =
  | "application/pdf"
  | "text/plain"
  | "image/png"
  | "image/jpeg"
  | "image/webp"
  | "audio/mpeg"
  | "audio/wav"
  | "audio/mp4"
  | "video/mp4"
  | "video/mov"
  | "video/m4v"
  | "video/m4a"
  | "audio/m4a"
  | "audio/mp3"
  | "audio/wav"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "text/csv"
  | "application/json"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  | "application/vnd.openxmlformats-officedocument.presentationml.presentation"
  | "video/quicktime";

//accept xcls, doc, csv, json, ppt, xlsx, docx, pptx
export const ACCEPTED_TYPES: AcceptedTypes[] = [
  "application/pdf",
  "text/plain",
  "image/png",
  "image/jpeg",
  "image/webp",
  "audio/mpeg",
  "audio/wav",
  "audio/mp4",
  "text/csv",
  "video/mp4",
  "video/mov",
  "video/m4v",
  "video/m4a",
  "audio/m4a",
  "audio/mp3",
  "audio/wav",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/json",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "video/quicktime",
];

interface PresignedUrl {
  url: string;
}

export const useUploadFiles = (
  scope: FileScope,
  id: string,
  onUploadComplete?: () => void
) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [status, setStatus] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [videoWarning, setVideoWarning] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const handleFileChange = () => {
    const files = fileInputRef.current?.files;
    if (files) {
      const fileArray: File[] = [];
      for (const file of Array.from(files)) {
        if (file.type.startsWith("video/")) {
          setVideoWarning(
            `Del video seleccionado se utilizará únicamente el audio, el cual será extraido como base de contexto para la IA.`
          );
        }
        fileArray.push(file);
      }
      setSelectedFiles(fileArray);
    }
  };

  const uploadFiles = async () => {
    if (selectedFiles.length === 0) return;

    try {
      setLoading(true);
      setStatus(null);

      const payload: Omit<FileItem, "selected">[] = selectedFiles.map(
        (file) => ({
          file_name: file.name,
          file_type: file.type as AcceptedTypes,
          source_scope: scope,
          id: "",
          full_path: "",
          url: "",
        })
      );

      const urls = await createFiles(scope, id, payload);

      await Promise.all(
        urls.map((urlObj: PresignedUrl, index: number) => {
          return axios.put(urlObj.url, selectedFiles[index], {
            headers: {
              "Content-Type": selectedFiles[index].type,
              "x-ms-blob-type": "BlockBlob",
            },
          });
        })
      );

      setStatus("Archivos cargados exitosamente");
      setSelectedFiles([]);

      queryClient.invalidateQueries({ queryKey: fileKeys.byScope(scope, id) });
      queryClient.invalidateQueries({
        queryKey: [...fileKeys.byScope(scope, id), "with-selection"],
      });

      if (scope === "mandala") {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey.includes("files") &&
            (query.queryKey.includes("project") ||
              query.queryKey.includes("organization")),
        });
      } else if (scope === "project") {
        queryClient.invalidateQueries({
          predicate: (query) =>
            query.queryKey.includes("files") &&
            query.queryKey.includes("organization"),
        });
      }

      if (onUploadComplete) {
        onUploadComplete();
      }
    } catch (error) {
      console.error("Upload error:", error);
      setStatus("Un error ocurrió al cargar los archivos");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  return {
    fileInputRef,
    selectedFiles,
    status,
    loading,
    handleFileChange,
    uploadFiles,
    videoWarning,
    setVideoWarning,
  };
};
