"use client";

import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useNotifications } from "@/hooks/useNotifications";
import { cn } from "@/lib/utils";
import { Notification } from "@/types/notification";
import { useNavigate } from "react-router-dom";

export const NotificationBell = () => {
  const { notifications, unreadCount, readNotification } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (notification: Notification) => {
    readNotification(notification.id);
    if (notification.url) {
      navigate(notification.url);
    }
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover>
            <PopoverTrigger asChild>
              <div className="relative">
                <Button variant="ghost" aria-label="Notificaciones">
                  <Bell className="h-5 w-5" />
                </Button>
                {unreadCount > 0 && (
                  <span
                    className={cn(
                      "absolute text-[10px] font-medium bg-red-500 text-white rounded-full px-[7.5px] py-0.5",
                      "bottom-0 right-0  shadow-sm"
                    )}
                  >
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
            </PopoverTrigger>

            <PopoverContent
              className="w-80 p-0 rounded-xl shadow-lg"
              align="end"
            >
              <ScrollArea className="max-h-64 overflow-y-auto">
                <div className="divide-y">
                  {notifications.length > 0 ? (
                    notifications.map((_, index) => {
                      const notification =
                        notifications[notifications.length - index - 1];
                      return (
                        <div
                          key={notification.id}
                          className="p-3 hover:bg-muted/50 transition-colors cursor-pointer"
                          onClick={() => handleClick(notification)}
                        >
                          <p className="font-medium">{notification.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {notification.content}
                          </p>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      No hay notificaciones
                    </div>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
        </TooltipTrigger>

        <TooltipContent side="bottom">
          <p>Notifications</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
