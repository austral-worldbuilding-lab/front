import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { unifyMandalasService } from "../services/mandalaUnificationService";

interface UseMandalaUnificationResult {
  unifyMandalas: (
    mandalaIds: string[],
    organizationId: string,
    projectId: string,
    name?: string
  ) => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const useMandalaUnification = (): UseMandalaUnificationResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  /**
   * Unifica varias mandalas y redirige a la nueva mandala unificada
   * @param mandalaIds - Array de IDs de mandalas a unificar
   * @param organizationId - ID de la organización
   * @param projectId - ID del proyecto
   */
  const unifyMandalas = async (
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
        throw new Error("Se requieren al menos 2 mandalas para unificar");
      }

      // Llamar al servicio de unificación
      const unifiedMandalaId = await unifyMandalasService(mandalaIds, name);

      // Redirigir a la nueva mandala unificada
      navigate(
        `/app/organization/${organizationId}/projects/${projectId}/mandala/${unifiedMandalaId}`
      );
    } catch (err) {
      console.error("Error al unificar mandalas:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Error desconocido al unificar mandalas"
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    unifyMandalas,
    loading,
    error,
  };
};
