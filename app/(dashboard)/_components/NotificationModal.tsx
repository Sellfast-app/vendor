"use client";

import { useState } from "react";
import { Bell, Mail, MessageCircle, Smartphone, X, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const initialNotifications: NotificationItem[] = [
  {
    id: "1",
    title: "Order confirmed",
    description: "Order #ORD-1048 has been confirmed.",
    time: "2 mins ago",
    read: false,
  },
  {
    id: "2",
    title: "Payment received",
    description: "₦18,500 received via Paystack.",
    time: "15 mins ago",
    read: false,
  },
  {
    id: "3",
    title: "Low stock alert",
    description: "Product \"African Print Dress\" has 3 items left.",
    time: "1 hour ago",
    read: true,
  },
  {
    id: "4",
    title: "New review",
    description: "Customer left a 5-star review on your store.",
    time: "3 hours ago",
    read: true,
  },
];

export default function NotificationModal({ isOpen, onClose }: NotificationModalProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50] flex justify-end my-3 mr-3">
      <div
        className="fixed inset-0 backdrop-blur-xs bg-[#06140033] dark:bg-black/50"
        onClick={onClose}
      />
      <div
        className="relative z-10 h-full w-[65%] bg-background shadow-lg overflow-x-auto transform transition-transform duration-300 ease-in-out rounded-xl border border-[#F5F5F5] dark:border-[#1F1F1F]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[#F5F5F5] dark:border-[#1F1F1F]">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <h2 className="text-sm font-semibold">Notifications</h2>
            {unreadCount > 0 && (
              <Badge variant="secondary" className="bg-primary/10 text-primary">
                {unreadCount}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={markAllRead}>
              Mark all read
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Notification list */}
        <div className="divide-y divide-[#F5F5F5] dark:divide-[#1F1F1F]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CheckCircle className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm font-medium text-muted-foreground">All caught up</p>
              <p className="text-xs text-muted-foreground mt-1">No new notifications</p>
            </div>
          ) : (
            notifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-muted/50 transition-colors ${
                  !notification.read ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notification.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">{notification.time}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                    onClick={() => dismissNotification(notification.id)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}