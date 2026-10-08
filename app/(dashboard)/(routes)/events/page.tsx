"use client";

import { useState } from "react";
import Link from "next/link";
import EventsTable from "./_components/EventsTable";
import { EventDetailModal } from "./_components/EventDetailModal";
import { Event, mockEvents } from "@/lib/events-data";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  Globe2,
  Mail,
  Megaphone,
  MessageCircle,
  MonitorSmartphone,
  Plus,
  Ticket,
  Users,
} from "lucide-react";

const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat("en-NG", { notation: "compact" }).format(value);

const getTicketRevenue = (event: Event) =>
  event.tickets.reduce((sum, ticket) => sum + (ticket.price || 0) * ticket.sold, 0);

const formatCurrency = (value: number) =>
  `₦${value.toLocaleString("en-NG")}`;

export default function EventsPage() {
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [events, setEvents] = useState<Event[]>(mockEvents);

  const handleAddEvent = () => {
    setSelectedEvent(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleViewEvent = (event: Event) => {
    setSelectedEvent(event);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleSave = (updatedEvent: Event) => {
    setEvents((prev) => {
      const existing = prev.find((e) => e.id === updatedEvent.id);
      if (existing) {
        return prev.map((e) => (e.id === updatedEvent.id ? updatedEvent : e));
      }
      return [...prev, updatedEvent];
    });
    setSelectedEvent(updatedEvent);
  };

  const handleAddTicket = (ticketId: string) => {
    void ticketId;
  };

  const handleRemoveTicket = (ticketId: string) => {
    void ticketId;
  };

  const publishedEvents = events.filter((event) => event.status === "published").length;
  const totalTickets = events.reduce((sum, event) => sum + event.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0), 0);
  const soldTickets = events.reduce((sum, event) => sum + event.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.sold, 0), 0);
  const draftEvents = events.filter((event) => event.status === "draft").length;
  const totalRevenue = events.reduce((sum, event) => sum + getTicketRevenue(event), 0);
  const sellThrough = totalTickets > 0 ? Math.round((soldTickets / totalTickets) * 100) : 0;
  const nextEvent = [...events]
    .filter((event) => event.status !== "ended")
    .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())[0];

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="mb-2 inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground">
            <Ticket className="h-3.5 w-3.5 text-primary" />
            Omnichannel ticketing
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Events</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Create ticketed experiences, manage capacity, and sell through website, WhatsApp AI, and web chat.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild><Link href="/events/attendees"><Users className="mr-2 h-4 w-4" />Attendees & check-in</Link></Button>
        <Button onClick={handleAddEvent} className="h-10 w-full gap-2 lg:w-auto">
          <Plus className="h-4 w-4" />
          <span>Create event</span>
        </Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: "Published events",
            value: publishedEvents,
            sub: `${draftEvents} draft${draftEvents === 1 ? "" : "s"} waiting`,
            icon: CalendarDays,
          },
          {
            label: "Tickets sold",
            value: formatCompactNumber(soldTickets),
            sub: `${sellThrough}% sell-through`,
            icon: Ticket,
          },
          {
            label: "Total capacity",
            value: formatCompactNumber(totalTickets),
            sub: "Across all active events",
            icon: Globe2,
          },
          {
            label: "Ticket revenue",
            value: formatCurrency(totalRevenue),
            sub: "Before provider settlement",
            icon: BarChart3,
          },
        ].map((metric) => (
          <Card key={metric.label} className="shadow-none">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{metric.value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{metric.sub}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <metric.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mb-6 grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="shadow-none">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Event setup flow</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Follow the Tix-style creation path before publishing tickets.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 p-5 md:grid-cols-3">
            {[
              ["Details", "Name, date, time, location, organizer"],
              ["Appearance", "Cover image and storefront presentation"],
              ["Tickets", "Paid, free, and invite-only ticket types"],
            ].map(([title, description], index) => (
              <div key={title} className="rounded-lg border bg-background p-4">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {index + 1}
                </div>
                <p className="text-sm font-semibold">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b pb-4">
            <div className="flex items-center gap-2">
              <Megaphone className="h-4 w-4 text-primary" />
              <h2 className="text-sm font-semibold">Sales channels</h2>
            </div>
            <p className="text-xs text-muted-foreground">
              Tickets should stay available across every active channel.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {[
              [MonitorSmartphone, "Website storefront", "Customers browse and checkout on the public event page."],
              [MessageCircle, "WhatsApp AI", "Customers can discover events and receive confirmations by WhatsApp."],
              [Mail, "Web chat", "Customers can buy tickets from the embedded chat experience."],
            ].map(([Icon, title, description]) => {
              const ChannelIcon = Icon as typeof MonitorSmartphone;
              return (
                <div key={title as string} className="flex gap-3 rounded-lg border p-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <ChannelIcon className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{title as string}</p>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{description as string}</p>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {nextEvent && (
        <Card className="mb-6 overflow-hidden border-primary/20 bg-primary/5 shadow-none">
          <CardContent className="flex flex-col gap-3 p-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-background text-primary">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Next active event</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {nextEvent.name} · {new Date(nextEvent.startDate).toLocaleDateString("en-NG", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })} · {nextEvent.location}
                </p>
              </div>
            </div>
            <Button variant="outline" className="bg-background" onClick={() => handleViewEvent(nextEvent)}>
              View setup
            </Button>
          </CardContent>
        </Card>
      )}

      <EventsTable
        events={events}
        onAddEvent={handleAddEvent}
        onEditEvent={handleEditEvent}
        onViewEvent={handleViewEvent}
      />

      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEvent(null);
        }}
        isEditMode={isEditMode}
        onSave={handleSave}
        onAddTicket={handleAddTicket}
        onRemoveTicket={handleRemoveTicket}
      />
    </div>
  );
}
