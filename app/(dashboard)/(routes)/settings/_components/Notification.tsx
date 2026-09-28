"use client";

import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Bell, Mail, MessageCircle, Smartphone } from "lucide-react";

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
        <CardHeader className="border-b">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Notification routing
            </p>
            <h2 className="mt-2 text-lg font-semibold">Channel preferences</h2>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Choose how order confirmations, pickup instructions and tracking
              updates are delivered across storefront channels.
            </p>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-6 pt-6">

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

      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Customer notification matrix</h2>
              <p className="text-xs text-muted-foreground">
                Customer routing by sales channel.
              </p>
            </div>
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              Channel routing
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 lg:grid-cols-3">
          {[
            {
              channel: "Website Storefront",
              icon: Mail,
              routes: ["Order confirmation: Email", "Pickup instructions: Email", "Tracking link: Email"],
            },
            {
              channel: "WhatsApp AI",
              icon: MessageCircle,
              routes: ["Order confirmation: WhatsApp", "Pickup instructions: WhatsApp", "Tracking link: WhatsApp"],
            },
            {
              channel: "Web Chat Widget",
              icon: Smartphone,
              routes: ["Order confirmation: Email + SMS", "Pickup instructions: Email + SMS", "Tracking link: Email + SMS"],
            },
          ].map((item) => (
            <div key={item.channel} className="rounded-xl border p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="text-sm font-medium">{item.channel}</p>
              </div>
              <div className="mt-4 space-y-2">
                {item.routes.map((route) => (
                  <div key={route} className="flex items-start gap-2 rounded-lg bg-[#F7FFF9] p-3 text-xs text-muted-foreground">
                    <Bell className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                    <span>{route}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

export default PreferencesComponent;
