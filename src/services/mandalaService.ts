import {
  doc,
  onSnapshot,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Mandala, Postit } from "../types/mandala";

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
      name: data.name || "",
      projectId: data.projectId,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      postits: data.postits || [],
      characters: data.characters || [],
    };

    callback(mandala);
  });

  return unsubscribe;
};

export const createPostit = async (
  projectId: string,
  mandalaId: string,
  postit: Postit
): Promise<void> => {
  const mandalaRef = doc(db, projectId, mandalaId);
  const mandalaSnap = await getDoc(mandalaRef);
  if (!mandalaSnap.exists()) throw new Error("Mandala not found");

  const data = mandalaSnap.data();
  const updatedPostits = [...(data.postits || []), postit];

  await updateDoc(mandalaRef, {
    postits: updatedPostits,
    updatedAt: new Date(),
  });
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
