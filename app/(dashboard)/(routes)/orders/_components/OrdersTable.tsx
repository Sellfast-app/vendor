"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CalendarDays, Filter, MessageCircle, MonitorSmartphone, Search, ShoppingBag, X } from "lucide-react";

type Order = {
  id: string;
  order_number: string;
  order_status: string;
  order_total: number | string;
  order_total_quantity: number;
  payment_status: string;
  payment_method: string;
  sales_channel: "website" | "whatsapp" | "web_chat";
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  delivery_method: string;
  delivery_fee?: number | string;
  created_at: string;
  order_items?: Array<{ name?: string; product_name?: string; quantity?: number }>;
};

type Summary = {
  total: number;
  pending: number;
  processing: number;
  ready: number;
  shipped: number;
  delivered: number;
  cancelled: number;
  website: number;
  whatsapp: number;
  web_chat: number;
};

type OrdersResponse = {
  status: string;
  message?: string;
  data?: { items: Order[]; total: number; totalPages: number; summary?: Summary };
};

const channels = [
  { id: "all", label: "All channels", icon: ShoppingBag },
  { id: "website", label: "Website", icon: ShoppingBag },
  { id: "whatsapp", label: "WhatsApp AI", icon: MessageCircle },
  { id: "web_chat", label: "Web chat", icon: MonitorSmartphone },
] as const;

const statuses = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "processing", label: "Processing" },
  { id: "ready", label: "Ready" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
] as const;

const emptySummary: Summary = {
  total: 0, pending: 0, processing: 0, ready: 0, shipped: 0,
  delivered: 0, cancelled: 0, website: 0, whatsapp: 0, web_chat: 0,
};

