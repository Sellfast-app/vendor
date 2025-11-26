"use client";

import { Button } from "@/components/ui/button";
import React, { JSX, useState, useEffect } from "react";
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
import AnalyticsTabs from "./_components/AnalyticsTabs";
import StorefrontVisitsChart from "./_components/StoreFrontVisitChart";
import { ExportModal } from "@/components/ExportModal";
import CustomerInsightsModal from './_components/CustomerInsightsModal';
import ViewPerformanceModal from './_components/ViewPerformanceModal';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

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
  const [viewPerformance, setViewPerformance] = useState<ViewPerformanceData>({
    totalViews: 0,
    viewsToday: 0,
    avgViewsPerDay: 0
  });
  const [loading, setLoading] = useState(false);

  // Fetch view performance data
  const fetchViewPerformance = async () => {
    setLoading(true);
    try {
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const queryParams = new URLSearchParams({ startDate });
      const url = `/api/analytics?${queryParams}`;
      
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });
      const result = await res.json();

      if (res.ok && result.status === 'success') {
        const data = result.data;
        setViewPerformance({
          totalViews: data.totalViews || 0,
          viewsToday: data.viewsToday || 0,
          avgViewsPerDay: data.avgViewsPerDay || 0
        });
      }
    } catch (error) {
      console.error('Error fetching view performance:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchViewPerformance();
  }, []);

  const overviewMetrics: OverviewMetric[] = [
    {
      id: "total-revenue",
      icon1: <ProductsIcon />,
      title: "Total Revenue",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Net after refunds:",
      value2: "17,900,890"
    },
    {
      id: "processed-orders",
      icon1: <LowStock />,
      title: "Processed Orders",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Top category",
      value2: "Short Cake"
    },
    {
      id: "out-for-delivery",
      icon1: <OutOfStock />,
      title: "Out for Delivery",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Average time:",
      value2: "2 days(Kwik:1day)"
    },
    {
      id: "total-views",
      icon1: <PendingDispatch />,
      title: "Total Views",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Retention:",
      value2: "45%(repeat buyers)"
    },
    {
      id: "avg-order-value",
      icon1: <OutOfStock />,
      title: "Avg. Order Value",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Total Order Value:",
      value2: "50,900,890"
    },
    {
      id: "total-orders",
      icon1: <PendingDispatch />,
      title: "Total Orders",
      value: "0",
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

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-col">
          <h3 className="text-sm font-bold">Analytics</h3>
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">Last 30 Days</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Last Week</DropdownMenuItem>
              <DropdownMenuItem>Custom</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setIsExportModalOpen(true)}>
            <RiShare2Fill /> <span className="hidden sm:inline ml-2">Export</span>
          </Button>
        </div>
      </div>
      <div className="flex w-full gap-3 flex-col xl:flex-row">
        <div className="w-full xl:w-[35%]">
          <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F] w-full mb-4">
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs">Active Customers in Location</span>
                <Map />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col">
                  <span className="text-lg font-medium">7,269</span>
                  <span className="text-[#53DC19] text-xs">-8,72% vs. previous</span>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[#A0A0A0] text-xs">Customers Acquired:</span>
                  <span className="text-[#A0A0A0] text-xs"> <span className="text-black">972</span>(this week)</span>
                </div>
              </div>

              {locationData.map((location) => (
                <div key={location.id} className="flex items-center gap-4 w-full mb-4">
                  {location.flag}
                  <div className="flex flex-col gap-2 w-[90%]">
                    <div className="flex items-center justify-between text-sm">
                      <span>{location.name}</span>
                      <span>{location.percentage}%</span>
                    </div>
                    <Progress value={location.percentage} />
                  </div>
                </div>
              ))}
            </CardContent>
            <CardFooter className="text-sm flex items-center justify-center gap-1 text-primary border-t"
              onClick={() => setIsCustomerInsightsOpen(true)}>
              <span>
                See Details
              </span>
              <ArrowRight className="w-4 h-4" />
            </CardFooter>
          </Card>
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
                {/* what we will have here is total views */}
                <span className="text-center text-lg font-medium">
                  {loading ? "Loading..." : viewPerformance.totalViews.toLocaleString()}
                </span>
                <span className="text-[#A0A0A0] text-xs">Since Yesterday</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 mt-4">
                <div className="flex items-center justify-between  text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-2 bg-primary rounded-lg" />
                    <p >Total Views per day</p>
                  </span>
                  {/* what we will have here is viewsToday */}
                  <span>{loading ? "..." : viewPerformance.viewsToday.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between  text-xs">
                  <span className="flex items-center gap-2">
                    <span className="w-5 h-2 bg-primary/20 rounded-lg" />
                    {/* what we will have here is avgViewsPerDay */}
                    <p >Avg. Views per day</p>
                  </span>
                  <span>{loading ? "..." : viewPerformance.avgViewsPerDay.toLocaleString()}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="text-sm flex items-center justify-center gap-1 text-primary border-t"
              onClick={() => setIsViewPerformanceOpen(true)}>
              <span>
                See Details
              </span>
              <ArrowRight className="w-4 h-4" />
            </CardFooter>
          </Card>
          <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]"><StorefrontVisitsChart />
          </Card>
        </div>
        <div className="space-y-8 w-full xl:w-[65%]">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
            {overviewMetrics.map((metric) => (
              <AnalyticsMetric key={metric.id} metric={metric} />
            ))}
          </div>
          <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
            <CardContent>
              <AnalyticsTabs />
            </CardContent>
          </Card>
        </div>
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