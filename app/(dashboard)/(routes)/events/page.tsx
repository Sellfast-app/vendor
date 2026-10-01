"use client";

import { useState } from "react";
import EventsTable from "./_components/EventsTable";
import { EventDetailModal } from "./_components/EventDetailModal";
import { Event, mockEvents } from "@/lib/events-data";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, Globe2, Plus, Ticket } from "lucide-react";

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
