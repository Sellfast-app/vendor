// Preview-only booking contract. Never use this browser ledger to authorize live entry.
export const TICKET_STORAGE_KEY = "swiftree:preview-ticket-orders:1";
export interface Admission {
  id: string;
  token: string;
  ticketTypeId: string;
  ticketName: string;
  checkedInAt: string | null;
}
export interface TicketOrder {
  version: 1;
  mode: "preview";
  id: string;
  storeId: string;
  eventId: string;
  eventName: string;
  eventDate: string;
  location: string;
  createdAt: string;
  customer: { firstName: string; lastName: string; email: string; whatsapp: string };
  total: number;
  status: "confirmed" | "cancelled";
  channel: "website";
  admissions: Admission[];
}
const nonempty = (value: unknown): value is string =>
  typeof value === "string" && value.trim().length > 0 && value.length <= 500;
const record = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export function parseTicketOrder(value: unknown): TicketOrder {
  if (!record(value) || value.version !== 1 || value.mode !== "preview" ||
    !["id", "storeId", "eventId", "eventName", "eventDate", "location", "createdAt"].every(key => nonempty(value[key])) ||
    !String(value.id).startsWith("TEST-") ||
    !Number.isFinite(Date.parse(String(value.createdAt))) ||
    !Number.isFinite(Date.parse(String(value.eventDate))) ||
    typeof value.total !== "number" || !Number.isFinite(value.total) || value.total < 0 ||
    !["confirmed", "cancelled"].includes(String(value.status)) || value.channel !== "website" ||
    !record(value.customer) ||
    !["firstName", "lastName", "email", "whatsapp"].every(key => nonempty((value.customer as Record<string, unknown>)[key])) ||
    !Array.isArray(value.admissions) || value.admissions.length < 1 || value.admissions.length > 100) {
    throw new Error("This is not a valid preview booking.");
  }
  const tokens = new Set<string>();
  const ids = new Set<string>();
  for (const item of value.admissions) {
    if (!record(item) || !["id", "token", "ticketTypeId", "ticketName"].every(key => nonempty(item[key])) ||
      !/^swiftree:test:[a-f0-9-]{36}$/.test(String(item.token)) ||
      !(item.checkedInAt === null || (typeof item.checkedInAt === "string" && Number.isFinite(Date.parse(item.checkedInAt)))) ||
      tokens.has(String(item.token)) || ids.has(String(item.id))) {
      throw new Error("The booking contains invalid or duplicate tickets.");
    }
    tokens.add(String(item.token)); ids.add(String(item.id));
  }
  return value as unknown as TicketOrder;
}

export function readTicketOrders(): TicketOrder[] {
  const raw = localStorage.getItem(TICKET_STORAGE_KEY);
  if (!raw) return [];
  const value: unknown = JSON.parse(raw);
  if (!Array.isArray(value)) throw new Error("Ticket records could not be loaded.");
  return value.map(parseTicketOrder);
}
export function writeTicketOrders(orders: TicketOrder[]) {
  localStorage.setItem(TICKET_STORAGE_KEY, JSON.stringify(orders));
}
export function mergeTicketOrder(orders: TicketOrder[], order: TicketOrder): TicketOrder[] {
  parseTicketOrder(order);
  // Re-imports must never overwrite check-in or cancellation history.
  if (orders.some(existing => existing.id === order.id)) return orders;
  const tokens = new Set(orders.flatMap(existing => existing.admissions.map(ticket => ticket.token)));
  if (order.admissions.some(ticket => tokens.has(ticket.token))) throw new Error("A ticket token already belongs to another booking.");
  return [...orders, order];
}
export function inspectAdmission(orders: TicketOrder[], token: string, eventId: string) {
  const order = orders.find(order => order.admissions.some(ticket => ticket.token === token.trim()));
  if (!order) throw new Error("Ticket not found. Check the code or import its preview booking.");
  const admission = order.admissions.find(ticket => ticket.token === token.trim())!;
  if (order.eventId !== eventId) throw new Error("This ticket is for a different event.");
  if (order.status !== "confirmed") throw new Error("This booking has been cancelled.");
  if (admission.checkedInAt) throw new Error("Already checked in at " + new Date(admission.checkedInAt).toLocaleString());
  return { order, admission };
}
export function checkInAdmission(orders: TicketOrder[], token: string, eventId: string, now: string): TicketOrder[] {
  const { admission } = inspectAdmission(orders, token, eventId);
  return orders.map(order => ({ ...order, admissions: order.admissions.map(ticket =>
    ticket.token === admission.token ? { ...ticket, checkedInAt: now } : ticket) }));
}
export function downloadBooking(order: TicketOrder) {
  const url = URL.createObjectURL(new Blob([JSON.stringify(order, null, 2)], { type: "application/json" }));
  const link = document.createElement("a");
  link.href = url; link.download = order.id + ".json"; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

