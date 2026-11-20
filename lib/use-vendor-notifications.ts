"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type VendorNotification = {
  id: number;
  type: string | null;
  payload: { title?: string; body?: string; order_number?: string; amount?: number; currency?: string } | null;
  read: boolean;
  created_at: string;
};

export function useVendorNotifications(enabled: boolean, pageSize = 20) {
  const [items, setItems] = useState<VendorNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [response, unreadResponse] = await Promise.all([
        fetch(`/api/notifications?page=1&pageSize=${pageSize}`, { cache: "no-store" }),
        fetch("/api/notifications?page=1&pageSize=1&unread=true", { cache: "no-store" }),
      ]);
      const [result, unreadResult] = await Promise.all([response.json(), unreadResponse.json()]);
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not load notifications");
      const data = result.data || {};
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
      setUnreadCount(unreadResponse.ok && unreadResult.status === "success" ? Number(unreadResult.data?.total || 0) : 0);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not load notifications";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => { if (enabled) void load(); }, [enabled, load]);

  const emitChanged = () => window.dispatchEvent(new Event("swiftree:notifications-changed"));

  const markRead = async (id: number) => {
    try {
      const response = await fetch("/api/notifications/mark-read", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ids: [id] }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not update notification");
      if (items.some((item) => item.id === id && !item.read)) setUnreadCount((count) => Math.max(0, count - 1));
      setItems((current) => current.map((item) => item.id === id ? { ...item, read: true } : item));
      emitChanged();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update notification");
    }
  };

  const markAllRead = async () => {
    try {
      const response = await fetch("/api/notifications/mark-all-read", { method: "POST" });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not update notifications");
      setItems((current) => current.map((item) => ({ ...item, read: true })));
      setUnreadCount(0);
      emitChanged();
      toast.success("All notifications marked as read.");
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not update notifications");
    }
  };

  return { items, total, unreadCount, loading, error, load, markRead, markAllRead };
}
