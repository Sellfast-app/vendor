"use client";

import { Bell, Mail, MessageCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const channels = [
  {
    name: "Email",
    description: "Order, payment, and store activity updates delivered to your account email.",
    icon: Mail,
    status: "Available",
    enabled: true,
  },
  {
    name: "In-app",
    description: "Alerts and updates shown inside your Swiftree dashboard.",
    icon: Bell,
    status: "Available",
    enabled: true,
  },
  {
    name: "WhatsApp",
    description: "WhatsApp notification routing is not available yet.",
    icon: MessageCircle,
    status: "Coming soon",
    enabled: false,
  },
];

export default function PreferencesComponent() {
  return (
    <Card className="shadow-none">
      <CardHeader className="border-b">
        <p className="text-xs font-medium uppercase text-primary">Notifications</p>
        <h2 className="mt-2 text-lg font-semibold">Delivery channels</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Email and in-app notifications are currently supported. WhatsApp routing will be added later.
        </p>
      </CardHeader>
      <CardContent className="divide-y p-0">
        {channels.map(({ name, description, icon: Icon, status, enabled }) => (
          <div key={name} className="flex items-center gap-4 px-5 py-4 sm:px-6">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-md ${enabled ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
              <Icon aria-hidden="true" className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{name}</p>
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
            <Badge variant="outline" className={enabled ? "shrink-0 border-primary/30 text-primary" : "shrink-0 text-muted-foreground"}>
              {status}
            </Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
