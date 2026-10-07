"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AnalyticsMetric } from "./_components/AnalyticsMetric";
import ProductsIcon from "@/components/svgIcons/ProductsIcon";
import LowStock from "@/components/svgIcons/LowStock";
import OutOfStock from "@/components/svgIcons/OutOfStock";
import PendingDispatch from "@/components/svgIcons/PendingDispatch";
import { MessageCircle, MonitorSmartphone, ShoppingBag, WalletCards } from "lucide-react";
import { useState } from "react";

const dateRanges = [{ value: "today", label: "Today" }, { value: "7_days", label: "Last 7 days" }, { value: "30_days", label: "Last 30 days" }, { value: "6_months", label: "Last 6 months" }, { value: "year", label: "Last year" }];
const metrics = [{ title: "Total revenue", icon1: <ProductsIcon /> }, { title: "Processed orders", icon1: <LowStock /> }, { title: "Out for delivery", icon1: <OutOfStock /> }, { title: "Average order value", icon1: <PendingDispatch /> }];
const channels = [{ label: "Website storefront", icon: ShoppingBag }, { label: "WhatsApp AI", icon: MessageCircle }, { label: "Web chat widget", icon: MonitorSmartphone }];

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("30_days");
  const selectedRangeLabel = dateRanges.find((range) => range.value === selectedRange)?.label;

  return (
    <div className="mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Performance</p><h1 className="mt-2 text-2xl font-semibold tracking-tight">Analytics</h1><p className="mt-1 text-sm text-muted-foreground">Track revenue, orders, channels and abandoned checkout flows as data becomes available.</p></div><Select value={selectedRange} onValueChange={setSelectedRange}><SelectTrigger className="w-full sm:w-[170px]"><SelectValue placeholder="Date range" /></SelectTrigger><SelectContent>{dateRanges.map((range) => <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>)}</SelectContent></Select></div>

      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{metrics.map((metric) => <AnalyticsMetric key={metric.title} metric={{ ...metric, value: "—" }} />)}</div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Card className="shadow-none"><CardHeader className="border-b"><div className="flex items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Channel analytics</p><h2 className="mt-2 text-sm font-semibold">Sales channel performance</h2></div><Badge variant="outline" className="border-primary/20 text-primary">{selectedRangeLabel}</Badge></div></CardHeader><CardContent className="grid gap-4 p-5 lg:grid-cols-3">{channels.map(({ label, icon: Icon }) => <div key={label} className="rounded-lg border p-4"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><Icon className="h-5 w-5" /></div><p className="text-sm font-medium">{label}</p></div><p className="mt-5 text-lg font-semibold">No data yet</p><div className="mt-3 space-y-2 text-xs text-muted-foreground"><div className="flex justify-between"><span>Orders</span><span>—</span></div><div className="flex justify-between"><span>Revenue</span><span>—</span></div><div className="flex justify-between"><span>AOV</span><span>—</span></div></div><Progress value={0} className="mt-4" /></div>)}</CardContent></Card>

          <Card className="shadow-none"><CardHeader className="border-b"><div className="flex items-center gap-2"><WalletCards className="h-4 w-4 text-primary" /><h2 className="text-sm font-semibold">Abandoned checkout flows</h2></div><p className="text-xs text-muted-foreground">Website, WhatsApp and web chat flows will be separated here.</p></CardHeader><CardContent className="flex min-h-48 items-center justify-center p-5 text-center"><div><p className="text-sm font-medium">No abandoned flows yet</p><p className="mt-1 text-xs text-muted-foreground">There is no checkout activity for this period.</p></div></CardContent></Card>
        </div>

        <Card className="shadow-none"><CardHeader className="border-b"><p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Customer insights</p><h2 className="mt-2 text-sm font-semibold">Customers by country</h2></CardHeader><CardContent className="flex min-h-48 items-center justify-center p-5 text-center"><div><p className="text-sm font-medium">No customer location data yet</p><p className="mt-1 text-xs text-muted-foreground">Country and regional activity will appear here after orders and storefront visits are recorded.</p></div></CardContent></Card>
      </div>
    </div>
  );
}
