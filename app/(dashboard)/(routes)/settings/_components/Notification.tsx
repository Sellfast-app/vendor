"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

function PreferencesComponent() {
  const [notifications, setNotifications] = useState<NotificationSetting[]>([
    {
      id: "email",
      title: "Email Notifications",
      description: "Get notified on orders, payouts from storefront and dashboard via email",
      enabled: false,
    },
    {
      id: "sms",
      title: "SMS Notifications",
      description: "Get notified on orders, payouts, alert, deliveries from storefront and dashboard via SMS",
      enabled: false,
    },
    {
      id: "whatsapp",
      title: "WhatsApp Notifications",
      description: "Get notified on alerts, deliveries coming from your WhatsApp bot",
      enabled: false,
    },
    {
      id: "in-app",
      title: "In App Notifications",
      description: "Get notified on everything inside your dashboard",
      enabled: true,
    },
  ]);

  const handleToggle = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, enabled: !notification.enabled }
          : notification
      )
    );
  };

  return (
    <div className="w-full space-y-6">
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-6 pt-6">
            <h2 className="text-sm font-medium">Preferences</h2>

            <div className="space-y-6">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className="flex items-start justify-between gap-4 py-2"
                >
                  <div className="flex-1">
                    <Label
                      htmlFor={notification.id}
                      className="text-sm font-medium cursor-pointer"
                    >
                      {notification.title}
                    </Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      {notification.description}
                    </p>
                  </div>
                  <Switch
                    id={notification.id}
                    checked={notification.enabled}
                    onCheckedChange={() => handleToggle(notification.id)}
                  />
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PreferencesComponent;