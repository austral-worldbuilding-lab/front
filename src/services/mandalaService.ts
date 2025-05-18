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
import { Mandala, Postit, PostitDocument } from "../types/mandala";

const COLLECTION_NAME = "test-mandalas";

type Category = keyof Omit<Mandala, "id" | "name">;

export const subscribeMandala = (
  mandalaId: string,
  callback: (mandala: Mandala | null) => void
) => {
  let unsubscribes: (() => void)[] = [];

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
      resources: [],
      infrastructure: [],
    };

    // Clean up previous subscriptions
    unsubscribes.forEach(unsubscribe => unsubscribe());
    unsubscribes = [];

    // Subscribe to each category's postits
    const categories: Category[] = ["ecology", "economy", "governance", "culture", "resources", "infrastructure"];
    categories.forEach(category => {
      const categoryRef = collection(db, COLLECTION_NAME, mandalaId, category);
      const unsubscribe = onSnapshot(categoryRef, (snapshot) => {
        const postits = snapshot.docs.map(doc => ({
          ...doc.data(),
          id: doc.id,
          category
        })) as PostitDocument[];

        mandala[category] = postits;
        callback({ ...mandala });
      });
      unsubscribes.push(unsubscribe);
    });
  });

  // Return cleanup function
  return () => {
    unsubscribeMandala();
    unsubscribes.forEach(unsubscribe => unsubscribe());
  };
};

export const createPostit = async (
  mandalaId: string,
  postit: Postit
) => {
  try {
    const category = postit.category as Category;
    const postitRef = collection(db, COLLECTION_NAME, mandalaId, category);

    const newPostitRef = await addDoc(postitRef, postit);
    return { ...postit, id: newPostitRef.id } as PostitDocument;
  } catch (error) {
    console.error("Error creating postit:", error);
    throw error;
  }
};

export const updatePostit = async (
  mandalaId: string,
  postitId: string,
  postitData: Partial<Postit>
) => {
  try {
    const category = postitData.category as Category;
    if (!category) {
      throw new Error("Category is required for updating postit");
    }

    // First, try to find the postit in any category
    const categories: Category[] = ["ecology", "economy", "governance", "culture", "resources", "infrastructure"];
    let foundCategory: Category | null = null;
    let oldData: any = null;

    for (const cat of categories) {
      const postitRef = doc(db, COLLECTION_NAME, mandalaId, cat, postitId);
      const postitDoc = await getDoc(postitRef);
      if (postitDoc.exists()) {
        foundCategory = cat;
        oldData = postitDoc.data();
        break;
      }
    }

    if (!foundCategory) {
      throw new Error("Postit not found in any category");
    }

    // If the category hasn't changed, just update the document
    if (foundCategory === category) {
      const { id, ...dataToUpdate } = postitData as any;
      const postitRef = doc(db, COLLECTION_NAME, mandalaId, category, postitId);
      await updateDoc(postitRef, dataToUpdate);
      return true;
    }

    // If the category has changed, move the document
    const newPostitRef = collection(db, COLLECTION_NAME, mandalaId, category);
    const { id, ...oldDataWithoutId } = oldData;
    const newPostitData = {
      ...oldDataWithoutId,
      ...postitData,
    };
    await addDoc(newPostitRef, newPostitData);

    // Delete the old document
    const oldPostitRef = doc(db, COLLECTION_NAME, mandalaId, foundCategory, postitId);
    await deleteDoc(oldPostitRef);

    return true;
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
