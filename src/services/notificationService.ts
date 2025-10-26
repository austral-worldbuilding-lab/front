import { db } from "@/config/firebase";
import { Notification } from "@/types/notification";
import { collection, doc, onSnapshot, updateDoc } from "firebase/firestore";

export const readNotification = async (id: string, userId: string) => {
  const notificationRef = doc(db, "users", userId, "notifications", id);
  await updateDoc(notificationRef, { read: true });
};

export const subscribeNotifications = (
  userId: string,
  callback: (notifications: Notification[]) => void
) => {
  const notificationsRef = collection(db, "users", userId, "notifications");
  return onSnapshot(notificationsRef, (snapshot) => {
    const notifications: Notification[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Notification, "id">),
    }));
    callback(notifications.reverse());
  });
};
