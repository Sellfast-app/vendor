"use client";

import { Button } from "@/components/ui/button";
import React, { JSX, useState } from "react";
import { RiShare2Fill } from "react-icons/ri";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import ProductsIcon from "@/components/svgIcons/ProductsIcon";
import LowStock from "@/components/svgIcons/LowStock";
import OutOfStock from "@/components/svgIcons/OutOfStock";
import PendingDispatch from "@/components/svgIcons/PendingDispatch";
import { AnalyticsMetric } from "./_components/AnalyticsMetric";
import Map from "@/components/svgIcons/Map";
import NigerianFlag from "@/components/svgIcons/NigerianFlag";
import { Progress } from "@/components/ui/progress";
import UsaFlag from "@/components/svgIcons/UsaFlag";
import { ArrowRight } from "lucide-react";
import { ExportModal } from "@/components/ExportModal";
import CustomerInsightsModal from './_components/CustomerInsightsModal';
import ViewPerformanceModal from './_components/ViewPerformanceModal';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DateRangeKey, calculateDateRange } from "./utils";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MonitorSmartphone, ShoppingBag, WalletCards } from "lucide-react";

interface OverviewMetric {
  id: string;
  icon1: JSX.Element;
  title: string;
  value: string | number;
  change: number;
  changeType: "positive" | "negative";
  title2: string;
  value2: string | number;
}

interface LocationData {
  id: string;
  name: string;
  percentage: number;
  flag: JSX.Element;
  count: number;
  coordinates: [number, number]
}

interface ViewPerformanceData {
  totalViews: number;
  viewsToday: number;
  avgViewsPerDay: number;
}

