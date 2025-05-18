import {
  collection,
  doc,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { Mandala, Postit } from "../types/mandala";

const COLLECTION_NAME = "test-mandalas";

type Category = keyof Omit<Mandala, "id" | "name">;

export const subscribeMandala = (
  mandalaId: string,
  callback: (mandala: Mandala | null) => void
) => {
  // Subscribe to mandala metadata
  const mandalaRef = doc(db, COLLECTION_NAME, mandalaId);
  const unsubscribeMandala = onSnapshot(mandalaRef, (snapshot) => {
    if (!snapshot.exists()) {
      callback(null);
      return;
    }

    const data = snapshot.data();
    const mandala: Mandala = {
      id: snapshot.id,
      name: data.name || "",
      ecology: [],
      economy: [],
      governance: [],
      culture: [],
      infrastructure: [],
      resources: [],
    };

    // Subscribe to each category's postits
    const categories: Category[] = ["ecology", "economy", "governance", "culture", "infrastructure", "resources"];
    const unsubscribes = categories.map(category => {
      const categoryRef = collection(db, COLLECTION_NAME, mandalaId, category);
      return onSnapshot(categoryRef, (snapshot) => {
        const postits = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
        })) as Postit[];

        mandala[category] = postits;
        callback({ ...mandala });
      });
    });

    return () => {
      unsubscribes.forEach(unsubscribe => unsubscribe());
    };
  });

  return () => {
    unsubscribeMandala();
  };
};

export const createPostit = async (
  mandalaId: string,
  postit: Omit<Postit, "id">
) => {
  try {
    const category = postit.category as Category;
    const postitRef = collection(db, COLLECTION_NAME, mandalaId, category);

    const newPostitRef = await addDoc(postitRef, postit);
    return { ...postit, id: newPostitRef.id };
  } catch (error) {
    console.error("Error creating postit:", error);
    throw error;
  }
};

export const updatePostit = async (
  mandalaId: string,
  postitId: string,
  postitData: Partial<Omit<Postit, "id">>
) => {
  try {
    const category = postitData.category as Category;
    if (!category) {
      throw new Error("Category is required for updating postit");
    }

    // Try to update in the new category first
    const postitRef = doc(db, COLLECTION_NAME, mandalaId, category, postitId);
    try {
      await updateDoc(postitRef, postitData);
      return true;
    } catch (error) {
      // If update fails, the document might be in a different category
      // Try to find it in other categories
      const categories: Category[] = ["ecology", "economy", "governance", "culture", "resources", "infrastructure"];
      for (const oldCategory of categories) {
        if (oldCategory === category) continue;

        const oldPostitRef = doc(db, COLLECTION_NAME, mandalaId, oldCategory, postitId);
        const oldPostitDoc = await getDoc(oldPostitRef);

        if (oldPostitDoc.exists()) {
          // Found it! Move it to the new category
          const newPostitRef = collection(db, COLLECTION_NAME, mandalaId, category);
          const newPostitData = {
            ...oldPostitDoc.data(),
            ...postitData,
            id: postitId
          };
          await addDoc(newPostitRef, newPostitData);
          await deleteDoc(oldPostitRef);
          return true;
        }
      }
      throw new Error("Postit not found in any category");
    }
  } catch (error) {
    console.error("Error updating postit:", error);
    throw error;
  }
};

export const deletePostit = async (
  mandalaId: string,
  postitId: string,
  category: Category
) => {
  try {
    const postitRef = doc(db, COLLECTION_NAME, mandalaId, category, postitId);
    await deleteDoc(postitRef);
    return true;
  } catch (error) {
    console.error("Error deleting postit:", error);
    throw error;
  }
};
