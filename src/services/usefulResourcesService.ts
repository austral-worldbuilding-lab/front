import axiosInstance from "@/lib/axios";
import { UsefulResource } from "@/types/mandala";

export const getUsefulResources = async (): Promise<UsefulResource[]> => {
  try {
    const response = await axiosInstance.get<{ data: UsefulResource[] }>(
      "/useful-resources"
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching useful resources:", error);
    throw error;
  }
};

