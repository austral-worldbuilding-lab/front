import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Mandala, Postit } from "../types/mandala";

const COLLECTION_NAME = "mandalas";

export const subscribeMandala = (
  mandalaId: string,
  callback: (mandala: Mandala | null) => void
) => {
  // Mock implementation - will be replaced with real Firebase implementation
  const unsubscribe = onSnapshot(
    doc(db, COLLECTION_NAME, mandalaId),
    (snapshot) => {
      if (snapshot.exists()) {
        // Mock data transformation
        callback({
          ...snapshot.data(),
          id: snapshot.id,
          createdAt: snapshot.data().createdAt?.toDate(),
          updatedAt: snapshot.data().updatedAt?.toDate(),
        } as Mandala);
      } else {
        callback(null);
      }
    },
    (error) => {
      console.error("Error getting mandala:", error);
      callback(null);
    }
  );

  return unsubscribe;
};

export const createPostit = async (
  mandalaId: string,
  postit: Omit<Postit, "id" | "createdAt" | "updatedAt">
) => {
  // Mock implementation
  try {
    const mandalaRef = doc(db, COLLECTION_NAME, mandalaId);
    const postitRef = collection(mandalaRef, "postits");

    // This is just a mock, in a real implementation you'd add the doc to Firestore
    // and then update the mandala document to include the new postit
    const newPostitRef = await addDoc(postitRef, {
      ...postit,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    return { ...postit, id: newPostitRef.id };
  } catch (error) {
    console.error("Error creating postit:", error);
    throw error;
  }
};

export const updatePostit = async (
  mandalaId: string,
  postitId: string,
  postitData: Partial<Omit<Postit, "id" | "createdAt" | "updatedAt">>
) => {
  // Mock implementation
  try {
    const postitRef = doc(db, COLLECTION_NAME, mandalaId, "postits", postitId);

    await updateDoc(postitRef, {
      ...postitData,
      updatedAt: new Date(),
    });

    return true;
  } catch (error) {
    console.error("Error updating postit:", error);
    throw error;
  }
};

export const deletePostit = async (mandalaId: string, postitId: string) => {
  // Mock implementation
  try {
    const postitRef = doc(db, COLLECTION_NAME, mandalaId, "postits", postitId);
    await deleteDoc(postitRef);
    return true;
  } catch (error) {
    console.error("Error deleting postit:", error);
    throw error;
  }
};
