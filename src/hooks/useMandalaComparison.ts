import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { compareMandalasService } from "@/services/mandalaComparisonService";

interface UseMandalaComparisonResult {
  compareMandalas: (
    mandalaIds: string[],
    organizationId: string,
    projectId: string,
    name?: string
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useMandalaComparison = (): UseMandalaComparisonResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Compara varias mandalas y redirige a la nueva mandala comparada
   * @param mandalaIds - Array de IDs de mandalas a comparar
   * @param organizationId - ID de la organización
   * @param projectId - ID del proyecto
   */
  const compareMandalas = async (
    mandalaIds: string[],
    organizationId: string,
    projectId: string,
    name?: string
  ): Promise<void> => {
    setLoading(true);
    setError(null);

    try {
      // Validación básica
      if (mandalaIds.length < 2) {
        throw new Error("Se requieren al menos 2 mandalas para comparar");
      }

      // Llamar al servicio de comparación
      const comparedMandalaId = await compareMandalasService(mandalaIds, name);

      // Redirigir a la nueva mandala comparada
      navigate(
        `/app/organization/${organizationId}/projects/${projectId}/mandala/${comparedMandalaId}`
      );
    } catch (err) {
      console.error("Error al comparar mandalas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al comparar mandalas"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    compareMandalas,
    loading,
    error,
  };
};
