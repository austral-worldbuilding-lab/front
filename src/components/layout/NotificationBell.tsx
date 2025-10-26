"use client";

import { Bell, AlertCircle, ExternalLink, CheckCheck } from "lucide-react";
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
import * as React from "react";

function formatTimeAgo(date: Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const sec = Math.floor(diff / 1000);
  if (sec < 60) return "hace unos segundos";
  const min = Math.floor(sec / 60);
  if (min < 60) return `hace ${min} min`;
  const hrs = Math.floor(min / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return "ayer";
  if (days < 7) return `hace ${days} días`;
  return new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(d);
}

export const NotificationBell = () => {
  const { notifications, unreadCount, readNotification } = useNotifications();
  const navigate = useNavigate();

  const handleClick = (notification: Notification) => {
    if (!notification.read) readNotification(notification.id);
    if (notification.url) {
      navigate(notification.url);
    }
  };

  const handleMarkAsRead = (
    e: React.MouseEvent,
    notification: Notification
  ) => {
    e.stopPropagation();
    if (!notification.read) readNotification(notification.id);
  };

  const handleOpenUrl = (e: React.MouseEvent, notification: Notification) => {
    e.stopPropagation();
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
              className="w-96 p-0 rounded-xl shadow-lg"
              align="end"
            >
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <div className="text-sm font-semibold">Notificaciones</div>
                <div className="text-xs text-muted-foreground">
                  {notifications.length} total
                </div>
              </div>

              <ScrollArea className="max-h-80 overflow-y-auto">
                <div className="divide-y">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => {
                      const isUnread = !notification.read;
                      return (
                        <div
                          key={notification.id}
                          role="button"
                          tabIndex={0}
                          className={cn(
                            "group flex gap-3 p-3 transition-colors cursor-pointer",
                            "hover:bg-muted/50 focus:bg-muted/50"
                          )}
                          onClick={() => handleClick(notification)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter") handleClick(notification);
                          }}
                        >
                          <div className="pt-0.5">
                            {isUnread ? (
                              <AlertCircle className="h-4 w-4 text-red-500 shrink-0" />
                            ) : (
                              <div className="h-2 w-2 rounded-full bg-muted-foreground/40 mt-1" />
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-2">
                              <p
                                className={cn(
                                  "text-sm font-medium truncate",
                                  isUnread && "text-foreground"
                                )}
                                title={notification.title}
                              >
                                {notification.title}
                              </p>
                              <span className="text-[11px] text-muted-foreground whitespace-nowrap">
                                {formatTimeAgo(notification.createdAt)}
                              </span>
                            </div>
                            {notification.content && (
                              <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">
                                {notification.content}
                              </p>
                            )}
                          </div>

                          <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8"
                                  aria-label="Marcar como leída"
                                  onClick={(e) =>
                                    handleMarkAsRead(e, notification)
                                  }
                                  disabled={!isUnread}
                                  icon={<CheckCheck className="h-4 w-4" />}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                Marcar leída
                              </TooltipContent>
                            </Tooltip>

                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  className="h-8 w-8"
                                  aria-label="Abrir"
                                  onClick={(e) =>
                                    handleOpenUrl(e, notification)
                                  }
                                  disabled={!notification.url}
                                  icon={<ExternalLink className="h-4 w-4" />}
                                />
                              </TooltipTrigger>
                              <TooltipContent side="bottom">
                                Abrir
                              </TooltipContent>
                            </Tooltip>
                          </div>
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
          <p>Notificaciones</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