function money(value: number | string) {
  return `NGN ${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

function channelLabel(channel: Order["sales_channel"]) {
  if (channel === "whatsapp") return "WhatsApp AI";
  if (channel === "web_chat") return "Web chat";
  return "Website";
}

function statusTone(status: string) {
  switch (status.toLowerCase()) {
    case "delivered": return "border-green-200 bg-green-50 text-green-800";
    case "cancelled": return "border-red-200 bg-red-50 text-red-800";
    case "processing": case "ready": case "shipped": return "border-blue-200 bg-blue-50 text-blue-800";
    default: return "border-amber-200 bg-amber-50 text-amber-800";
  }
}

export default function OrdersTable() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [summary, setSummary] = useState<Summary>(emptySummary);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [channel, setChannel] = useState<string>("all");
  const [status, setStatus] = useState<string>("all");
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [deliveryMethod, setDeliveryMethod] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 250);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), pageSize: "20" });
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (channel !== "all") params.set("sales_channel", channel);
    if (status !== "all") params.set("order_status", status);
    if (paymentStatus !== "all") params.set("payment_status", paymentStatus);
    if (deliveryMethod !== "all") params.set("delivery_method", deliveryMethod);
    if (dateFrom) params.set("date_from", new Date(`${dateFrom}T00:00:00`).toISOString());
    if (dateTo) params.set("date_to", new Date(`${dateTo}T23:59:59.999`).toISOString());

    try {
      const response = await fetch(`/api/orders?${params}`, { cache: "no-store" });
      const result = await response.json() as OrdersResponse;
      if (!response.ok || result.status !== "success" || !result.data) {
        throw new Error(result.message || "Unable to load orders");
      }
      setOrders(Array.isArray(result.data.items) ? result.data.items : []);
      setTotal(Number(result.data.total || 0));
      setTotalPages(Number(result.data.totalPages || 0));
      setSummary({ ...emptySummary, ...result.data.summary });
    } catch (fetchError) {
      setOrders([]);
      setTotal(0);
      setTotalPages(0);
      setError(fetchError instanceof Error ? fetchError.message : "Unable to load orders");
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch, channel, status, paymentStatus, deliveryMethod, dateFrom, dateTo]);

  useEffect(() => { void fetchOrders(); }, [fetchOrders]);

  const resetFilters = () => {
    setSearch("");
    setChannel("all");
    setStatus("all");
    setPaymentStatus("all");
    setDeliveryMethod("all");
    setDateFrom("");
    setDateTo("");
    setPage(1);
  };

  const metrics = [
    { label: "Total orders", value: summary.total },
    { label: "Pending", value: summary.pending },
    { label: "Delivered", value: summary.delivered },
    { label: "Cancelled", value: summary.cancelled },
  ];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <div key={metric.label} className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">{metric.label}</p>
          {loading && total === 0 ? <Skeleton className="mt-2 h-7 w-16" /> : <p className="mt-2 text-xl font-semibold tabular-nums">{metric.value.toLocaleString()}</p>}
        </div>)}
      </div>

      <div className="flex flex-wrap gap-2 border-b">
        {channels.map(({ id, label, icon: Icon }) => {
          const count = id === "website" ? summary.website : id === "whatsapp" ? summary.whatsapp : id === "web_chat" ? summary.web_chat : summary.total;
          return <Button key={id} variant="ghost" onClick={() => { setChannel(id); setPage(1); }} className={`h-10 shrink-0 rounded-none border-b-2 px-3 text-xs ${channel === id ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
            <Icon className="mr-2 h-4 w-4" />{label}<span className="ml-2 tabular-nums">{count}</span>
          </Button>;
        })}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search order number or customer" className="pl-9 pr-9" />
          {search && <Button aria-label="Clear search" title="Clear search" variant="ghost" size="icon" className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2" onClick={() => setSearch("")}><X className="h-4 w-4" /></Button>}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{total.toLocaleString()} orders</span>
          <Button variant="outline" onClick={() => setShowFilters((current) => !current)}><Filter className="mr-2 h-4 w-4" />Filters</Button>
        </div>
      </div>

      {showFilters && <div className="grid gap-3 rounded-md border p-3 sm:grid-cols-2 xl:grid-cols-4">
        <Select value={status} onValueChange={(value) => { setStatus(value); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Order status" /></SelectTrigger><SelectContent>{statuses.map((item) => <SelectItem key={item.id} value={item.id}>{item.id === "all" ? "All order statuses" : item.label}</SelectItem>)}</SelectContent>
        </Select>
        <Select value={paymentStatus} onValueChange={(value) => { setPaymentStatus(value); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Payment status" /></SelectTrigger><SelectContent>
            <SelectItem value="all">All payment statuses</SelectItem><SelectItem value="completed">Paid</SelectItem><SelectItem value="pending">Pending</SelectItem><SelectItem value="failed">Failed</SelectItem><SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>
        <Select value={deliveryMethod} onValueChange={(value) => { setDeliveryMethod(value); setPage(1); }}>
          <SelectTrigger><SelectValue placeholder="Delivery method" /></SelectTrigger><SelectContent>
            <SelectItem value="all">All delivery methods</SelectItem><SelectItem value="vendor">Vendor delivery</SelectItem><SelectItem value="pickup">Pickup</SelectItem><SelectItem value="platform">Platform delivery</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-2"><CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" /><Input aria-label="From date" type="date" value={dateFrom} onChange={(event) => { setDateFrom(event.target.value); setPage(1); }} /><Input aria-label="To date" type="date" value={dateTo} onChange={(event) => { setDateTo(event.target.value); setPage(1); }} /></div>
        <Button type="button" variant="ghost" className="sm:col-span-2 xl:col-span-4 sm:justify-self-end" onClick={resetFilters}>Clear filters</Button>
      </div>}

      <div className="rounded-md border">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Order</TableHead><TableHead>Customer</TableHead><TableHead>Items</TableHead><TableHead>Channel</TableHead><TableHead>Date</TableHead><TableHead>Payment</TableHead><TableHead>Delivery</TableHead><TableHead className="text-right">Total</TableHead><TableHead>Status</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {loading ? Array.from({ length: 6 }).map((_, index) => <TableRow key={`skeleton-${index}`}>{Array.from({ length: 9 }).map((__, cell) => <TableCell key={cell}><Skeleton className="h-4 w-20" /></TableCell>)}</TableRow>)
              : error ? <TableRow><TableCell colSpan={9} className="h-40 text-center"><p className="text-sm font-medium">Orders could not be loaded</p><p className="mt-1 text-xs text-muted-foreground">{error}</p><Button className="mt-3" variant="outline" size="sm" onClick={() => void fetchOrders()}>Retry</Button></TableCell></TableRow>
              : orders.length === 0 ? <TableRow><TableCell colSpan={9} className="h-40 text-center"><p className="text-sm font-medium">{total === 0 && channel === "all" && status === "all" && !search ? "No orders yet" : "No matching orders"}</p><p className="mt-1 text-xs text-muted-foreground">{total === 0 && channel === "all" && status === "all" && !search ? "Completed sales from your store channels will appear here." : "Try changing or clearing the selected filters."}</p></TableCell></TableRow>
              : orders.map((order) => <TableRow key={order.id} role="link" tabIndex={0} className="cursor-pointer" onClick={() => router.push(`/orders/${order.id}`)} onKeyDown={(event) => { if (event.key === "Enter") router.push(`/orders/${order.id}`); }}>
                <TableCell><span className="font-medium">{order.order_number}</span></TableCell>
                <TableCell><div className="max-w-48 truncate font-medium">{order.customer_name || "Customer"}</div><div className="text-xs text-muted-foreground">{order.customer_phone || order.customer_email || ""}</div></TableCell>
                <TableCell>{Number(order.order_total_quantity || 0)} items</TableCell>
                <TableCell>{channelLabel(order.sales_channel || "website")}</TableCell>
                <TableCell>{new Date(order.created_at).toLocaleDateString()}</TableCell>
                <TableCell><span className="capitalize">{order.payment_status === "completed" ? "Paid" : order.payment_status}</span></TableCell>
                <TableCell className="capitalize">{order.delivery_method === "platform" ? "Platform" : order.delivery_method}</TableCell>
                <TableCell className="text-right font-medium tabular-nums">{money(order.order_total)}</TableCell>
                <TableCell><Badge variant="outline" className={`capitalize ${statusTone(order.order_status)}`}>{order.order_status}</Badge></TableCell>
              </TableRow>)}
          </TableBody>
        </Table>
        <div className="flex flex-col gap-2 border-t px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">Page {totalPages === 0 ? 0 : page} of {totalPages}</p>
          <div className="flex gap-2"><Button size="sm" variant="outline" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page <= 1 || loading}>Previous</Button><Button size="sm" variant="outline" onClick={() => setPage((current) => Math.min(totalPages, current + 1))} disabled={page >= totalPages || loading}>Next</Button></div>
        </div>
      </div>
    </div>
  );
}
