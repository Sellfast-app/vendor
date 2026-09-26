"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  CalendarIcon,
  PlusIcon,
  SearchIcon,
  CalendarDays,
  MapPin,
  Ticket,
} from "lucide-react";
import { format } from "date-fns";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BsThreeDots } from "react-icons/bs";
import EditIcon from "@/components/svgIcons/EditIcon";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Event } from "@/lib/events-data";
import { toast } from "sonner";

interface EventsTableProps {
  events: Event[];
  onAddEvent: () => void;
  onEditEvent: (event: Event) => void;
  onViewEvent: (event: Event) => void;
}

const statusTabs = [
  { key: "all", label: "All Events" },
  { key: "published", label: "Published" },
  { key: "draft", label: "Drafts" },
  { key: "ended", label: "Ended" },
];

export default function EventsTable({ events, onAddEvent, onEditEvent, onViewEvent }: EventsTableProps) {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDateFrom, setFilterDateFrom] = useState<Date | undefined>();
  const [filterDateTo, setFilterDateTo] = useState<Date | undefined>();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  let filteredEvents = events;

  if (activeTab !== "all") {
    filteredEvents = events.filter((event) => event.status === activeTab);
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredEvents = filteredEvents.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.location.toLowerCase().includes(term) ||
        e.description.toLowerCase().includes(term)
    );
  }

  if (filterDateFrom || filterDateTo) {
    filteredEvents = filteredEvents.filter((e) => {
      const eventDate = new Date(e.startDate);
      if (filterDateFrom && eventDate < filterDateFrom) return false;
      if (filterDateTo) {
        const eventEnd = new Date(e.endDate);
        eventEnd.setHours(23, 59, 59, 999);
        if (eventEnd > filterDateTo) return false;
      }
      return true;
    });
  }

  const totalCount = filteredEvents.length;
  const paginatedEvents = filteredEvents.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  const totalPages = Math.ceil(totalCount / pageSize);

  const clearFilters = () => {
    setFilterDateFrom(undefined);
    setFilterDateTo(undefined);
    setSearchTerm("");
    setIsFilterOpen(false);
    setActiveTab("all");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchTerm || filterDateFrom || filterDateTo || activeTab !== "all";

  const getStatusColor = (status: Event["status"]) => {
    switch (status) {
      case "published":
        return "bg-[#53DC19] text-white";
      case "draft":
        return "bg-[#FFB347] text-white";
      case "ended":
        return "bg-[#737373] text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  const getStatusBadgeText = (status: Event["status"]) => {
    switch (status) {
      case "published":
        return "Live";
      case "draft":
        return "Draft";
      case "ended":
        return "Ended";
      default:
        return status;
    }
  };

  const calculateProgress = (event: Event) => {
    const totalSold = event.tickets.reduce((sum, t) => sum + t.sold, 0);
    const totalQty = event.tickets.reduce((sum, t) => sum + t.quantity, 0);
    if (totalQty === 0) return 0;
    return Math.round((totalSold / totalQty) * 100);
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-2">
          <CalendarDays className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Events</h2>
        </div>
        <Button
          className="bg-primary hover:bg-primary/90 border-primary"
          onClick={onAddEvent}
        >
          <PlusIcon className="h-4 w-4 mr-2" />
          Create Event
        </Button>
      </div>

      {/* Search and Filter */}
      <div className="flex justify-between mb-4 space-x-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setCurrentPage(1);
          }}
          className="relative flex items-center"
        >
          <Input
            type="text"
            placeholder="Search events..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 py-2 text-xs sm:text-sm rounded-lg border border-[#F5F5F5] dark:border-[#1F1F1F]"
          />
          <SearchIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </form>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="border-[#F5F5F5] dark:border-[#1F1F1F] dark:bg-background"
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              if (isFilterOpen) clearFilters();
            }}
          >
            <CalendarIcon className="h-4 w-4" />
            {isFilterOpen ? "Clear" : "Filter"}
          </Button>
        </div>
      </div>

      {/* Filter Panel */}
      {isFilterOpen && (
        <div className="mb-4 p-4 bg-white dark:bg-[#1F1F1F] rounded-lg border border-[#F5F5F5] dark:border-[#2D2D2D]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFrom">Start Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filterDateFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDateFrom ? format(filterDateFrom, "dd-MM-yyyy") : "Pick start date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filterDateFrom}
                    onSelect={(date) => setFilterDateFrom(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="dateTo">End Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !filterDateTo && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDateTo ? format(filterDateTo, "dd-MM-yyyy") : "Pick end date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={filterDateTo}
                    onSelect={(date) => setFilterDateTo(date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label>Event Type</Label>
              <Select
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v);
                  setCurrentPage(1);
                }}
              >
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                  <SelectItem value="ended">Ended</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Status Tabs */}
      <div className="flex space-x-2 mb-4 px-2 pb-4 overflow-x-auto">
        {statusTabs.map((tab) => (
          <Button
            key={tab.key}
            variant="ghost"
            className={cn(
              "px-4 rounded-none whitespace-nowrap",
              activeTab === tab.key
                ? "border-b-2 border-primary text-primary"
                : "text-[#A0A0A0]"
            )}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
          >
            {tab.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-lg border border-[#F5F5F5] dark:border-[#1F1F1F]">
        <Table>
          <TableHeader className="bg-[#F5F5F5] dark:bg-background">
            <TableRow>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">Event</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">Date</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">Location</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">Tickets</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">Capacity</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">Status</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">Sales</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedEvents.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <Ticket className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">No events found</p>
                    <p className="text-xs text-muted-foreground">
                      {hasActiveFilters
                        ? "Try adjusting your filters"
                        : "Create your first event to start selling tickets"}
                    </p>
                    {!hasActiveFilters && (
                      <Button
                        variant="outline"
                        onClick={onAddEvent}
                        className="mt-2 border-primary text-primary"
                      >
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Create Event
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedEvents.map((event) => {
                const progress = calculateProgress(event);
                const totalSold = event.tickets.reduce((sum, t) => sum + t.sold, 0);
                const totalQty = event.tickets.reduce((sum, t) => sum + t.quantity, 0);

                return (
                  <TableRow
                    key={event.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900 cursor-pointer"
                    onClick={() => onViewEvent(event)}
                  >
                    <TableCell className="py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex-shrink-0 overflow-hidden"
                          style={{ backgroundColor: event.bannerColor || "#f0f0f0" }}
                        >
                          <Image
                            src={event.coverImage}
                            alt={event.name}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-sm truncate">{event.name}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            by {event.organizerName}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center text-sm">
                        <CalendarDays className="h-4 w-4 text-muted-foreground mr-1.5" />
                        <span className="whitespace-nowrap">
                          {format(new Date(event.startDate), "dd MMM")}
                          {event.startDate !== event.endDate && (
                            <span className="text-muted-foreground"> - {format(new Date(event.endDate), "dd MMM")}</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center text-sm">
                        <MapPin className="h-4 w-4 text-muted-foreground mr-1.5" />
                        <span className="truncate max-w-[150px]">{event.location}</span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center">
                        <span className="text-sm font-medium">{event.tickets.length}</span>
                        <span className="text-xs text-muted-foreground ml-1">
                          {event.tickets.filter((t) => t.type === "paid").length} paid
                          {event.tickets.filter((t) => t.type === "free").length > 0 && (
                            <span className="ml-1">/ {event.tickets.filter((t) => t.type === "free").length} free</span>
                          )}
                          {event.tickets.filter((t) => t.type === "invite").length > 0 && (
                            <span className="ml-1">/ {event.tickets.filter((t) => t.type === "invite").length} invite</span>
                          )}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <span className="text-sm font-medium">{event.totalCapacity.toLocaleString()}</span>
                    </TableCell>
                    <TableCell className="py-4">
                      <Badge
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                          getStatusColor(event.status)
                        )}
                      >
                        {getStatusBadgeText(event.status)}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        <div className="relative w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground w-10 text-right">
                          {progress}%
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {totalSold.toLocaleString()} / {totalQty.toLocaleString()} sold
                      </div>
                    </TableCell>
                    <TableCell className="py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <BsThreeDots className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onViewEvent(event)}>
                            <Ticket className="mr-2 h-4 w-4" />
                            View Details
                          </DropdownMenuItem>
                          {event.status === "draft" && (
                            <DropdownMenuItem onClick={() => onEditEvent(event)}>
                              <EditIcon className="mr-2 h-4 w-4" />
                              Edit Event
                            </DropdownMenuItem>
                          )}
                          {event.status === "published" && (
                            <DropdownMenuItem className="text-[#E40101]">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Unpublish
                            </DropdownMenuItem>
                          )}
                          {event.status === "draft" && (
                            <DropdownMenuItem
                              className="bg-[#005B1414] text-[#53DC19] hover:bg-[#53DC19] hover:text-white"
                              onClick={() => {
                                toast.success(`"${event.name}" published successfully`);
                                onEditEvent(event);
                              }}
                            >
                              <Ticket className="mr-2 h-4 w-4" />
                              Publish Event
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-4 space-x-2">
          <span className="text-sm text-muted-foreground">
            {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, totalCount)} of {totalCount}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
          >
            <CalendarIcon className="h-4 w-4" style={{ transform: "rotate(180deg)" }} />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
            .reduce<(number | "...")[]>((acc, p, i, arr) => {
              if (i > 0 && p - (arr[i - 1] as number) > 1) acc.push("...");
              acc.push(p);
              return acc;
            }, [])
            .map((page, index) => {
              if (page === "...") {
                return <span key={index} className="px-2 text-sm">...</span>;
              }
              return (
                <Button
                  key={index}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  disabled={currentPage === page}
                  className={currentPage === page ? "bg-primary" : ""}
                >
                  {page}
                </Button>
              );
            })}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage >= totalPages}
          >
            <CalendarIcon className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
