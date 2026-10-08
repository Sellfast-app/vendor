"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Download, QrCode, Upload, Ticket, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { mockEvents } from "@/lib/events-data";
import { TicketScanner } from "@/components/ticket-scanner";
import { TicketOrder, checkInAdmission, downloadBooking, inspectAdmission, mergeTicketOrder, parseTicketOrder, readTicketOrders, writeTicketOrders } from "@/lib/ticket-preview";

export function TicketWorkspace({ view = "orders" }: { view?: "orders" | "attendees" }) {
  const [orders, setOrders] = useState<TicketOrder[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [eventId, setEventId] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [message, setMessage] = useState("");
  const [scanner, setScanner] = useState(false);
  const [candidate, setCandidate] = useState<ReturnType<typeof inspectAdmission> | null>(null);
  const [detail, setDetail] = useState<TicketOrder | null>(null);
  const file = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const load = () => {
      try { setOrders(readTicketOrders()); }
      catch { setMessage("Saved ticket records could not be loaded. No records have been overwritten."); }
      setLoaded(true);
    };
    load();
    window.addEventListener("storage", load);
    return () => window.removeEventListener("storage", load);
  }, []);

  const events = new Map(mockEvents.map(event => [event.id, event.name]));
  orders.forEach(order => events.set(order.eventId, order.eventName));
  const filtered = orders.filter(order =>
    (!eventId || order.eventId === eventId) &&
    (order.customer.firstName + " " + order.customer.lastName + " " + order.customer.email + " " + order.id)
      .toLowerCase().includes(search.toLowerCase()));
  const attendees = filtered.flatMap(order => order.admissions.map(admission => ({ order, admission })))
    .filter(({ order, admission }) => !status || (status === "cancelled" ? order.status === "cancelled" :
      order.status === "confirmed" && (status === "checked-in" ? !!admission.checkedInAt : !admission.checkedInAt)));
  const visibleOrders = filtered.filter(order => !status || order.status === status);
  const inspect = (token: string) => {
    setCandidate(null); setMessage("");
    try { setCandidate(inspectAdmission(readTicketOrders(), token, eventId)); }
    catch (error) { setMessage(error instanceof Error ? error.message : "Unable to validate ticket."); }
  };
  const checkIn = async () => {
    if (!candidate) return;
    const token = candidate.admission.token;
    const update = () => {
      const next = checkInAdmission(readTicketOrders(), token, eventId, new Date().toISOString());
      writeTicketOrders(next); setOrders(next); setCandidate(null); setMessage("Check-in successful.");
    };
    try {
      // Serializes tabs on this origin only; production needs an atomic server operation.
      if (navigator.locks) await navigator.locks.request("swiftree-preview-checkin", update);
      else update();
    } catch (error) {
      setCandidate(null); setMessage(error instanceof Error ? error.message : "Check-in failed.");
    }
  };

  return <section className="space-y-5">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-xl font-semibold">{view === "orders" ? "Ticket orders" : "Attendees & check-in"}</h2>
        <p className="mt-1 text-xs text-muted-foreground">Preview records · Not valid for live admission</p></div>
      <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild><Link href={view === "orders" ? "/events/attendees" : "/orders/tickets"}>{view === "orders" ? "Attendees" : "Ticket orders"}</Link></Button>
        <Button variant="outline" className="gap-2" onClick={() => file.current?.click()}><Upload className="h-4 w-4" />Import booking</Button>
        {view === "attendees" && <Button className="gap-2" disabled={!eventId} onClick={() => { setCandidate(null); setMessage(""); setScanner(true); }}><QrCode className="h-4 w-4" />Check in</Button>}
      </div>
    </div>
    <input ref={file} type="file" accept=".json,application/json" className="hidden" aria-label="Import preview booking" onChange={async event => {
      const selected = event.target.files?.[0]; event.target.value = "";
      if (!selected) return;
      try {
        if (selected.size > 250000) throw new Error("Booking file is too large.");
        const order = parseTicketOrder(JSON.parse(await selected.text()));
        const current = readTicketOrders();
        const next = mergeTicketOrder(current, order);
        writeTicketOrders(next); setOrders(next); setEventId(order.eventId);
        setMessage(next.length === current.length ? "Booking already imported. Existing check-ins were preserved." : "Preview booking imported.");
      } catch (error) { setMessage(error instanceof Error ? error.message : "Could not import booking."); }
    }} />
    <div className="grid grid-cols-3 gap-3 border-y py-4">
      {[["Bookings", filtered.length], ["Tickets", filtered.reduce((sum, order) => sum + order.admissions.length, 0)],
        ["Checked in", filtered.reduce((sum, order) => sum + order.admissions.filter(ticket => ticket.checkedInAt).length, 0)]].map(([label, value]) =>
        <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-2xl font-semibold">{value}</p></div>)}
    </div>
    <div className="flex flex-col gap-3 sm:flex-row">
      <Input aria-label="Search ticket orders" placeholder="Search name, email or booking" value={search} onChange={event => setSearch(event.target.value)} />
      <select aria-label="Event" className="h-10 min-w-0 rounded-md border bg-background px-3 text-sm sm:max-w-64" value={eventId} onChange={event => { setEventId(event.target.value); setCandidate(null); }}>
        <option value="">All events</option>{Array.from(events).map(([id, name]) => <option key={id} value={id}>{name}</option>)}
      </select>
      <select aria-label="Status" className="h-10 rounded-md border bg-background px-3 text-sm" value={status} onChange={event => setStatus(event.target.value)}>
        <option value="">All statuses</option>
        {view === "orders" ? <option value="confirmed">Confirmed</option> : <><option value="valid">Not checked in</option><option value="checked-in">Checked in</option></>}
        <option value="cancelled">Cancelled</option>
      </select>
    </div>
    {view === "attendees" && !eventId && <p className="text-sm text-muted-foreground">Select an event to check in attendees.</p>}
    {message && !scanner && <p role="status" className="text-sm">{message}</p>}
    {!loaded ? <div className="h-48 animate-pulse rounded-lg bg-muted" aria-label="Loading tickets" /> :
      (view === "orders" ? visibleOrders.length : attendees.length) === 0 ?
        <div className="py-14 text-center"><Ticket className="mx-auto mb-3 h-8 w-8 text-muted-foreground" /><h3 className="font-medium">No {view === "orders" ? "ticket orders" : "attendees"} found</h3></div> :
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full whitespace-nowrap text-left text-sm">
            <thead className="bg-muted/40 text-xs text-muted-foreground"><tr>
              {(view === "orders" ? ["Customer", "Event", "Tickets", "Total", "Status", ""] : ["Attendee", "Event", "Ticket", "Status", ""]).map((label, index) => <th key={index} className="px-4 py-3 font-medium">{label}</th>)}
            </tr></thead>
            <tbody>{view === "orders" ? visibleOrders.map(order => <tr key={order.id} className="border-t">
              <td className="px-4 py-3"><p>{order.customer.firstName} {order.customer.lastName}</p><p className="text-xs text-muted-foreground">{order.customer.email}</p></td>
              <td className="px-4 py-3">{order.eventName}</td><td className="px-4 py-3">{order.admissions.length}</td>
              <td className="px-4 py-3">₦{order.total.toLocaleString()}</td><td className="px-4 py-3 capitalize">{order.status}</td>
              <td className="px-4 py-3"><Button variant="ghost" onClick={() => setDetail(order)}>View</Button></td>
            </tr>) : attendees.map(({ order, admission }) => <tr key={admission.id} className="border-t">
              <td className="px-4 py-3">{order.customer.firstName} {order.customer.lastName}</td><td className="px-4 py-3">{order.eventName}</td>
              <td className="px-4 py-3">{admission.ticketName}</td><td className="px-4 py-3">{order.status === "cancelled" ? "Cancelled" : admission.checkedInAt ? "Checked in" : "Not checked in"}</td>
              <td className="px-4 py-3"><Button variant="ghost" disabled={!eventId || !!admission.checkedInAt || order.status === "cancelled"} onClick={() => { setScanner(true); inspect(admission.token); }}>Check in</Button></td>
            </tr>)}</tbody>
          </table>
        </div>}
    <Dialog open={scanner} onOpenChange={open => { setScanner(open); setCandidate(null); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-md"><DialogHeader><DialogTitle>Event check-in</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">{events.get(eventId)}</p>
        {scanner && !candidate && <TicketScanner onScan={inspect} />}
        {candidate && <div className="space-y-4"><CheckCircle2 className="h-8 w-8 text-primary" /><h3 className="font-semibold">Valid test ticket</h3>
          <p>{candidate.order.customer.firstName} {candidate.order.customer.lastName}</p><p className="text-sm">{candidate.admission.ticketName}</p>
          <Button className="w-full" onClick={() => void checkIn()}>Confirm check-in</Button><Button variant="outline" className="w-full" onClick={() => setCandidate(null)}>Cancel</Button></div>}
        {message && <p role="status" className="text-sm">{message}</p>}
      </DialogContent>
    </Dialog>
    <Dialog open={!!detail} onOpenChange={open => { if (!open) setDetail(null); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>Ticket order</DialogTitle></DialogHeader>
        {detail && <div className="space-y-4 text-sm">
          <p className="font-semibold">{detail.eventName}</p><p>{detail.customer.firstName} {detail.customer.lastName}</p>
          <p className="break-all">{detail.customer.email} · {detail.customer.whatsapp}</p><p className="break-all text-xs text-muted-foreground">{detail.id}</p>
          <p>{new Date(detail.createdAt).toLocaleString()} · Website</p><p>Test total: ₦{detail.total.toLocaleString()} · {detail.status}</p>
          <div className="divide-y">{detail.admissions.map(ticket => <div key={ticket.id} className="flex justify-between gap-3 py-3"><span>{ticket.ticketName}</span><span>{ticket.checkedInAt ? new Date(ticket.checkedInAt).toLocaleString() : "Not checked in"}</span></div>)}</div>
          <Button variant="outline" className="gap-2" onClick={() => downloadBooking(detail)}><Download className="h-4 w-4" />Download booking</Button>
          <Button asChild className="ml-2"><Link href="/events/attendees" onClick={() => setDetail(null)}>View attendees</Link></Button>
        </div>}
      </DialogContent>
    </Dialog>
  </section>;
}
