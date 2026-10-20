export interface TicketType {
  id: string;
  name: string;
  type: "free" | "paid" | "invite";
  price?: number;
  quantity: number;
  sold: number;
  orderLimitPerPerson: number;
  tag: string;
  discount?: { type: "fixed" | "percentage"; value: number; startsAt?: string | null; endsAt?: string | null } | null;
}

export interface Event {
  id: string;
  name: string;
  description: string;
  coverImage: string;
  bannerColor?: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  organizerName: string;
  organizerEmail: string;
  organizerPhone: string;
  status: "draft" | "published" | "ended";
  tickets: TicketType[];
  totalCapacity: number;
  createdAt: string;
  updatedAt: string;
  apiStatus?: "draft" | "published";
}

type ApiTicket = {
  id: string;
  name: string;
  type: TicketType["type"];
  price?: number | string | null;
  quantity: number | string;
  sold?: number | string;
  orderLimitPerPerson: number | string;
  tag?: string;
  discount?: TicketType["discount"];
};

type ApiEvent = {
  id: string;
  name: string;
  description?: string | null;
  cover_image?: string | null;
  starts_at: string;
  ends_at: string;
  location: string;
  organizer_name?: string | null;
  organizer_email?: string | null;
  organizer_phone?: string | null;
  status: "draft" | "published";
  tickets?: ApiTicket[];
  created_at?: string;
  updated_at?: string;
};

function datePart(value: string) {
  const date = new Date(value);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function timePart(value: string) {
  const date = new Date(value);
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

export function mapApiEvent(value: ApiEvent): Event {
  const ended = value.status === "published" && Date.parse(value.ends_at) < Date.now();
  const tickets = (value.tickets || []).map((ticket) => ({
    id: ticket.id,
    name: ticket.name,
    type: ticket.type,
    price: ticket.price == null ? undefined : Number(ticket.price),
    quantity: Number(ticket.quantity),
    sold: Number(ticket.sold || 0),
    orderLimitPerPerson: Number(ticket.orderLimitPerPerson),
    tag: ticket.tag || "Single Ticket",
    discount: ticket.discount || null,
  }));
  return {
    id: value.id,
    name: value.name,
    description: value.description || "",
    coverImage: value.cover_image || "",
    startDate: datePart(value.starts_at),
    endDate: datePart(value.ends_at),
    startTime: timePart(value.starts_at),
    endTime: timePart(value.ends_at),
    location: value.location,
    organizerName: value.organizer_name || "",
    organizerEmail: value.organizer_email || "",
    organizerPhone: value.organizer_phone || "",
    status: ended ? "ended" : value.status,
    apiStatus: value.status,
    tickets,
    totalCapacity: tickets.reduce((sum, ticket) => sum + ticket.quantity, 0),
    createdAt: value.created_at || value.starts_at,
    updatedAt: value.updated_at || value.ends_at,
  };
}

export function toApiEventPayload(event: Event) {
  const startsAt = new Date(`${event.startDate}T${event.startTime || "00:00"}`).toISOString();
  const endsAt = new Date(`${event.endDate}T${event.endTime || "23:59"}`).toISOString();
  return {
    name: event.name,
    description: event.description,
    coverImage: event.coverImage || null,
    startsAt,
    endsAt,
    location: event.location,
    organizerName: event.organizerName,
    organizerEmail: event.organizerEmail,
    organizerPhone: event.organizerPhone,
    status: event.status === "ended" ? event.apiStatus || "published" : event.status,
    tickets: event.tickets.map((ticket) => ({
      ...(isUuid(ticket.id) ? { id: ticket.id } : {}),
      name: ticket.name,
      type: ticket.type,
      price: ticket.type === "invite" ? 0 : Number(ticket.price || 0),
      quantity: Number(ticket.quantity),
      orderLimitPerPerson: Number(ticket.orderLimitPerPerson),
      tag: ticket.tag,
      discount: ticket.discount || null,
    })),
  };
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

export function generateEventId() {
  return crypto.randomUUID();
}

export function generateTicketId() {
  return crypto.randomUUID();
}
