import axiosInstance from "@/lib/axios";
import axios from "axios";

interface MandalaComparisonResponse {
  data: {
    id: string;
  };
}

/**
 * Compara múltiples mandalas en una nueva
 * @param mandalaIds - Array de IDs de mandalas para comparar
 * @param name - Nombre para la mandala unificada
 * @returns ID de la nueva mandala unificada
 */
export const compareMandalasService = async (
  mandalaIds: string[],
  name: string = "Mandala comparada"
): Promise<string> => {
  try {
    if (mandalaIds.length < 2) {
      throw new Error("Se requieren al menos 2 mandalas para comparar");
    }

    const response = await axiosInstance.post<MandalaComparisonResponse>(
      "/mandala/overlap/summary",
      { mandalas: mandalaIds, color: "#8c8c8c", name }
    );

    if (response.status !== 201) {
      throw new Error("Error al comparar las mandalas");
    }
    return response.data.data.id;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const errorMsg =
        error.response?.data?.message || "Error al comparar las mandalas";
      throw new Error(errorMsg);
    }
    throw error;
  }
};
