import { useEffect, useState, useCallback } from "react";
import { Character, Mandala, Postit } from "../types/mandala";
import {
  subscribeMandala,
  createPostit as createPostitService,
  updatePostit as updatePostitService,
  deletePostit as deletePostitService,
  updateCharacter as updateCharacterService,
} from "../services/mandalaService";
import { useParams } from "react-router-dom";

const useMandala = (mandalaId: string) => {
  const [mandala, setMandala] = useState<Mandala | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { projectId } = useParams<{ projectId: string }>();

  useEffect(() => {
    setLoading(true);
    setError(null);

    const unsubscribe = subscribeMandala(
      projectId!,
      mandalaId,
      (data: Mandala | null) => {
        setMandala(data);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [mandalaId, projectId]);

  const createPostit = useCallback(
    async (postitData: Postit, postitFatherId?: string) => {
      try {
        if (!mandalaId) throw new Error("Mandala ID is required");
        return await createPostitService(
          mandalaId,
          postitData,
          postitFatherId
        );
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
    async (index: number, postitData: Partial<Postit>) => {
      try {
        return await updatePostitService(
          projectId!,
          mandalaId,
          index,
          postitData
        );
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        throw err;
      }
    },
    [mandalaId, projectId]
  );

  const deletePostit = useCallback(
    async (id: string) => {
      try {
        return await deletePostitService(projectId!, mandalaId, id);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        throw err;
      }
    },
    [mandalaId, projectId]
  );

  const updateCharacter = useCallback(
    async (index: number, characterData: Partial<Character>) => {
      try {
        return await updateCharacterService(
          projectId!,
          mandalaId,
          index,
          characterData
        );
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        throw err;
      }
    },
    [mandalaId, projectId]
  );

  return {
    mandala,
    loading,
    error,
    createPostit,
    updatePostit,
    deletePostit,
    updateCharacter,
  };
};

export default useMandala;
