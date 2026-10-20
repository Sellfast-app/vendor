"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import ProductsIcon from "@/components/svgIcons/ProductsIcon";
import LowStock from "@/components/svgIcons/LowStock";
import OutOfStock from "@/components/svgIcons/OutOfStock";
import PendingDispatch from "@/components/svgIcons/PendingDispatch";
import { AlertCircle, MessageCircle, MonitorSmartphone, RefreshCw, ShoppingBag } from "lucide-react";
import { AnalyticsMetric } from "./_components/AnalyticsMetric";
import { calculateDateRange } from "./utils";

const dateRanges = [
  { value: "today", label: "Today" },
  { value: "last_week", label: "Last 7 days" },
  { value: "30_days", label: "Last 30 days" },
  { value: "6_months", label: "Last 6 months" },
  { value: "last_year", label: "Last year" },
] as const;

const channelDefinitions = [
  { id: "website", label: "Website storefront", icon: ShoppingBag },
  { id: "whatsapp", label: "WhatsApp AI", icon: MessageCircle },
  { id: "web_chat", label: "Web chat widget", icon: MonitorSmartphone },
] as const;

type Channel = { sales_channel: string; orders: number | string; revenue: number | string; average_order_value: number | string };
type DailyPoint = { date: string; orders: number | string; revenue: number | string };
type Country = { country: string; orders: number | string };
type ChannelActivity = {
  linkInBioViews: number | string;
  linkInBioClicks: number | string;
  webChatSessions: number | string;
  webChatMessages: number | string;
};
type AnalyticsData = {
  totals: {
    revenue: number | string;
    orders: number | string;
    delivered_orders: number | string;
    pending_orders: number | string;
    out_for_delivery: number | string;
    average_order_value: number | string;
  };
  channels: Channel[];
  daily: DailyPoint[];
  countries: Country[];
  channelActivity?: ChannelActivity;
  abandonedCheckout: { available: boolean; reason?: string; started?: number | string; abandoned?: number | string; submitted?: number | string; minimumAgeMinutes?: number };
};

type AnalyticsResponse = { status: string; message?: string; data?: { v2Analytics?: AnalyticsData } };

function number(value: number | string | undefined) {
  return Number(value || 0);
}

