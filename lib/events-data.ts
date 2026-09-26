export interface TicketType {
  id: string;
  name: string;
  type: "free" | "paid" | "invite";
  price?: number;
  quantity: number;
  sold: number;
  orderLimitPerPerson: number;
  tag: string;
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
}

export const mockEvents: Event[] = [
  {
    id: "evt_001",
    name: "Detty December Concert",
    description:
      "An electrifying night of Afrobeat, Afropop, and highlife music featuring Nigeria's biggest stars. Expect non-stop hits, breathtaking performances, and an energy that will keep you dancing till dawn.",
    coverImage:
      "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800&h=400&fit=crop",
    bannerColor: "#FF6B35",
    startDate: "2026-12-20",
    endDate: "2026-12-20",
    startTime: "18:00",
    endTime: "23:59",
    location: "Eko Convention Centre, Lagos",
    organizerName: "Apex Events NG",
    organizerEmail: "hello@apexevents.ng",
    organizerPhone: "+234 801 234 5678",
    status: "published",
    totalCapacity: 5000,
    tickets: [
      {
        id: "tkt_001a",
        name: "General Admission",
        type: "paid",
        price: 5000,
        quantity: 3000,
        sold: 1247,
        orderLimitPerPerson: 4,
        tag: "Single Ticket",
      },
      {
        id: "tkt_001b",
        name: "VIP",
        type: "paid",
        price: 25000,
        quantity: 500,
        sold: 312,
        orderLimitPerPerson: 2,
        tag: "Single Ticket",
      },
      {
        id: "tkt_001c",
        name: "Press Pass",
        type: "invite",
        quantity: 50,
        sold: 48,
        orderLimitPerPerson: 1,
        tag: "Invite Only",
      },
      {
        id: "tkt_001d",
        name: "Student Gate Pass",
        type: "free",
        quantity: 1000,
        sold: 812,
        orderLimitPerPerson: 1,
        tag: "Free",
      },
    ],
    createdAt: "2026-09-15T10:00:00Z",
    updatedAt: "2026-09-22T14:30:00Z",
  },
  {
    id: "evt_002",
    name: "Lagos Tech Summit 2026",
    description:
      "West Africa's premier technology conference bringing together founders, developers, investors, and innovators. Three days of keynotes, workshops, panel discussions, and networking opportunities.",
    coverImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&h=400&fit=crop",
    bannerColor: "#0F172A",
    startDate: "2026-11-10",
    endDate: "2026-11-12",
    startTime: "09:00",
    endTime: "18:00",
    location: "Muson Centre, Oniru, Lagos",
    organizerName: "TechHub Africa",
    organizerEmail: "events@techhubafrica.io",
    organizerPhone: "+234 901 987 6543",
    status: "published",
    totalCapacity: 2000,
    tickets: [
      {
        id: "tkt_002a",
        name: "Early Bird Pass",
        type: "paid",
        price: 15000,
        quantity: 500,
        sold: 489,
        orderLimitPerPerson: 1,
        tag: "Single Ticket",
      },
      {
        id: "tkt_002b",
        name: "Standard Pass",
        type: "paid",
        price: 35000,
        quantity: 1000,
        sold: 612,
        orderLimitPerPerson: 1,
        tag: "Single Ticket",
      },
      {
        id: "tkt_002c",
        name: "VIP Summit Pass",
        type: "paid",
        price: 75000,
        quantity: 200,
        sold: 87,
        orderLimitPerPerson: 1,
        tag: "Single Ticket",
      },
      {
        id: "tkt_002d",
        name: "Speaker/Sponsor",
        type: "invite",
        quantity: 100,
        sold: 64,
        orderLimitPerPerson: 1,
        tag: "Invite Only",
      },
      {
        id: "tkt_002e",
        name: "Student Discount",
        type: "free",
        quantity: 200,
        sold: 143,
        orderLimitPerPerson: 1,
        tag: "Free",
      },
    ],
    createdAt: "2026-08-01T08:00:00Z",
    updatedAt: "2026-09-20T16:00:00Z",
  },
  {
    id: "evt_003",
    name: "Art Basel Lagos Preview",
    description:
      "A curated exhibition showcasing contemporary African art from emerging and established artists across the continent. Featuring painting, sculpture, photography, and mixed media installations.",
    coverImage:
      "https://images.unsplash.com/photo-1578301978693-85fa913c58d8?w=800&h=400&fit=crop",
    bannerColor: "#7C3AED",
    startDate: "2026-10-15",
    endDate: "2026-10-20",
    startTime: "10:00",
    endTime: "19:00",
    location: "Terra Kulture, Victoria Island, Lagos",
    organizerName: "ArtSpace Nigeria",
    organizerEmail: "info@artspacenga.com",
    organizerPhone: "+234 811 456 7890",
    status: "draft",
    totalCapacity: 500,
    tickets: [
      {
        id: "tkt_003a",
        name: "General Entry",
        type: "paid",
        price: 5000,
        quantity: 300,
        sold: 0,
        orderLimitPerPerson: 2,
        tag: "Single Ticket",
      },
      {
        id: "tkt_003b",
        name: "VIP Preview Night",
        type: "paid",
        price: 20000,
        quantity: 50,
        sold: 0,
        orderLimitPerPerson: 1,
        tag: "Single Ticket",
      },
      {
        id: "tkt_003c",
        name: "Artist/Collector",
        type: "invite",
        quantity: 30,
        sold: 0,
        orderLimitPerPerson: 1,
        tag: "Invite Only",
      },
    ],
    createdAt: "2026-09-20T12:00:00Z",
    updatedAt: "2026-09-20T12:00:00Z",
  },
  {
    id: "evt_004",
    name: "Noise Concert Tour",
    description:
      "The award-winning Afro-fusion artist brings her highly anticipated album tour to Lagos. A once-in-a-lifetime live experience blending Afrobeats, R&B, and soul.",
    coverImage:
      "https://images.unsplash.com/photo-1516450366955-9099a4a64203?w=800&h=400&fit=crop",
    bannerColor: "#DC2626",
    startDate: "2026-08-05",
    endDate: "2026-08-05",
    startTime: "20:00",
    endTime: "23:00",
    location: "O2 Arena, Ikeja, Lagos",
    organizerName: "SoundCity Productions",
    organizerEmail: "booking@soundcityng.com",
    organizerPhone: "+234 701 345 6789",
    status: "ended",
    totalCapacity: 8000,
    tickets: [
      {
        id: "tkt_004a",
        name: "Floor Seats",
        type: "paid",
        price: 10000,
        quantity: 4000,
        sold: 3950,
        orderLimitPerPerson: 2,
        tag: "Single Ticket",
      },
      {
        id: "tkt_004b",
        name: "Balcony",
        type: "paid",
        price: 5000,
        quantity: 3000,
        sold: 2980,
        orderLimitPerPerson: 2,
        tag: "Single Ticket",
      },
      {
        id: "tkt_004c",
        name: "Backstage Pass",
        type: "paid",
        price: 50000,
        quantity: 50,
        sold: 48,
        orderLimitPerPerson: 1,
        tag: "Single Ticket",
      },
    ],
    createdAt: "2026-06-01T09:00:00Z",
    updatedAt: "2026-08-06T10:00:00Z",
  },
];

export function getEventById(id: string): Event | undefined {
  return mockEvents.find((e) => e.id === id);
}

export function getEventsByStatus(status: Event["status"]): Event[] {
  return mockEvents.filter((e) => e.status === status);
}

export function generateEventId(): string {
  return `evt_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
}

export function generateTicketId(): string {
  return `tkt_${Date.now().toString(36)}`;
}