export default function AnalyticsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isCustomerInsightsOpen, setIsCustomerInsightsOpen] = useState(false);
  const [isViewPerformanceOpen, setIsViewPerformanceOpen] = useState(false);
  const [selectedRangeKey, setSelectedRangeKey] = useState<DateRangeKey>('30_days');
  const viewPerformance: ViewPerformanceData = {
    totalViews: 48240,
    viewsToday: 1234,
    avgViewsPerDay: 1608
  };

  // Get the date range strings from the utility function
  const { startDate, endDate } = calculateDateRange(selectedRangeKey);

  const dateRangeOptions = [
    { key: 'today', label: 'Today' },
    { key: '24hrs', label: 'Last 24 Hours' },
    { key: 'last_week', label: 'Last Week' },
    { key: '30_days', label: 'Last 30 Days' },
    { key: 'last_month', label: 'Last Month' },
    { key: '6_months', label: 'Last 6 Months' },
    { key: 'last_year', label: 'Last Year' },
  ];

  const overviewMetrics: OverviewMetric[] = [
    {
      id: "total-revenue",
      icon1: <ProductsIcon />,
      title: "Total Revenue",
      value: "₦12.8m",
      change: 22.7,
      changeType: "positive",
      title2: "",
      value2: ""
    },
    {
      id: "processed-orders",
      icon1: <LowStock />,
      title: "Processed Orders",
      value: "1,248",
      change: 22.7,
      changeType: "positive",
      title2: "",
      value2: ""
    },
    {
      id: "out-for-delivery",
      icon1: <OutOfStock />,
      title: "Out for Delivery",
      value: "186",
      change: 22.7,
      changeType: "positive",
      title2: "",
      value2: ""
    },
    {
      id: "total-views",
      icon1: <PendingDispatch />,
      title: "Total Views",
      value: viewPerformance.totalViews.toLocaleString(),
      change: 22.7,
      changeType: "positive",
      title2: "",
      value2: ""
    },
    {
      id: "avg-order-value",
      icon1: <OutOfStock />,
      title: "Avg. Order Value",
      value: "₦10,260",
      change: 22.7,
      changeType: "positive",
      title2: "",
      value2: ""
    },
    {
      id: "total-orders",
      icon1: <PendingDispatch />,
      title: "Total Orders",
      value: "1,730",
      change: 22.7,
      changeType: "positive",
      title2: "Avg.items/order:",
      value2: "120(1,000,000)"
    },
  ];

  // Define location data
  const locationData: LocationData[] = [
    {
      id: "lagos",
      name: "Lagos",
      count: 244,
      percentage: 72,
      flag: <NigerianFlag />,
      coordinates: [6.5244, 3.3792] as [number, number]
    },
    {
      id: "rivers",
      name: "Rivers",
      count: 239,
      percentage: 66,
      flag: <NigerianFlag />,
      coordinates: [4.8156, 7.0498] as [number, number]
    },
    {
      id: "florida",
      name: "Florida",
      count: 225,
      percentage: 60,
      flag: <UsaFlag />,
      coordinates: [27.6648, -81.5158] as [number, number]
    },
  ];

  const fieldOptions = [
    ...overviewMetrics.map((metric) => ({
      label: metric.title,
      value: metric.id,
    })),
    { label: "Payout Reports", value: "Payout Reports" },
    { label: "Customer Insights", value: "Customer Insights" },
    { label: "Active Customers in Location", value: "Active Customers in Location" },
  ];

  // Calculate progress values based on actual data
  const calculateProgressValue = (current: number, max: number = 1000) => {
    return Math.min((current / max) * 100, 100);
  };

  const channelPerformance = [
    {
      label: "Website Storefront",
      icon: ShoppingBag,
      revenue: "₦8.4m",
      orders: "862",
      aov: "₦9,744",
      progress: 78,
    },
    {
      label: "WhatsApp AI",
      icon: MessageCircle,
      revenue: "₦2.7m",
      orders: "314",
      aov: "₦8,599",
      progress: 48,
    },
    {
      label: "Web Chat Widget",
      icon: MonitorSmartphone,
      revenue: "₦1.7m",
      orders: "210",
      aov: "₦8,095",
      progress: 34,
    },
  ];

  const abandonedFlows = [
    ["Website checkout", "128 carts", "₦1.9m potential"],
    ["WhatsApp conversation", "74 flows", "₦820k potential"],
    ["Web chat checkout", "39 flows", "₦410k potential"],
  ];

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-col">
          <h3 className="text-sm font-bold">Analytics</h3>
          <p className="text-xs text-gray-500 mt-1">
            Showing data from {new Date(startDate).toLocaleDateString()} to {new Date(endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="flex gap-2">
          <Select 
            onValueChange={(value: string) => setSelectedRangeKey(value as DateRangeKey)}
            defaultValue={selectedRangeKey}
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select date range" />
            </SelectTrigger>
            <SelectContent>
              {dateRangeOptions.map(option => (
                <SelectItem key={option.key} value={option.key}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsExportModalOpen(true)}>
            <RiShare2Fill /> <span className="hidden sm:inline ml-2">Export</span>
          </Button>
        </div>
      </div>
      <div className="flex w-full gap-3 flex-col xl:flex-row">
        <div className="w-full xl:w-[35%]">
          <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F] w-full mb-4">
            <CardHeader className="border-b">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs">Total View Performance</span>
                <Map />
              </div>
              <div className="flex flex-col items-center justify-center ">
                <Progress 
                  value={calculateProgressValue(viewPerformance.totalViews, 1000)} 
                  className="mb-2" 
                />
                <Progress 
                  value={calculateProgressValue(viewPerformance.avgViewsPerDay, 100)} 
                  className="mb-2" 
                />
                <span className="text-center text-lg font-medium">
                  {viewPerformance.totalViews.toLocaleString()}
                </span>
                <span className="text-[#A0A0A0] text-xs">Total views</span>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-2 bg-primary rounded-lg" />
                    <p>Total Views Today</p>
                  </span>
                  <span>{viewPerformance.viewsToday.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-2 bg-primary/20 rounded-lg" />
                    <p>Avg. Views per day</p>
                  </span>
                  <span>{viewPerformance.avgViewsPerDay.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm flex items-center justify-center border-t">
              <Button 
                variant={"ghost"} 
                className="text-sm flex items-center justify-center gap-1 text-primary" 
                onClick={() => setIsViewPerformanceOpen(true)} 
                disabled
              >
                <span>See Details</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
        <div className="space-y-8 w-full xl:w-[65%]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
            {overviewMetrics.map((metric) => (
              <AnalyticsMetric 
                key={metric.id} 
                metric={metric} 
                startDate={startDate} 
                endDate={endDate}
              />
            ))}
          </div>
        </div>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                  Channel analytics
                </p>
                <h3 className="mt-2 text-sm font-semibold">Sales channel performance</h3>
              </div>
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                Live view
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 lg:grid-cols-3">
            {channelPerformance.map((channel) => (
              <div key={channel.label} className="rounded-xl border p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <channel.icon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">{channel.label}</p>
                </div>
                <p className="mt-5 text-2xl font-semibold">{channel.revenue}</p>
                <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Orders</span>
                    <span>{channel.orders}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>AOV</span>
                    <span>{channel.aov}</span>
                  </div>
                </div>
                <Progress value={channel.progress} className="mt-4" />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <WalletCards className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold">Abandoned checkout flows</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Separated by storefront, WhatsApp and web chat origin.
            </p>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {abandonedFlows.map(([label, count, value]) => (
              <div key={label} className="flex items-center justify-between gap-4 p-4">
                <div>
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-muted-foreground">{count}</p>
                </div>
                <Badge variant="secondary">{value}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        endpointPrefix="Analytics"
        fieldOptions={fieldOptions}
        dataName="Analytics"
      />
      <CustomerInsightsModal
        isOpen={isCustomerInsightsOpen}
        onClose={() => setIsCustomerInsightsOpen(false)}
        locationData={locationData}
      />
      <ViewPerformanceModal
        isOpen={isViewPerformanceOpen}
        onClose={() => setIsViewPerformanceOpen(false)}
      />
    </div>
  );
}
