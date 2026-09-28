"use client";

import { useState } from "react";
import EventsTable from "./_components/EventsTable";
import { EventDetailModal } from "./_components/EventDetailModal";
import { Event, mockEvents } from "@/lib/events-data";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Globe2, MessageCircle, Plus, Ticket } from "lucide-react";

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
    console.log("Added ticket:", ticketId);
  };

  const handleRemoveTicket = (ticketId: string) => {
    console.log("Removed ticket:", ticketId);
  };

  const publishedEvents = events.filter((event) => event.status === "published").length;
  const totalTickets = events.reduce((sum, event) => sum + event.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.quantity, 0), 0);
  const soldTickets = events.reduce((sum, event) => sum + event.tickets.reduce((ticketSum, ticket) => ticketSum + ticket.sold, 0), 0);

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-col">
          <h3 className="text-sm font-bold">Events</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create and manage events to sell tickets across all channels
          </p>
        </div>
        <Button onClick={handleAddEvent}>
          <Plus className="h-4 w-4" />
          <span className="ml-2">Create event</span>
        </Button>
      </div>

      <div className="mb-6 grid gap-4 md:grid-cols-3">
        {[
          { label: "Published events", value: publishedEvents, icon: CalendarDays },
          { label: "Tickets sold", value: soldTickets, icon: Ticket },
          { label: "Total capacity", value: totalTickets, icon: Globe2 },
        ].map((metric) => (
          <Card key={metric.label} className="shadow-none">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{metric.label}</p>
                <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <metric.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6 shadow-none">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Omnichannel ticketing
              </p>
              <h2 className="mt-2 text-sm font-semibold">Event setup wizard</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Create, edit and publish events from one guided flow.
              </p>
            </div>
            <Badge variant="outline" className="w-fit border-primary/20 bg-primary/10 text-primary">
              Guided setup
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 md:grid-cols-4">
          {[
            ["Event details", "Name, description, date and venue."],
            ["Ticket tiers", "Free, paid, invite-only and order limits."],
            ["Sales channels", "Website, web chat and WhatsApp checkout."],
            ["Publish", "Review and make the event live."],
          ].map(([title, description], index) => (
            <div key={title} className="rounded-xl border p-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                {index + 1}
              </div>
              <h3 className="mt-4 text-sm font-medium">{title}</h3>
              <p className="mt-2 text-xs text-muted-foreground">{description}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="mb-6 grid gap-4 lg:grid-cols-3">
        {[
          [Globe2, "Website event page", "Customers browse event details and select tickets."],
          [MessageCircle, "WhatsApp tickets", "AI assistant can sell the same available tickets."],
          [Ticket, "Web chat checkout", "Ticketing stays available inside the chat widget."],
        ].map(([Icon, title, description]) => (
          <div key={title as string} className="rounded-xl border bg-white p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-sm font-medium">{title as string}</p>
            <p className="mt-1 text-xs text-muted-foreground">{description as string}</p>
          </div>
        ))}
      </div>

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
