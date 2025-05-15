import { useEffect, useState, useCallback } from "react";
import { Mandala, Postit } from "../types/mandala";
import {
  subscribeMandala,
  createPostit as createPostitService,
  updatePostit as updatePostitService,
  deletePostit as deletePostitService,
} from "../services/mandalaService";

const useMandala = (mandalaId: string) => {
  const [mandala, setMandala] = useState<Mandala | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeMandala(mandalaId, (data) => {
      setMandala(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [mandalaId]);

  const createPostit = useCallback(
    async (postitData: Omit<Postit, "id" | "createdAt" | "updatedAt">) => {
      try {
        if (!mandalaId) throw new Error("Mandala ID is required");
        return await createPostitService(mandalaId, postitData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        throw err;
      }
    },
    [mandalaId]
  );

  const updatePostit = useCallback(
    async (
      postitId: string,
      postitData: Partial<Omit<Postit, "id" | "createdAt" | "updatedAt">>
    ) => {
      try {
        if (!mandalaId) throw new Error("Mandala ID is required");
        return await updatePostitService(mandalaId, postitId, postitData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        throw err;
      }
    },
    [mandalaId]
  );

  const deletePostit = useCallback(
    async (postitId: string) => {
      try {
        if (!mandalaId) throw new Error("Mandala ID is required");
        return await deletePostitService(mandalaId, postitId);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        throw err;
      }
    },
    [mandalaId]
  );

  return {
    mandala,
    loading,
    error,
    createPostit,
    updatePostit,
    deletePostit,
  };
};

export default useMandala;