function money(value: number | string | undefined) {
  return `NGN ${number(value).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
}

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState<(typeof dateRanges)[number]["value"]>("30_days");
  const [revenueRange, setRevenueRange] = useState<(typeof dateRanges)[number]["value"]>("30_days");
  const [channelRange, setChannelRange] = useState<(typeof dateRanges)[number]["value"]>("30_days");
  const [abandonedRange, setAbandonedRange] = useState<(typeof dateRanges)[number]["value"]>("30_days");
  const [countryRange, setCountryRange] = useState<(typeof dateRanges)[number]["value"]>("30_days");
  const [dataByRange, setDataByRange] = useState<Partial<Record<(typeof dateRanges)[number]["value"], AnalyticsData>>>({});
  const [loadingRanges, setLoadingRanges] = useState<Partial<Record<(typeof dateRanges)[number]["value"], boolean>>>({});
  const [errorsByRange, setErrorsByRange] = useState<Partial<Record<(typeof dateRanges)[number]["value"], string>>>({});

  const loadAnalytics = useCallback(async (range: (typeof dateRanges)[number]["value"], force = false) => {
    if (!force && dataByRange[range]) return;
    const { startDate, endDate } = calculateDateRange(range);
    setLoadingRanges((current) => ({ ...current, [range]: true }));
    setErrorsByRange((current) => ({ ...current, [range]: "" }));
    try {
      const query = new URLSearchParams({ startDate, endDate });
      const response = await fetch(`/api/analytics?${query}`, { cache: "no-store" });
      const result = await response.json() as AnalyticsResponse;
      if (!response.ok || result.status !== "success" || !result.data?.v2Analytics) {
        throw new Error(result.message || "Unable to load analytics");
      }
      setDataByRange((current) => ({ ...current, [range]: result.data!.v2Analytics! }));
    } catch (loadError) {
      setErrorsByRange((current) => ({ ...current, [range]: loadError instanceof Error ? loadError.message : "Unable to load analytics" }));
    } finally {
      setLoadingRanges((current) => ({ ...current, [range]: false }));
    }
  }, [dataByRange]);

  const requestedRanges = useMemo(() => Array.from(new Set([selectedRange, revenueRange, channelRange, abandonedRange, countryRange])),
    [selectedRange, revenueRange, channelRange, abandonedRange, countryRange]);
  useEffect(() => { requestedRanges.forEach((range) => { void loadAnalytics(range); }); }, [requestedRanges, loadAnalytics]);

  const selectedRangeLabel = dateRanges.find((range) => range.value === selectedRange)?.label;
  const data = dataByRange[selectedRange] || null;
  const revenueData = dataByRange[revenueRange];
  const channelData = dataByRange[channelRange];
  const abandonedData = dataByRange[abandonedRange];
  const countryData = dataByRange[countryRange];
  const loading = loadingRanges[selectedRange] ?? true;
  const error = errorsByRange[selectedRange] || "";
  const totals = data?.totals;
  const metrics = [
    { title: "Revenue", value: money(totals?.revenue), icon1: <ProductsIcon />, description: selectedRangeLabel },
    { title: "Orders", value: number(totals?.orders).toLocaleString(), icon1: <LowStock />, description: `${number(totals?.delivered_orders)} delivered` },
    { title: "Out for delivery", value: number(totals?.out_for_delivery).toLocaleString(), icon1: <OutOfStock />, description: selectedRangeLabel },
    { title: "Average order value", value: money(totals?.average_order_value), icon1: <PendingDispatch />, description: "Successful payments" },
  ];
  const maxDailyRevenue = Math.max(...(revenueData?.daily || []).map((point) => number(point.revenue)), 1);
  const maxChannelOrders = Math.max(...(channelData?.channels || []).map((channel) => number(channel.orders)), 1);

  const rangeSelect = (value: (typeof dateRanges)[number]["value"], onChange: (value: (typeof dateRanges)[number]["value"]) => void) => (
    <Select value={value} onValueChange={(next) => onChange(next as typeof value)}>
      <SelectTrigger aria-label="Chart date range" className="h-8 w-[145px] text-xs"><SelectValue /></SelectTrigger>
      <SelectContent>{dateRanges.map((range) => <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>)}</SelectContent>
    </Select>
  );

  return (
    <main className="mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-medium uppercase text-primary">Performance</p><h1 className="mt-2 text-2xl font-semibold">Analytics</h1><p className="mt-1 text-sm text-muted-foreground">Sales and customer activity for your store.</p></div>
        <Select value={selectedRange} onValueChange={(value) => setSelectedRange(value as typeof selectedRange)}>
          <SelectTrigger aria-label="Summary date range" className="w-full sm:w-[180px]"><SelectValue placeholder="Summary range" /></SelectTrigger>
          <SelectContent>{dateRanges.map((range) => <SelectItem key={range.value} value={range.value}>{range.label}</SelectItem>)}</SelectContent>
        </Select>
      </header>

      {error && <div role="alert" className="mb-5 flex flex-col gap-3 rounded-md border border-destructive/30 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-2 text-sm"><AlertCircle className="h-4 w-4 text-destructive" /><span>{error}</span></div><Button size="sm" variant="outline" onClick={() => void loadAnalytics(selectedRange, true)}><RefreshCw className="mr-2 h-4 w-4" />Retry</Button></div>}

      <section aria-label="Store performance" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => <div key={metric.title}>{loading ? <Card className="shadow-none"><CardContent className="space-y-3 p-5"><Skeleton className="h-4 w-28" /><Skeleton className="h-8 w-36" /><Skeleton className="h-3 w-24" /></CardContent></Card> : <AnalyticsMetric metric={metric} />}</div>)}
      </section>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-none">
          <CardHeader className="border-b"><p className="text-xs font-medium uppercase text-primary">Discovery and engagement</p><h2 className="mt-1 text-sm font-semibold">Link-in-Bio and Web Chat activity</h2></CardHeader>
          <CardContent className="grid grid-cols-2 gap-x-6 gap-y-5 p-5 sm:grid-cols-3">
            {loading ? Array.from({ length: 5 }).map((_, index) => <Skeleton key={index} className="h-12 w-full" />) : <>
              {[
                ["Link-in-Bio views", data?.channelActivity?.linkInBioViews],
                ["Link clicks", data?.channelActivity?.linkInBioClicks],
                ["Web Chat sessions", data?.channelActivity?.webChatSessions],
                ["Web Chat messages", data?.channelActivity?.webChatMessages],
              ].map(([label, value]) => <div key={String(label)}><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums">{number(value as number | string | undefined).toLocaleString()}</p></div>)}
            </>}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase text-primary">Sales</p><h2 className="mt-1 text-sm font-semibold">Revenue over time</h2></div>{rangeSelect(revenueRange, setRevenueRange)}</div></CardHeader>
          <CardContent className="p-5">
            {loadingRanges[revenueRange] && !revenueData ? <Skeleton className="h-44 w-full" /> : revenueData?.daily.length ? <div className="overflow-x-auto"><div className="flex h-44 min-w-full items-end gap-1 border-b px-1">{revenueData.daily.map((point) => {
              const value = number(point.revenue);
              const height = value > 0 ? Math.max(4, (value / maxDailyRevenue) * 100) : 2;
              return <div key={point.date} title={`${point.date}: ${money(value)} · ${number(point.orders)} orders`} className="flex h-full min-w-[5px] flex-1 items-end"><div className="w-full rounded-t-sm bg-primary/75" style={{ height: `${height}%` }} /></div>;
            })}</div><div className="mt-2 flex justify-between text-[11px] text-muted-foreground"><span>{revenueData.daily[0]?.date}</span><span>{revenueData.daily[revenueData.daily.length - 1]?.date}</span></div></div> : errorsByRange[revenueRange] ? <div role="alert" className="flex h-44 items-center justify-center gap-2 text-sm text-destructive">{errorsByRange[revenueRange]} <Button variant="outline" size="sm" onClick={() => void loadAnalytics(revenueRange, true)}>Retry</Button></div> : <div className="flex h-44 items-center justify-center text-sm text-muted-foreground">No sales recorded for this period.</div>}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase text-primary">Channels</p><h2 className="mt-1 text-sm font-semibold">Sales channel performance</h2></div>{rangeSelect(channelRange, setChannelRange)}</div></CardHeader>
          <CardContent className="space-y-5 p-5">
            {loadingRanges[channelRange] && !channelData ? channelDefinitions.map((channel) => <div key={channel.id} className="space-y-2"><Skeleton className="h-4 w-32" /><Skeleton className="h-3 w-full" /></div>) : channelDefinitions.map(({ id, label, icon: Icon }) => {
              const channel = channelData?.channels.find((item) => item.sales_channel === id);
              const orderCount = number(channel?.orders);
              return <div key={id}><div className="flex items-center justify-between gap-3"><div className="flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /><span className="text-sm font-medium">{label}</span></div><span className="text-sm tabular-nums">{orderCount} orders</span></div><Progress className="mt-2" value={(orderCount / maxChannelOrders) * 100} /><div className="mt-2 flex justify-between gap-3 text-xs text-muted-foreground"><span>Revenue {money(channel?.revenue)}</span><span>AOV {money(channel?.average_order_value)}</span></div></div>;
            })}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase text-primary">Checkout</p><h2 className="mt-1 text-sm font-semibold">Abandoned checkout flows</h2></div>{rangeSelect(abandonedRange, setAbandonedRange)}</div></CardHeader>
          <CardContent className="flex min-h-36 items-center justify-center p-5 text-center">{loadingRanges[abandonedRange] && !abandonedData ? <Skeleton className="h-16 w-full" /> : abandonedData?.abandonedCheckout.available ? <div><p className="text-2xl font-semibold tabular-nums">{number(abandonedData.abandonedCheckout.abandoned).toLocaleString()} abandoned</p><p className="mt-2 text-xs text-muted-foreground">{number(abandonedData.abandonedCheckout.started).toLocaleString()} started · {number(abandonedData.abandonedCheckout.submitted).toLocaleString()} orders submitted</p><p className="mt-1 text-xs text-muted-foreground">Counted after {abandonedData.abandonedCheckout.minimumAgeMinutes} minutes without an order submission.</p></div> : <div><p className="text-sm font-medium">Checkout tracking is not connected</p><p className="mt-1 max-w-md text-xs text-muted-foreground">{abandonedData?.abandonedCheckout.reason || "Checkout starts and order submissions are not available for this period."}</p></div>}</CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="text-xs font-medium uppercase text-primary">Customers</p><h2 className="mt-1 text-sm font-semibold">Orders by country</h2></div>{rangeSelect(countryRange, setCountryRange)}</div></CardHeader>
          <CardContent className="space-y-3 p-5">{loadingRanges[countryRange] && !countryData ? Array.from({ length: 3 }).map((_, index) => <Skeleton key={index} className="h-5 w-full" />) : countryData?.countries.length ? countryData.countries.map((country) => <div key={country.country} className="flex items-center justify-between gap-3 text-sm"><span className="truncate">{country.country}</span><span className="tabular-nums text-muted-foreground">{number(country.orders).toLocaleString()} orders</span></div>) : errorsByRange[countryRange] ? <div role="alert" className="py-6 text-center text-sm text-destructive">{errorsByRange[countryRange]} <Button variant="outline" size="sm" onClick={() => void loadAnalytics(countryRange, true)}>Retry</Button></div> : <p className="py-6 text-center text-sm text-muted-foreground">No customer location data for this period.</p>}</CardContent>
        </Card>
      </div>
    </main>
  );
}
