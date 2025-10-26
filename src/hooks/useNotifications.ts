import { useEffect, useState } from "react";
import { useAuth } from "./useAuth";
import {
  readNotification as readNotificationService,
  subscribeNotifications,
} from "@/services/notificationService";
import { Notification } from "@/types/notification";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  const userId = user?.uid ?? "";

  useEffect(() => {
    if (!userId) {
      return;
    }
    const unsubscribe = subscribeNotifications(userId, (notifications) => {
      setNotifications(notifications);
      const count = notifications.filter(
        (notification) =>
          notification.read === undefined || notification.read === false
      );
      setUnreadCount(count.length);
    });
    return () => {
      unsubscribe();
    };
  }, [userId]);

  const readNotification = async (id: string) => {
    if (!userId) {
      return;
    }
    await readNotificationService(id, userId);
  };

  return { readNotification, notifications, unreadCount };
};
