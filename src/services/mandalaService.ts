import { doc, onSnapshot, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  Character,
  FilterSection,
  Mandala,
  MandalaImage,
  Postit,
  Tag,
} from "../types/mandala";
import axiosInstance from "@/lib/axios.ts";

export const subscribeMandala = (
  projectId: string,
  mandalaId: string,
  callback: (mandala: Mandala | null) => void
) => {
  const mandalaRef = doc(db, projectId, mandalaId);
  return onSnapshot(mandalaRef, (snapshot) => {
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
        type: data.mandala?.type || "character",
        configuration: data.mandala?.configuration || {
          dimensions: [],
          scales: [],
        },
        parentId: data.mandala?.parentId || "",
      },
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
      postits: data.postits || [],
      characters: data.characters || [],
      images: data.images || [],
    };

    callback(mandala);
  });
};

type CreatePostItPayload = {
  content: string;
  tags: { name: string; color: string }[];
  parentId?: string;
  dimension?: string;
  section?: string;
  coordinates?: {
    x: number;
    y: number;
    angle: number;
    percentileDistance: number;
  };
};

export const createPostit = async (
  mandalaId: string,
  postit: Postit,
  postitFatherId?: string
): Promise<void> => {
  try {
    const payload: CreatePostItPayload = {
      content: postit.content,
      tags: postit.tags?.map(({ name, color }) => ({ name, color })) || [],
      parentId: postitFatherId ?? undefined,
    };

    if (postit.dimension && postit.section) {
      payload.dimension = postit.dimension;
      payload.section = postit.section;
    } else {
      payload.coordinates = postit.coordinates;
    }

    await axiosInstance.post(`/mandala/${mandalaId}/postits`, payload);
  } catch (error) {
    console.error("Error creating postit:", error);
    throw error;
  }
};

export const updatePostit = async (
  projectId: string,
  mandalaId: string,
  postitId: string,
  updatedData: Partial<Postit>
): Promise<boolean> => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  if (!mandalaSnap.exists()) throw new Error("Mandala not found");

  const data = mandalaSnap.data();
  const postits: Postit[] = data.postits || [];

  const updatedPostits = updatePostItRecursively(
    postits,
    postitId,
    updatedData
  );

  const wasUpdated = JSON.stringify(postits) !== JSON.stringify(updatedPostits);
  if (!wasUpdated) throw new Error("Postit ID not found");

  await updateDoc(mandalaRef, {
    postits: updatedPostits,
    updatedAt: new Date(),
  });

  return true;
};

function updatePostItRecursively(
  postits: Postit[],
  id: string,
  updatedData: Partial<Postit>
): Postit[] {
  return postits.map((p) => {
    if (p.id === id) {
      return { ...p, ...updatedData };
    }

    if (p.childrens && p.childrens.length > 0) {
      return {
        ...p,
        childrens: updatePostItRecursively(p.childrens, id, updatedData),
      };
    }

    return p;
  });
}

export const deletePostit = async (
  projectId: string,
  mandalaId: string,
  postitId: string
): Promise<boolean> => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  if (!mandalaSnap.exists()) throw new Error("Mandala not found");

  const data = mandalaSnap.data();
  const postits: Postit[] = data.postits || [];

  const updatedPostits = removePostItRecursively(postits, postitId);

  const wasDeleted = JSON.stringify(postits) !== JSON.stringify(updatedPostits);
  if (!wasDeleted) throw new Error("Postit ID not found");

  await updateDoc(mandalaRef, {
    postits: updatedPostits,
    updatedAt: new Date(),
  });

  return true;
};

function removePostItRecursively(
  postits: Postit[],
  targetId: string
): Postit[] {
  return postits
    .filter((postit) => postit.id !== targetId)
    .map((postit) => ({
      ...postit,
      childrens: removePostItRecursively(postit.childrens || [], targetId),
    }));
}

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

export const deleteMandalaService = async (mandalaId: string) => {
  const response = await axiosInstance.delete(`/mandala/${mandalaId}`);
  if (response.status !== 200) {
    throw new Error("Error deleting mandala.");
  }
  return response.data;
};

export const generateMandalaSummary = async (mandalaId: string) => {
  const response = await axiosInstance.post(`/mandala/${mandalaId}/summary`);
  if (response.status !== 201) {
    throw new Error("Error generating mandala summary.");
  }
  return response.data;
};

