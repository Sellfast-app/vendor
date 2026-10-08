"use client";

import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import OrdersTable from "./_components/OrdersTable";
import { CheckCircle2, CircleDashed, MessageCircle, MonitorSmartphone, PackageCheck, ShoppingBag, XCircle } from "lucide-react";

const orderMetrics = [
  { label: "Total orders", icon: ShoppingBag },
  { label: "Pending orders", icon: CircleDashed },
  { label: "Fulfilled orders", icon: CheckCircle2 },
  { label: "Cancelled orders", icon: XCircle },
];

const channels = [
  { label: "Website storefront", icon: ShoppingBag },
  { label: "WhatsApp AI", icon: MessageCircle },
  { label: "Web chat widget", icon: MonitorSmartphone },
  { label: "Fulfillment", icon: PackageCheck },
];

export default function OrdersPage() {
  return (
    <div className="mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Omnichannel operations</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight">Orders</h1>
        <Button variant="outline" asChild className="mt-3"><Link href="/orders/tickets">Ticket orders</Link></Button>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Manage orders from your website storefront, WhatsApp AI and web chat in one place.</p>
      </div>

      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {orderMetrics.map(({ label, icon: Icon }) => (
            <Card key={label} className="shadow-none">
              <CardContent className="flex items-center justify-between p-5">
                <div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-2xl font-semibold">—</p><p className="mt-1 text-xs text-muted-foreground">No data yet</p></div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="border-primary/20 bg-primary/[0.03] shadow-none">
          <CardContent className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div><div className="flex items-center gap-2"><Badge variant="outline" className="border-primary/20 text-primary">Channel routing</Badge><span className="text-sm font-semibold">One order workspace</span></div><p className="mt-2 text-xs text-muted-foreground">Channel source, payment provider, delivery method and fulfillment status will be recorded per order.</p></div>
          </CardContent>
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {channels.map(({ label, icon: Icon }) => (
            <Card key={label} className="shadow-none"><CardContent className="flex items-center justify-between p-4"><div><p className="text-xs text-muted-foreground">{label}</p><p className="mt-2 text-sm font-medium">No data yet</p></div><Icon className="h-5 w-5 text-primary" /></CardContent></Card>
          ))}
        </div>

        <Card className="shadow-none"><CardContent className="p-5"><OrdersTable /></CardContent></Card>
      </div>
    </div>
  );
}
