import { useState } from "react";
import { generateMandalaSummary } from "@/services/mandalaService";

export const useGenerateSummary = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSummary = async (mandalaId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      await generateMandalaSummary(mandalaId);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error al generar el resumen";
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    generateSummary,
    loading,
    error,
  };
};
