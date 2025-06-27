import { doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import { Character, FilterSection, Mandala, Postit } from "../types/mandala";
import axiosInstance from "@/lib/axios.ts";

export const subscribeMandala = (
  projectId: string,
  mandalaId: string,
  callback: (mandala: Mandala | null) => void
) => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const unsubscribe = onSnapshot(mandalaRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const data = snapshot.data();

    const mandala: Mandala = {
      id: snapshot.id,
      mandala: {
        id: data.mandala?.id || "",
        name: data.mandala?.name || "",
        configuration: data.mandala?.configuration || {
          dimensions: [],
          scales: [],
        },
        parentId: data.mandala?.parentId || "",
      },
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
      postits: data.postits || [],
      characters: data.characters || [],
    };

    callback(mandala);
  });

  return unsubscribe;
};

  export const createPostit = async (
      mandalaId: string,
      postit: Postit,
      postitFatherId?: string
  ): Promise<void> => {
    try {
      const payload = {
        content: postit.content,
        dimension: postit.dimension,
        section: postit.section,
        coordinates: postit.coordinates,
        tags: postit.tags?.map(({ name, color }) => ({ name, color })) || [],
        parentId: postitFatherId ?? undefined,
      };

      await axiosInstance.post(`/mandala/${mandalaId}/postits`, payload);
    } catch (error) {
      console.error("Error creating postit:", error);
      throw error;
    }
  };

export const updatePostit = async (
  projectId: string,
  mandalaId: string,
  index: number,
  updatedData: Partial<Postit>
) => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  if (!mandalaSnap.exists()) throw new Error("Mandala not found");

  const data = mandalaSnap.data();
  const postits = data.postits || [];

  if (index < 0 || index >= postits.length) {
    throw new Error("Invalid postit index");
  }

  const updatedPostits = [...postits];
  updatedPostits[index] = { ...updatedPostits[index], ...updatedData };

  await updateDoc(mandalaRef, {
    postits: updatedPostits,
    updatedAt: new Date(),
  });

  return true;
};

export const deletePostit = async (
  projectId: string,
  mandalaId: string,
  index: number
) => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  if (!mandalaSnap.exists()) throw new Error("Mandala not found");

  const data = mandalaSnap.data();
  const postits = data.postits || [];

  if (index < 0 || index >= postits.length) {
    throw new Error("Invalid postit index");
  }

  const updatedPostits = postits.filter((_: Postit, i: number) => i !== index);

  await updateDoc(mandalaRef, {
    postits: updatedPostits,
    updatedAt: new Date(),
  });

  return true;
};

export const updateCharacter = async (
  projectId: string,
  mandalaId: string,
  index: number,
  updatedData: Partial<Character>
) => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  if (!mandalaSnap.exists()) throw new Error("Mandala not found");

  const data = mandalaSnap.data();
  const characters = data.characters || [];

  if (index < 0 || index >= characters.length) {
    throw new Error("Invalid character index");
  }

  const updatedCharacters = [...characters];
  updatedCharacters[index] = { ...updatedCharacters[index], ...updatedData };

  await updateDoc(mandalaRef, {
    characters: updatedCharacters,
    updatedAt: new Date(),
  });
};

export const getFilters = async (mandalaId: string) => {
  const response = await axiosInstance.get<{ data: FilterSection[] }>(
    `/mandala/filter-options?id=${mandalaId}`
  );

  if (response.status !== 200) {
    throw new Error("Error fetching filters.");
  }

  return response.data.data;
};


export const fetchAvailableCharacters = async (
    mandalaId: string
): Promise<
    {
      id: string;
      name: string;
      color: string;
    }[]
> => {
  const res = await axiosInstance.get<{
    data: {
      id: string;
      name: string;
      color: string;
    }[];
  }>(`/mandala/${mandalaId}/characters`);

  return res.data.data;
};

export async function linkMandalaToParent(mandalaId: string, childId: string) {
  return axiosInstance.post(`/mandala/${mandalaId}/link/${childId}`);
}
