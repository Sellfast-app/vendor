"use client";

import { useEffect } from "react";
import { Bell, Check, CheckCheck, Loader2, RefreshCw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useVendorNotifications } from "@/lib/use-vendor-notifications";

interface NotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

export default function NotificationModal({ isOpen, onClose, onUnreadCountChange }: NotificationModalProps) {
  const { items, unreadCount, loading, error, load, markRead, markAllRead } = useVendorNotifications(isOpen, 10);
  useEffect(() => { onUnreadCountChange?.(unreadCount); }, [onUnreadCountChange, unreadCount]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[50] flex justify-end bg-black/30 p-0 sm:p-3" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="notification-panel-title" className="relative flex h-full w-full max-w-lg flex-col border bg-background shadow-xl sm:rounded-md">
        <header className="flex items-center justify-between border-b p-4">
          <div className="flex items-center gap-2">
            <Bell aria-hidden="true" className="h-5 w-5 text-primary" />
            <h2 id="notification-panel-title" className="text-sm font-semibold">Notifications</h2>
            {unreadCount > 0 && <Badge variant="secondary" className="bg-primary/10 text-primary">{unreadCount}</Badge>}
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Refresh notifications" title="Refresh notifications" onClick={() => void load()} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
            <Button variant="ghost" size="icon" aria-label="Mark all as read" title="Mark all as read" onClick={() => void markAllRead()} disabled={loading || unreadCount === 0}>
              <CheckCheck className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" aria-label="Close notifications" onClick={onClose}><X className="h-4 w-4" /></Button>
          </div>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto divide-y">
          {loading && items.length === 0 ? <div className="space-y-3 p-4">{[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-sm bg-muted" />)}</div> : null}
          {error && <div role="alert" className="m-4 border-y py-4 text-sm"><p>{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => void load()}>Retry</Button></div>}
          {!loading && !error && items.length === 0 && <div className="flex h-full flex-col items-center justify-center px-6 text-center"><Bell className="mb-3 h-8 w-8 text-muted-foreground" /><p className="text-sm font-medium">No notifications yet</p><p className="mt-1 text-xs text-muted-foreground">Verified order payments will appear here.</p></div>}
          {items.map((notification) => (
            <article key={notification.id} className={`flex items-start gap-3 p-4 ${!notification.read ? "bg-primary/5" : ""}`}>
              <span className={`mt-1 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-muted" : "bg-primary"}`} aria-label={notification.read ? "Read" : "Unread"} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{notification.payload?.title || "Store notification"}</p>
                <p className="mt-1 text-sm text-muted-foreground">{notification.payload?.body || "You have a new store notification."}</p>
                <time className="mt-2 block text-xs text-muted-foreground" dateTime={notification.created_at}>{new Date(notification.created_at).toLocaleString()}</time>
              </div>
              {!notification.read && <Button variant="ghost" size="icon" aria-label="Mark as read" title="Mark as read" onClick={() => void markRead(notification.id)}><Check className="h-4 w-4" /></Button>}
            </article>
          ))}
        </div>
        <footer className="border-t p-3 text-center"><Button variant="link" size="sm" onClick={() => { onClose(); window.location.href = "/notifications"; }}>View all notifications</Button></footer>
      </section>
    </div>
  );
}
