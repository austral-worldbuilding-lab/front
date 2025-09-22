import { useEffect, useState, useCallback } from "react";
import { Character, Mandala, MandalaImage, Postit } from "../types/mandala";
import {
  subscribeMandala,
  createPostit as createPostitService,
  updatePostit as updatePostitService,
  deletePostit as deletePostitService,
  updateCharacter as updateCharacterService, 
  updateMandalaCharacters,
  updateImage as updateImageService,
  deleteImage as deleteImageService,
  setEditingUser as setEditingUserService,
  removeEditingUser as removeEditingUserService,
} from "../services/mandalaService";
import { useParams } from "react-router-dom";
import { useAuth } from "./useAuth";

const useMandala = (mandalaId: string) => {
  const [mandala, setMandala] = useState<Mandala | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const { user } = useAuth();

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Return early if mandalaId is empty to avoid Firebase errors
    if (!mandalaId || mandalaId.trim() === '') {
      setMandala(null);
      setLoading(false);
      return;
    }

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
        return await createPostitService(mandalaId, postitData, postitFatherId);
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
    async (id: string, postitData: Partial<Postit>) => {
      try {
        return await updatePostitService(projectId!, mandalaId, id, postitData);
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

  const deleteCharacter = useCallback(
    async (index: number) => {
      try {
        const updatedCharacters = [...(mandala?.characters ?? [])];
        updatedCharacters.splice(index, 1);
        await updateMandalaCharacters(projectId!, mandalaId, updatedCharacters);
        setMandala((prev) =>
          prev ? { ...prev, characters: updatedCharacters } : prev
        );
        return true;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Unknown error occurred"));
        return false;
      }
    },
    [mandala?.characters, mandalaId, projectId]
  );

  const updateImage = useCallback(
    async (id: string, imageData: Partial<MandalaImage>) => {
      try {
        return await updateImageService(projectId!, mandalaId, id, imageData);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        throw err;
      }
    },
    [mandalaId, projectId]
  );

  const deleteImage = useCallback(
    async (id: string) => {
      try {
        return await deleteImageService(projectId!, mandalaId, id);
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Unknown error occurred")
        );
        throw err;
      }
    },
    [mandalaId, projectId]
  );

  const setEditingUser = async (postitId: string) => {
    await setEditingUserService(
      projectId!,
      mandalaId,
      postitId,
      user!.uid,
      user?.displayName ?? user?.email?.split("@")[0] ?? "Anonymous User"
    );
  };

  const removeEditingUser = async (postitId: string) => {
    removeEditingUserService(projectId!, mandalaId, postitId, user!.uid);
  };

  return {
    mandala,
    loading,
    error,
    createPostit,
    updatePostit,
    deletePostit,
    updateCharacter,
    deleteCharacter,
    updateImage,
    deleteImage,
    setEditingUser,
    removeEditingUser,
  };
};

export default useMandala;
