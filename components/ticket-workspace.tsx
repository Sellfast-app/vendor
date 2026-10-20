"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { QrCode, Ticket, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TicketScanner } from "@/components/ticket-scanner";

type CheckInEvent = { id: string; store_id: string; name: string; starts_at: string; ends_at: string };
type ScannedTicket = {
  event_id: string;
  event_name: string;
  store_id: string;
  attendee: { first_name: string; last_name: string };
  ticket_type: string;
  admission_status: string;
  checked_in_at?: string;
  token: string;
};
type LiveTicketOrder = {
  id: string;
  event_id: string;
  event_name: string;
  event_starts_at: string;
  location: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_whatsapp: string;
  total_amount: number | string;
  order_status: string;
  payment_status: string;
  created_at: string;
  admissions: Array<{ id: string; ticket_type_id: string; ticket_name: string; status: string; checked_in_at: string | null }>;
};
type TicketEventOption = { id: string; name: string };

export function TicketWorkspace({ view = "orders" }: { view?: "orders" | "attendees" }) {
  const [orders, setOrders] = useState<LiveTicketOrder[]>([]);
  const [events, setEvents] = useState<TicketEventOption[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [ordersError, setOrdersError] = useState("");
  const [totalOrders, setTotalOrders] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [refreshCount, setRefreshCount] = useState(0);
  const [eventId, setEventId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [scanner, setScanner] = useState(false);
  const [checkInEvents, setCheckInEvents] = useState<CheckInEvent[]>([]);
  const [checkInEventsLoading, setCheckInEventsLoading] = useState(false);
  const [selectedCheckInEvent, setSelectedCheckInEvent] = useState("");
  const [scannedTicket, setScannedTicket] = useState<ScannedTicket | null>(null);
  const [detail, setDetail] = useState<LiveTicketOrder | null>(null);

  useEffect(() => {
    if (view !== "orders") return;
    let active = true;
    setOrdersLoading(true);
    setOrdersError("");
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (search.trim()) params.set("search", search.trim());
    if (eventId) params.set("event_id", eventId);
    if (status) params.set("order_status", status);
    Promise.all([
      fetch(`/api/vendor/ticket-orders?${params}`, { cache: "no-store" }).then(async response => {
        const result = await response.json();
        if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not load ticket orders");
        return result.data;
      }),
      fetch("/api/vendor/events", { cache: "no-store" }).then(async response => {
        const result = await response.json();
        if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not load events");
        return result.data as Array<{ id: string; name: string }>;
      }),
    ]).then(([pageData, eventData]) => {
      if (!active) return;
      setOrders(Array.isArray(pageData.items) ? pageData.items : []);
      setTotalOrders(Number(pageData.total || 0));
      setTotalPages(Number(pageData.totalPages || 0));
      setEvents(eventData.map(event => ({ id: event.id, name: event.name })));
    }).catch(error => {
      if (active) setOrdersError(error instanceof Error ? error.message : "Could not load ticket orders");
    }).finally(() => { if (active) setOrdersLoading(false); });
    return () => { active = false; };
  }, [view, page, search, eventId, status, refreshCount]);

  useEffect(() => {
    if (view !== "attendees") return;
    let active = true;
    setCheckInEventsLoading(true);
    fetch("/api/vendor/tickets/events", { cache: "no-store" })
      .then(async response => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.message || "Could not load published events.");
        return result.data as CheckInEvent[];
      })
      .then(items => {
        if (!active) return;
        setCheckInEvents(items);
        setSelectedCheckInEvent(current => items.some(event => event.id === current) ? current : items[0]?.id || "");
      })
      .catch(error => { if (active) setMessage(error instanceof Error ? error.message : "Could not load published events."); })
      .finally(() => { if (active) setCheckInEventsLoading(false); });
    return () => { active = false; };
  }, [view]);

  const currentTicketCount = orders.reduce((sum, order) => sum + order.admissions.length, 0);
  const currentCheckedInCount = orders.reduce((sum, order) => sum + order.admissions.filter(ticket => ticket.status === "checked_in").length, 0);
  const validateLiveTicket = async (token: string) => {
    setScannedTicket(null);
    setMessage("");
    try {
      const response = await fetch("/api/vendor/tickets/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: selectedCheckInEvent, token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Ticket could not be validated.");
      setScannedTicket({ ...result.data, token } as ScannedTicket);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Ticket could not be validated.");
    }
  };
  const confirmLiveCheckIn = async () => {
    if (!scannedTicket) return;
    setMessage("");
    try {
      const response = await fetch("/api/vendor/tickets/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ event_id: selectedCheckInEvent, token: scannedTicket.token }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Check-in could not be completed.");
      setScannedTicket({ ...result.data, token: scannedTicket.token } as ScannedTicket);
      setMessage("Check-in successful.");
    } catch (error) {
      setScannedTicket(null);
      setMessage(error instanceof Error ? error.message : "Check-in could not be completed.");
    }
  };
  if (view === "attendees") {
    return <section className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-semibold">Attendees &amp; check-in</h2>
          <p className="mt-1 text-sm text-muted-foreground">Scan a ticket or enter its code to validate admission.</p></div>
        <Button variant="outline" asChild><Link href="/orders/tickets">Ticket orders</Link></Button>
      </div>
      <div className="flex flex-col gap-3 border-y py-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="flex min-w-0 flex-col gap-2 text-sm font-medium sm:w-[min(100%,420px)]">Event
          <select aria-label="Select event for check-in" className="h-10 rounded-md border bg-background px-3 text-sm font-normal"
            value={selectedCheckInEvent} disabled={checkInEventsLoading || !checkInEvents.length}
            onChange={event => { setSelectedCheckInEvent(event.target.value); setScannedTicket(null); setMessage(""); }}>
            <option value="">{checkInEventsLoading ? "Loading events..." : "Select an event"}</option>
            {checkInEvents.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
          </select>
        </label>
        <Button className="gap-2" disabled={!selectedCheckInEvent} onClick={() => { setScannedTicket(null); setMessage(""); setScanner(true); }}>
          <QrCode className="h-4 w-4" />Scan ticket
        </Button>
      </div>
      {message && <p role="status" className="text-sm">{message}</p>}
      {!checkInEventsLoading && !checkInEvents.length && !message &&
        <div className="py-14 text-center"><Ticket className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <h3 className="font-medium">No published events available</h3>
          <p className="mt-1 text-sm text-muted-foreground">Published events will appear here for check-in.</p>
        </div>}
      <Dialog open={scanner} onOpenChange={open => { setScanner(open); if (!open) { setScannedTicket(null); setMessage(""); } }}>
        <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md">
          <DialogHeader><DialogTitle>Event check-in</DialogTitle></DialogHeader>
          <p className="text-sm text-muted-foreground">{checkInEvents.find(event => event.id === selectedCheckInEvent)?.name}</p>
          {!scannedTicket && <TicketScanner onScan={token => { void validateLiveTicket(token); }} />}
          {scannedTicket && <div className="space-y-4">
            <CheckCircle2 className="h-8 w-8 text-primary" />
            <div><h3 className="font-semibold">{scannedTicket.admission_status === "checked_in" ? "Checked in" : "Valid ticket"}</h3>
              <p className="mt-1">{scannedTicket.attendee.first_name} {scannedTicket.attendee.last_name}</p>
              <p className="text-sm text-muted-foreground">{scannedTicket.ticket_type}</p>
              {scannedTicket.checked_in_at && <p className="mt-1 text-xs text-muted-foreground">{new Date(scannedTicket.checked_in_at).toLocaleString()}</p>}
            </div>
            {scannedTicket.admission_status !== "checked_in" ?
              <Button className="w-full" onClick={() => void confirmLiveCheckIn()}>Confirm check-in</Button> :
              <Button className="w-full" onClick={() => { setScannedTicket(null); setMessage(""); }}>Scan next ticket</Button>}
            {scannedTicket.admission_status !== "checked_in" && <Button variant="outline" className="w-full" onClick={() => setScannedTicket(null)}>Scan another ticket</Button>}
          </div>}
          {message && <p role="alert" className="text-sm text-destructive">{message}</p>}
        </DialogContent>
      </Dialog>
    </section>;
  }

  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-semibold">Ticket orders</h2>
        <p className="mt-1 text-sm text-muted-foreground">Orders and admissions recorded for your events.</p></div>
      <Button variant="outline" asChild><Link href="/events/attendees">Attendees &amp; check-in</Link></Button>
    </div>
    <div className="grid grid-cols-2 gap-3 border-y py-4 sm:grid-cols-3">
      {[["Orders on this page", orders.length], ["Tickets on this page", currentTicketCount], ["Checked in", currentCheckedInCount]].map(([label, value]) =>
        <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>)}
    </div>
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input aria-label="Search ticket orders" placeholder="Search name, email or order" value={search} onChange={event => { setPage(1); setSearch(event.target.value); }} />
      <select aria-label="Event" className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm sm:max-w-64" value={eventId} onChange={event => { setPage(1); setEventId(event.target.value); }}>
        <option value="">All events</option>{events.map(event => <option key={event.id} value={event.id}>{event.name}</option>)}
      </select>
      <select aria-label="Order status" className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={event => { setPage(1); setStatus(event.target.value); }}>
        <option value="">All statuses</option><option value="pending">Pending</option><option value="confirmed">Confirmed</option><option value="cancelled">Cancelled</option>
      </select>
    </div>
    {ordersError && <div role="alert" className="flex flex-wrap items-center justify-between gap-3 border-y py-4 text-sm">
      <span>{ordersError}</span><Button variant="outline" onClick={() => setRefreshCount(current => current + 1)}>Retry</Button>
    </div>}
    {ordersLoading ? <div className="h-48 animate-pulse rounded-md bg-muted" aria-label="Loading ticket orders" /> :
      !ordersError && orders.length === 0 ?
        <div className="py-14 text-center"><Ticket className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><h3 className="font-medium">No ticket orders found</h3><p className="mt-1 text-sm text-muted-foreground">Orders will appear here after ticket checkout is enabled.</p></div> :
        orders.length > 0 && <div className="overflow-x-auto rounded-md border">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground"><tr>
              {["Customer", "Event", "Tickets", "Total", "Payment", "Status", ""].map(label => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}
            </tr></thead>
            <tbody>{orders.map(order => <tr key={order.id} className="border-t">
              <td className="px-4 py-3"><p>{order.customer_first_name} {order.customer_last_name}</p><p className="text-xs text-muted-foreground">{order.customer_email}</p></td>
              <td className="px-4 py-3">{order.event_name}</td><td className="px-4 py-3">{order.admissions.length}</td>
              <td className="px-4 py-3">{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(order.total_amount))}</td>
              <td className="px-4 py-3 capitalize">{order.payment_status}</td><td className="px-4 py-3 capitalize">{order.order_status}</td>
              <td className="px-4 py-3"><Button variant="ghost" onClick={() => setDetail(order)}>View</Button></td>
            </tr>)}</tbody>
          </table>
        </div>}
    {!ordersLoading && totalPages > 1 && <div className="flex items-center justify-between text-sm">
      <span className="text-muted-foreground">{totalOrders} orders · Page {page} of {totalPages}</span>
      <div className="flex gap-2"><Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage(value => value - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage(value => value + 1)}>Next</Button></div>
    </div>}
    <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Ticket order</DialogTitle></DialogHeader>
        {detail && <div className="space-y-4 text-sm">
          <p className="font-semibold">{detail.event_name}</p><p>{detail.customer_first_name} {detail.customer_last_name}</p>
          <p className="break-all">{detail.customer_email} · {detail.customer_whatsapp || "No WhatsApp number"}</p><p className="break-all text-xs text-muted-foreground">{detail.id}</p>
          <p>{new Date(detail.created_at).toLocaleString()} · {detail.order_status} · Payment {detail.payment_status}</p>
          <p>{new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(Number(detail.total_amount))}</p>
          <div className="divide-y">{detail.admissions.map(ticket => <div key={ticket.id} className="flex justify-between gap-3 py-3"><span>{ticket.ticket_name}</span><span className="capitalize">{ticket.status}{ticket.checked_in_at ? ` · ${new Date(ticket.checked_in_at).toLocaleString()}` : ""}</span></div>)}</div>
        </div>}
      </DialogContent>
    </Dialog>
  </section>;
}
