"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Loader2, Mail, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Preferences = { in_app_enabled: true; email_enabled: boolean; whatsapp_enabled: boolean };

export default function NotificationSettings() {
  const [preferences, setPreferences] = useState<Preferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<"email" | "whatsapp" | null>(null);

  const loadPreferences = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/notifications/preferences", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not load notification settings");
      setPreferences(result.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load notification settings");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void loadPreferences(); }, [loadPreferences]);

  async function updatePreference(channel: "email" | "whatsapp", enabled: boolean) {
    if (!preferences) return;
    const previous = preferences;
    const next = {
      ...preferences,
      email_enabled: channel === "email" ? enabled : preferences.email_enabled,
      whatsapp_enabled: channel === "whatsapp" ? enabled : preferences.whatsapp_enabled,
    };
    setPreferences(next);
    setSaving(channel);
    try {
      const response = await fetch("/api/notifications/preferences", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email_enabled: next.email_enabled, whatsapp_enabled: next.whatsapp_enabled }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not save notification settings");
      setPreferences(result.data);
      toast.success(`${channel === "email" ? "Email" : "WhatsApp"} order alerts ${enabled ? "enabled" : "disabled"}.`);
    } catch (error) {
      setPreferences(previous);
      toast.error(error instanceof Error ? error.message : "Could not save notification settings");
    } finally {
      setSaving(null);
    }
  }

  return (
    <Card className="shadow-none">
      <CardHeader className="border-b">
        <p className="text-xs font-medium uppercase text-primary">Notifications</p>
        <h2 className="mt-2 text-lg font-semibold">Order alerts</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          In-app alerts are always on. Email and WhatsApp alerts are off until you enable them.
        </p>
      </CardHeader>
      <CardContent className="divide-y p-0">
        <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Bell aria-hidden="true" className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="notification-in-app" className="text-sm font-medium">In-app</Label>
            <p className="mt-1 text-sm text-muted-foreground">Payment-verified orders appear in the dashboard notification inbox.</p>
          </div>
          <Badge variant="outline" className="border-primary/30 text-primary">Always on</Badge>
        </div>
        <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground"><Mail aria-hidden="true" className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="notification-email" className="text-sm font-medium">Email</Label>
            <p className="mt-1 text-sm text-muted-foreground">Send an email to the vendor account when an order payment is verified.</p>
          </div>
          {saving === "email" ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
          <Switch id="notification-email" checked={preferences?.email_enabled ?? false} disabled={loading || !preferences || saving !== null} onCheckedChange={(checked) => void updatePreference("email", checked)} />
        </div>
        <div className="flex items-center gap-4 px-5 py-4 sm:px-6">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-foreground"><MessageCircle aria-hidden="true" className="h-5 w-5" /></div>
          <div className="min-w-0 flex-1">
            <Label htmlFor="notification-whatsapp" className="text-sm font-medium">WhatsApp</Label>
            <p className="mt-1 text-sm text-muted-foreground">Send an order alert to the WhatsApp number on your vendor account after payment verification.</p>
          </div>
          {saving === "whatsapp" ? <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /> : null}
          <Switch id="notification-whatsapp" checked={preferences?.whatsapp_enabled ?? false} disabled={loading || !preferences || saving !== null} onCheckedChange={(checked) => void updatePreference("whatsapp", checked)} />
        </div>
      </CardContent>
    </Card>
  );
}
