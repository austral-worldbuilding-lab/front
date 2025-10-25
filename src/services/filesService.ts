import axiosInstance from "@/lib/axios";
import { FileItem } from "@/types/mandala";

export type FileScope = "organization" | "project" | "mandala";
const getBaseUrl = (scope: FileScope, id: string) => `/files/${scope}/${id}`;

export const getFiles = async (
  scope: FileScope,
  id: string
): Promise<FileItem[]> => {
  try {
    const response = await axiosInstance.get<{ data: FileItem[] }>(
      getBaseUrl(scope, id)
    );
    return response.data.data.map((file) => ({
      ...file,
      source_scope:
        file.source_scope === "org" ? "organization" : file.source_scope,
      url: file.url,
    }));
  } catch (error) {
    console.error(`Error fetching ${scope} files:`, error);
    throw error;
  }
};

export const getFilesWithSelection = async (
  scope: FileScope,
  id: string
): Promise<FileItem[]> => {
  try {
    const response = await axiosInstance.get<{ data: FileItem[] }>(
      `${getBaseUrl(scope, id)}/with-selection`
    );
    return response.data.data.map((file) => ({
      ...file,
      source_scope:
        file.source_scope === "org" ? "organization" : file.source_scope,
      url: file.url,
    }));
  } catch (error) {
    console.error(`Error fetching ${scope} files with selection:`, error);
    throw error;
  }
};

export const createFiles = async (
  scope: FileScope,
  id: string,
  files: Omit<FileItem, "selected">[]
): Promise<{ url: string }[]> => {
  try {
    const response = await axiosInstance.post<{ data: { url: string }[] }>(
      getBaseUrl(scope, id),
      files
    );
    return response.data.data;
  } catch (error) {
    console.error(`Error creating ${scope} files:`, error);
    throw error;
  }
};

export const deleteFile = async (
  scope: FileScope,
  id: string,
  fileName: string
): Promise<void> => {
  try {
    await axiosInstance.delete(
      `${getBaseUrl(scope, id)}/${encodeURIComponent(fileName)}`
    );
  } catch (error) {
    console.error(`Error deleting ${scope} file:`, error);
    throw error;
  }
};

export const updateFileSelections = async (
  scope: FileScope,
  id: string,
  selections: { fileName: string; selected: boolean; sourceScope: string }[]
): Promise<void> => {
  try {
    await axiosInstance.patch(`${getBaseUrl(scope, id)}/selection`, {
      selections,
    });
  } catch (error) {
    console.error(`Error updating ${scope} file selections:`, error);
    throw error;
  }
};

export const getSelectedFileNames = async (
  scope: FileScope,
  id: string
): Promise<string[]> => {
  try {
    const files = await getFilesWithSelection(scope, id);
    return files.filter((file) => file.selected).map((file) => file.file_name);
  } catch (error) {
    console.error(`Error getting selected ${scope} file names:`, error);
    throw error;
  }
};

export const createTextFile = async (
  scope: FileScope,
  id: string,
  data: { filename: string; content: string }
): Promise<void> => {
  try {
    await axiosInstance.post(`/${scope}/${id}/text-files`, data);
  } catch (error) {
    console.error(`Error creating text file in ${scope}:`, error);
    throw error;
  }
};
