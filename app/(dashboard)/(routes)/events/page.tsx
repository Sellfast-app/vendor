"use client";

import { useState } from "react";
import EventsTable from "./_components/EventsTable";
import { EventDetailModal } from "./_components/EventDetailModal";
import { Event, mockEvents } from "@/lib/events-data";

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

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-col">
          <h3 className="text-sm font-bold">Events</h3>
          <p className="text-xs text-muted-foreground mt-1">
            Create and manage events to sell tickets across all channels
          </p>
        </div>
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