export const updateMandalaCharacters = async (
  projectId: string,
  mandalaId: string,
  updatedCharacters: Character[]
) => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  if (!mandalaSnap.exists()) throw new Error("Mandala not found");

  await updateDoc(mandalaRef, {
    characters: updatedCharacters,
    updatedAt: new Date(),
  });

  return true;
};
export const updatePostItTags = async (
  mandalaId: string,
  postitId: string,
  payload: {
    content: string;
    tags: Tag[];
  }
): Promise<void> => {
  await axiosInstance.patch(
    `/mandala/${mandalaId}/postits/${postitId}`,
    payload
  );
};

export const updateImage = async (
  projectId: string,
  mandalaId: string,
  imageId: string,
  updatedData: Partial<MandalaImage>
): Promise<boolean> => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  if (!mandalaSnap.exists()) throw new Error("Mandala not found");

  const data = mandalaSnap.data();
  const images: MandalaImage[] = data.images || [];

  const updatedImages = images.map((img) => {
    if (img.id === imageId) {
      return { ...img, ...updatedData };
    }
    return img;
  });

  const wasUpdated = JSON.stringify(images) !== JSON.stringify(updatedImages);
  if (!wasUpdated) throw new Error("Image ID not found");

  await updateDoc(mandalaRef, {
    images: updatedImages,
    updatedAt: new Date(),
  });

  return true;
};

export const deleteImage = async (
  projectId: string,
  mandalaId: string,
  imageId: string
): Promise<boolean> => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  if (!mandalaSnap.exists()) throw new Error("Mandala not found");

  const data = mandalaSnap.data();
  const images: MandalaImage[] = data.images || [];

  const updatedImages = images.filter((img) => img.id !== imageId);

  const wasDeleted = JSON.stringify(images) !== JSON.stringify(updatedImages);
  if (!wasDeleted) throw new Error("Image ID not found");

  await updateDoc(mandalaRef, {
    images: updatedImages,
    updatedAt: new Date(),
  });

  return true;
};

export const setEditingUser = async (
  projectId: string,
  mandalaId: string,
  postitId: string,
  userId: string,
  displayName: string
) => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  const mandala = mandalaSnap.data();
  const postits: Postit[] = mandala?.postits || [];
  const postit = postits.find((postit) => postit.id === postitId);

  if (!postit) {
    return;
  }

  if (!postit.editingUsers) {
    await updatePostit(projectId, mandalaId, postitId, {
      editingUsers: [
        {
          id: userId,
          displayName: displayName,
        },
      ],
    });
    return;
  }

  if (postit.editingUsers.some((user) => user.id === userId)) {
    return;
  }

  await updatePostit(projectId, mandalaId, postitId, {
    editingUsers: [
      ...postit.editingUsers,
      {
        id: userId,
        displayName: displayName,
      },
    ],
  });
};

export const updateMandala = async (
  projectId: string,
  mandalaId: string,
  updatedData: { name?: string; description?: string }
): Promise<boolean> => {
  const response = await axiosInstance.patch(`/mandala/${mandalaId}`, updatedData);
  
  if (response.status !== 200) {
    throw new Error("Error updating mandala in backend");
  }

  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  if (!mandalaSnap.exists()) throw new Error("Mandala not found in Firebase");

  const updatePayload: Record<string, unknown> = {};

  if (updatedData.name !== undefined) {
    updatePayload["mandala.name"] = updatedData.name;
  }

  if (updatedData.description !== undefined) {
    updatePayload["mandala.configuration.center.description"] = updatedData.description;
  }

  updatePayload.updatedAt = new Date();

  await updateDoc(mandalaRef, updatePayload);
  
  return true;
};

export const removeEditingUser = async (
  projectId: string,
  mandalaId: string,
  postitId: string,
  userId: string
) => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  const mandala = mandalaSnap.data();
  const postits: Postit[] = mandala?.postits || [];
  const postit = postits.find((postit) => postit.id === postitId);

  if (!postit) {
    return;
  }

  await updatePostit(projectId, mandalaId, postitId, {
    editingUsers: [
      ...(postit.editingUsers?.filter((user) => user.id !== userId) ?? []),
    ],
  });
};
