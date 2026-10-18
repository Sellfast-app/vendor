"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, MapPin, Package, ReceiptText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

type OrderItem = {
  product_name?: string;
  name?: string;
  quantity?: number;
  item_total?: number | string;
  price?: number | string;
  product_image?: string | null;
};

type Order = {
  id: string;
  order_number: string;
  order_status: string;
  order_total: number | string;
  order_total_quantity: number;
  payment_status: string;
  payment_method: string;
  sales_channel?: "website" | "whatsapp" | "web_chat";
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  customer_address?: string;
  customer_city?: string;
  customer_state?: string;
  customer_post_code?: string;
  customer_country?: string;
  delivery_notee?: string;
  delivery_method?: string;
  delivery_fee?: number | string;
  created_at: string;
  order_items?: OrderItem[];
};

type OrderDetailsResponse = {
  status: string;
  message?: string;
  data?: { order?: Order; transaction?: Record<string, unknown> | null; shipment?: Record<string, unknown> | null };
};

function money(value: number | string | undefined) {
  return `NGN ${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

function channelName(channel?: Order["sales_channel"]) {
  if (channel === "whatsapp") return "WhatsApp AI";
  if (channel === "web_chat") return "Web chat";
  return "Website";
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return <div className="flex items-start justify-between gap-4 border-b py-3 last:border-0"><dt className="text-sm text-muted-foreground">{label}</dt><dd className="max-w-[65%] text-right text-sm font-medium">{value || "Not provided"}</dd></div>;
}

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    async function loadOrder() {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/orders/${encodeURIComponent(params.id)}`, { cache: "no-store" });
        const result = await response.json() as OrderDetailsResponse;
        if (!response.ok || result.status !== "success" || !result.data?.order) {
          throw new Error(result.message || "Unable to load this order");
        }
        if (active) setOrder(result.data.order);
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Unable to load this order");
      } finally {
        if (active) setLoading(false);
      }
    }
    if (params.id) void loadOrder();
    return () => { active = false; };
  }, [params.id, retryCount]);

  return (
    <main className="mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Button variant="ghost" className="mb-5 -ml-3 gap-2" onClick={() => router.push("/orders")}><ArrowLeft className="h-4 w-4" />Back to orders</Button>
        {loading ? <div className="space-y-4"><Skeleton className="h-8 w-56" /><Skeleton className="h-32 w-full" /><Skeleton className="h-72 w-full" /></div>
          : error ? <section className="rounded-md border p-8 text-center"><h1 className="text-lg font-semibold">Order could not be loaded</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p><Button className="mt-5" variant="outline" onClick={() => setRetryCount((count) => count + 1)}>Retry</Button></section>
          : order ? <>
            <header className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="text-sm text-muted-foreground">Order details</p><h1 className="mt-1 text-2xl font-semibold">{order.order_number}</h1><p className="mt-1 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleString()}</p></div>
              <div className="flex flex-wrap gap-2"><Badge variant="outline" className="capitalize">{order.order_status}</Badge><Badge variant="secondary">{channelName(order.sales_channel)}</Badge></div>
            </header>

            <div className="grid gap-5 lg:grid-cols-[minmax(0,1.5fr)_minmax(280px,1fr)]">
              <div className="space-y-5">
                <section className="rounded-md border">
                  <div className="flex items-center gap-2 border-b px-4 py-3"><Package className="h-4 w-4" /><h2 className="text-sm font-semibold">Items ({order.order_items?.length || 0})</h2></div>
                  <div className="divide-y px-4">
                    {(order.order_items || []).map((item, index) => <div key={`${item.product_name || item.name}-${index}`} className="flex items-center justify-between gap-4 py-4">
                      <div className="flex min-w-0 items-center gap-3">{item.product_image ? <Image src={item.product_image} alt="" width={48} height={48} unoptimized className="h-12 w-12 rounded border object-cover" /> : <div className="h-12 w-12 rounded border bg-muted" />}<div className="min-w-0"><p className="truncate text-sm font-medium">{item.product_name || item.name || "Item"}</p><p className="text-xs text-muted-foreground">Qty {Number(item.quantity || 1)} · {money(item.price)}</p></div></div>
                      <p className="shrink-0 text-sm font-medium tabular-nums">{money(item.item_total ?? Number(item.price || 0) * Number(item.quantity || 1))}</p>
                    </div>)}
                    {!order.order_items?.length && <p className="py-8 text-center text-sm text-muted-foreground">No item details were returned for this order.</p>}
                  </div>
                  <div className="flex justify-between border-t px-4 py-4 text-sm font-semibold"><span>Order total</span><span className="tabular-nums">{money(order.order_total)}</span></div>
                </section>
                <section className="rounded-md border px-4 py-3">
                  <div className="mb-1 flex items-center gap-2"><MapPin className="h-4 w-4" /><h2 className="text-sm font-semibold">Delivery</h2></div>
                  <dl><DetailRow label="Method" value={order.delivery_method} /><DetailRow label="Fee" value={money(order.delivery_fee)} /><DetailRow label="Address" value={[order.customer_address, order.customer_city, order.customer_state, order.customer_post_code, order.customer_country].filter(Boolean).join(", ")} /><DetailRow label="Delivery notes" value={order.delivery_notee} /></dl>
                </section>
              </div>
              <div className="space-y-5">
                <section className="rounded-md border px-4 py-3"><div className="mb-1 flex items-center gap-2"><ReceiptText className="h-4 w-4" /><h2 className="text-sm font-semibold">Customer</h2></div><dl><DetailRow label="Name" value={order.customer_name} /><DetailRow label="Phone" value={order.customer_phone} /><DetailRow label="Email" value={order.customer_email} /></dl></section>
                <section className="rounded-md border px-4 py-3"><h2 className="mb-1 text-sm font-semibold">Payment</h2><dl><DetailRow label="Status" value={order.payment_status} /><DetailRow label="Method" value={order.payment_method} /><DetailRow label="Amount" value={money(order.order_total)} /></dl></section>
              </div>
            </div>
          </> : null}
      </div>
    </main>
  );
}
