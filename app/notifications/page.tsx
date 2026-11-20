"use client";

import { Bell, Check, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useVendorNotifications } from "@/lib/use-vendor-notifications";

export default function NotificationsPage() {
  const { items, unreadCount, loading, error, load, markRead, markAllRead } = useVendorNotifications(true, 50);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b pb-5">
        <div>
          <p className="text-xs font-medium uppercase text-primary">Store activity</p>
          <div className="mt-2 flex items-center gap-2">
            <h1 className="text-2xl font-semibold">Notifications</h1>
            {unreadCount > 0 && <span className="text-sm text-muted-foreground">{unreadCount} unread</span>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => void markAllRead()} disabled={loading || unreadCount === 0}>
            <CheckCheck className="mr-2 h-4 w-4" />Mark all read
          </Button>
        </div>
      </header>

      {error && <div role="alert" className="border-y py-4 text-sm"><p>{error}</p><Button variant="outline" size="sm" className="mt-3" onClick={() => void load()}>Retry</Button></div>}
      {loading && items.length === 0 && <div className="space-y-3">{[0, 1, 2].map((item) => <div key={item} className="h-24 animate-pulse rounded-sm bg-muted" />)}</div>}
      {!loading && !error && items.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-center"><Bell className="mb-3 h-10 w-10 text-muted-foreground" /><p className="text-sm font-medium">No notifications yet</p><p className="mt-1 text-sm text-muted-foreground">Verified order payments will appear here.</p></div>}

      <div className="divide-y border-y">
        {items.map((notification) => (
          <article key={notification.id} className={`flex items-start gap-3 px-2 py-4 sm:px-4 ${!notification.read ? "bg-primary/5" : ""}`}>
            <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${notification.read ? "bg-muted" : "bg-primary"}`} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{notification.payload?.title || "Store notification"}</p>
              <p className="mt-1 text-sm text-muted-foreground">{notification.payload?.body || "You have a new store notification."}</p>
              <time className="mt-2 block text-xs text-muted-foreground" dateTime={notification.created_at}>{new Date(notification.created_at).toLocaleString()}</time>
            </div>
            {!notification.read && <Button variant="ghost" size="icon" aria-label="Mark as read" title="Mark as read" onClick={() => void markRead(notification.id)}><Check className="h-4 w-4" /></Button>}
          </article>
        ))}
      </div>
    </main>
  );
}
