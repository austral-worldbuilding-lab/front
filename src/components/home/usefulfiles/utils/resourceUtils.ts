import { UsefulResource } from "@/types/mandala";

export const downloadFile = async (resource: UsefulResource): Promise<void> => {
  try {
    const response = await fetch(resource.url);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = resource.file_name;
    link.click();
    window.URL.revokeObjectURL(link.href);
  } catch (err) {
    console.error("Error downloading file:", err);
    throw err;
  }
};

export const openLink = (url: string): void => {
  window.open(url, "_blank", "noopener,noreferrer");
};

