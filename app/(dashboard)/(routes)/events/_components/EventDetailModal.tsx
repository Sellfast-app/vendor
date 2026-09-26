"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  CalendarIcon,
  MapPinIcon,
  PlusIcon,
  Ticket,
  Trash2,
} from "lucide-react";
import { format } from "date-fns";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Event, TicketType, generateEventId, generateTicketId } from "@/lib/events-data";

interface EventDetailModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
  isEditMode?: boolean;
  onSave: (event: Event) => void;
  onAddTicket: (ticketId: string) => void;
  onRemoveTicket: (ticketId: string) => void;
}

export function EventDetailModal({
  event,
  isOpen,
  onClose,
  isEditMode = false,
  onSave,
  onAddTicket,
  onRemoveTicket,
}: EventDetailModalProps) {
  const [formData, setFormData] = useState<Event>(
    event || {
      id: "",
      name: "",
      description: "",
      coverImage: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
      startDate: new Date().toISOString().split("T")[0],
      endDate: new Date().toISOString().split("T")[0],
      startTime: "18:00",
      endTime: "23:00",
      location: "",
      organizerName: "",
      organizerEmail: "",
      organizerPhone: "",
      status: "draft",
      tickets: [],
      totalCapacity: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = <K extends keyof Event>(field: K, value: Event[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const updateTickets = (updater: (tickets: TicketType[]) => TicketType[]) => {
    setFormData((prev) => ({ ...prev, tickets: updater(prev.tickets) }));
  };

  const handleDateRangeSelect = (range: { from?: Date; to?: Date } | null) => {
    if (range?.from) {
      handleInputChange("startDate", range.from.toISOString().split("T")[0]);
    }
    if (range?.to) {
      handleInputChange("endDate", range.to.toISOString().split("T")[0]);
    }
  };

  const handleTimeChange = (timeType: "startTime" | "endTime", value: string) => {
    setFormData((prev) => ({ ...prev, [timeType]: value }));
  };

  const addTicket = () => {
    const newTicket = {
      id: generateTicketId(),
      name: "",
      type: "paid" as const,
      price: 0,
      quantity: 100,
      sold: 0,
      orderLimitPerPerson: 1,
      tag: "Single Ticket",
    };
    updateTickets((tickets) => [...tickets, newTicket]);
    onAddTicket(newTicket.id);
  };

  const removeTicket = (ticketId: string) => {
    updateTickets((tickets) => tickets.filter((ticket) => ticket.id !== ticketId));
    onRemoveTicket(ticketId);
  };

  const updateTicket = (ticketId: string, updates: Partial<typeof formData.tickets[0]>) => {
    updateTickets((tickets) =>
      tickets.map((ticket) => (ticket.id === ticketId ? { ...ticket, ...updates } : ticket))
    );
  };

  const calculateTotalCapacity = () => {
    return formData.tickets.reduce((sum, t) => {
      if (t.type === "invite") return sum;
      return sum + t.quantity;
    }, 0);
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Event name is required");
      return;
    }
    if (!formData.location.trim()) {
      toast.error("Location is required");
      return;
    }
    if (!formData.startDate) {
      toast.error("Start date is required");
      return;
    }

    setIsLoading(true);
    try {
      const updatedEvent: Event = {
        ...formData,
        id: formData.id || generateEventId(),
        totalCapacity: calculateTotalCapacity(),
        updatedAt: new Date().toISOString(),
        createdAt: formData.createdAt || new Date().toISOString(),
      };
      onSave(updatedEvent);
      toast.success(isEditMode ? "Event updated successfully" : "Event created successfully");
      onClose();
    } catch {
      toast.error("Failed to save event");
    } finally {
      setIsLoading(false);
    }
  };

  const isPublished = formData.status === "published";
  const isDraft = formData.status === "draft";
  const isEnded = formData.status === "ended";

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-[#F5F5F5] dark:border-[#1F1F1F]">
          <DialogTitle className="text-lg font-semibold">
            {isEditMode ? "Edit Event" : "Create Event"}
          </DialogTitle>
        </DialogHeader>

        <div className="px-6 py-4 space-y-6">
          {/* Cover Image */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cover Image</Label>
            <div className="relative rounded-lg overflow-hidden aspect-video bg-muted">
              <Image
                src={formData.coverImage}
                alt="Event cover"
                width={800}
                height={400}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                <span className="text-white text-sm">Change cover</span>
              </div>
              <Input
                type="text"
                value={formData.coverImage}
                onChange={(e) => handleInputChange("coverImage", e.target.value)}
                placeholder="Paste image URL..."
                className="absolute bottom-2 left-2 right-2 bg-background/80 backdrop-blur-sm rounded-md px-2 py-1 text-xs"
              />
            </div>
          </div>

          {/* Event Details */}
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Event Name *</Label>
              <Input
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="e.g. Detty December Concert"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe your event..."
                className="min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Date *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.startDate ? format(new Date(formData.startDate), "dd MMM yyyy") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.startDate ? new Date(formData.startDate) : undefined}
                      onSelect={(date) => handleDateRangeSelect({ from: date, to: formData.endDate ? new Date(formData.endDate) : undefined })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.endDate ? format(new Date(formData.endDate), "dd MMM yyyy") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.endDate ? new Date(formData.endDate) : undefined}
                      onSelect={(date) => handleDateRangeSelect({ from: formData.startDate ? new Date(formData.startDate) : undefined, to: date })}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Start Time</Label>
                <Input
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => handleTimeChange("startTime", e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">End Time</Label>
                <Input
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => handleTimeChange("endTime", e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Location *</Label>
              <div className="flex items-center gap-2">
                <MapPinIcon className="h-4 w-4 text-muted-foreground" />
                <Input
                  value={formData.location}
                  onChange={(e) => handleInputChange("location", e.target.value)}
                  placeholder="e.g. Eko Convention Centre, Lagos"
                  className="h-10 flex-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Organizer Name</Label>
                <Input
                  value={formData.organizerName}
                  onChange={(e) => handleInputChange("organizerName", e.target.value)}
                  placeholder="Your name or brand"
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Organizer Email</Label>
                <Input
                  type="email"
                  value={formData.organizerEmail}
                  onChange={(e) => handleInputChange("organizerEmail", e.target.value)}
                  placeholder="email@example.com"
                  className="h-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Organizer Phone</Label>
              <Input
                value={formData.organizerPhone}
                onChange={(e) => handleInputChange("organizerPhone", e.target.value)}
                placeholder="+234 801 234 5678"
                className="h-10"
              />
            </div>
          </div>

          {/* Ticket Types */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Ticket Types</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={addTicket}
                className="border-primary text-primary gap-1"
              >
                <PlusIcon className="h-3 w-3" />
                Add Ticket Type
              </Button>
            </div>

            {formData.tickets.length === 0 ? (
              <div className="rounded-lg border border-dashed border-[#F5F5F5] dark:border-[#1F1F1F] p-6 text-center">
                <Ticket className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No ticket types yet</p>
                <p className="text-xs text-muted-foreground mt-1">Add ticket types to start selling</p>
              </div>
            ) : (
              <div className="space-y-3">
                {formData.tickets.map((ticket) => (
                  <Card key={ticket.id} className="border-[#F5F5F5] dark:border-[#1F1F1F]">
                    <CardContent className="p-4">
                      <div className="grid gap-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            <Badge
                              variant={ticket.type === "free" ? "default" : ticket.type === "paid" ? "secondary" : "outline"}
                              className={cn(
                                ticket.type === "free" && "bg-green-100 text-green-700",
                                ticket.type === "paid" && "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200",
                                ticket.type === "invite" && "border-dashed"
                              )}
                            >
                              {ticket.type === "free" ? "Free" : ticket.type === "paid" ? "Paid" : "Invite Only"}
                            </Badge>
                            <Input
                              value={ticket.name}
                              onChange={(e) => updateTicket(ticket.id, { name: e.target.value })}
                              placeholder="Ticket name"
                              className="flex-1 h-8 text-sm"
                            />
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-muted-foreground hover:text-destructive"
                            onClick={() => removeTicket(ticket.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                          {ticket.type !== "invite" ? (
                            <div className="space-y-1">
                              <Label className="text-xs text-muted-foreground">Price (₦)</Label>
                              <Input
                                type="number"
                                min="0"
                                step="100"
                                value={ticket.price || 0}
                                onChange={(e) => updateTicket(ticket.id, { price: Number(e.target.value) || 0 })}
                                className="h-8 text-sm"
                              />
                            </div>
                          ) : (
                            <div className="space-y-1 col-span-3">
                              <Label className="text-xs text-muted-foreground">Invite-only — no price set</Label>
                              <p className="text-xs text-muted-foreground">Invite-only tickets are sent directly to selected attendees</p>
                            </div>
                          )}

                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Quantity</Label>
                            <Input
                              type="number"
                              min="0"
                              value={ticket.quantity}
                              onChange={(e) => updateTicket(ticket.id, { quantity: Number(e.target.value) || 0 })}
                              className="h-8 text-sm"
                            />
                          </div>

                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Per person limit</Label>
                            <Select
                              value={String(ticket.orderLimitPerPerson)}
                              onValueChange={(v) => updateTicket(ticket.id, { orderLimitPerPerson: Number(v) })}
                            >
                              <SelectTrigger className="h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="1">1</SelectItem>
                                <SelectItem value="2">2</SelectItem>
                                <SelectItem value="3">3</SelectItem>
                                <SelectItem value="4">4</SelectItem>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        {ticket.type === "paid" && (
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>Total value: </span>
                            <span className="font-medium text-primary">
                              ₦{((ticket.price || 0) * ticket.quantity).toLocaleString()}
                            </span>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Capacity Summary */}
            {formData.tickets.length > 0 && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <span className="text-sm text-muted-foreground">Total capacity:</span>
                <span className="text-sm font-semibold">
                  {calculateTotalCapacity().toLocaleString()} tickets
                </span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Status</Label>
            <div className="flex gap-2">
              <Button
                variant={isDraft ? "default" : "outline"}
                className={cn("flex-1", isDraft && "bg-primary hover:bg-primary/90")}
                onClick={() => handleInputChange("status", "draft")}
              >
                Draft
              </Button>
              <Button
                variant={isPublished ? "default" : "outline"}
                className={cn(
                  "flex-1",
                  isPublished && "bg-green-600 hover:bg-green-600/90"
                )}
                onClick={() => handleInputChange("status", "published")}
              >
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-current" />
                  Published
                </span>
              </Button>
              <Button
                variant={isEnded ? "default" : "outline"}
                className={cn("flex-1", isEnded && "bg-gray-500 hover:bg-gray-500/90")}
                onClick={() => handleInputChange("status", "ended")}
              >
                Ended
              </Button>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-[#F5F5F5] dark:border-[#1F1F1F]">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isLoading}
            className="bg-primary hover:bg-primary/90"
          >
            {isLoading ? "Saving..." : isEditMode ? "Update Event" : "Create Event"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
