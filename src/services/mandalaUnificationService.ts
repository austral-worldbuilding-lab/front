import axiosInstance from "@/lib/axios";
import axios from "axios";

interface MandalaUnificationResponse {
  data: {
    id: string;
    message: string;
  };
}

/**
 * Unifica múltiples mandalas en una nueva
 * @param mandalaIds - Array de IDs de mandalas para unificar
 * @returns ID de la nueva mandala unificada
 */
export const unifyMandalasService = async (
  mandalaIds: string[]
): Promise<string> => {
  try {
    if (mandalaIds.length < 2) {
      throw new Error("Se requieren al menos 2 mandalas para unificar");
    }

    const response = await axiosInstance.post<MandalaUnificationResponse>(
      "/mandala/unify",
      { mandalaIds }
    );

    if (response.status !== 201) {
      throw new Error("Error al unificar las mandalas");
    }

    return response.data.data.id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg =
        error.response?.data?.message || "Error al unificar las mandalas";
      throw new Error(errorMsg);
    }
    throw error;
  }
};
