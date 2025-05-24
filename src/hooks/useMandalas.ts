import { useEffect, useState } from "react";
import {SimpleMandala} from "../types/mandala";
import axiosInstance from "@/lib/axios";


const useMandalas = (projectId: string) => {
  const [mandalas, setMandalas] = useState<SimpleMandala[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchMandalas = async () => {
      if (!projectId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await axiosInstance.get<{ data: SimpleMandala[] }>('/mandala', {
          params: { projectId }
        });

        setMandalas(response.data.data);
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

    fetchMandalas();
  }, [projectId]);

  return {
    mandalas,
    loading,
    error,
  };
};

export default useMandalas; 