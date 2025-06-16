import { useEffect, useState } from "react";
import { SimpleMandala } from "../types/mandala";
import { getMandalas } from "@/services/projectService.ts";

const useMandalas = (projectId: string, page: number, limit: number) => {
  const [mandalas, setMandalas] = useState<SimpleMandala[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // Declarar la función fuera del useEffect
  const fetchMandalas = async () => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const mandalasData = await getMandalas(projectId, page, limit);

      setMandalas(mandalasData);
    } catch (err) {
      console.error("Error fetching mandalas:", err);
      setError(
          err instanceof Error
              ? err
              : new Error("Error al cargar las mandalas")
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMandalas();
  }, [projectId, page, limit]);

  return {
    mandalas,
    loading,
    error,
    refetch: fetchMandalas,
  };
};

export default useMandalas;
