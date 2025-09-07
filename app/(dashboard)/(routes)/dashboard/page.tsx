"use client";

import { Button } from "@/components/ui/button";
import React, { JSX, useState } from "react";
import { RiShare2Fill } from "react-icons/ri";
// import { ExportModal } from "../../_components/ExportModal";
import { OverviewMetric } from "./_components/OverviewMetric";
import TotalSales from "@/components/svgIcons/TotalSales";
import TotalSalesChart from "@/components/svgIcons/TotalSalesChart";
import TotalProducts from "@/components/svgIcons/TotalProducts";
import TotalProductsChart from "@/components/svgIcons/TotalProductsChart";
import TotalOrders from "@/components/svgIcons/TotalOrders";
import TotalOrdersChart from "@/components/svgIcons/TotalOrdersChart";
import { PlusIcon } from "lucide-react";
import TotalRevenue from "@/components/svgIcons/TotalRevenue";
import TotalRevenueChart from "@/components/svgIcons/TotalRevenueChart";
import CancelledOrders from "@/components/svgIcons/CancelledOrders";
import CancelledOrdersChart from "@/components/svgIcons/CancelledOrdersChart";
import PendingOrders from "@/components/svgIcons/PendingOrders";
import PendingOrdersChart from "@/components/svgIcons/PendingOrdersChart";
import CompletedOrders from "@/components/svgIcons/CompletedOrders";
import CompletedOrdersChart from "@/components/svgIcons/CompletedOrdersChart";
import Rating from "@/components/svgIcons/Rating";
import RatingChart from "@/components/svgIcons/RatingChart";
import SalesRevenueChart from "./_components/SalesRevenueChart";
import BestSellingProducts from "./_components/BestSellingProducts";

interface OverviewMetric {
  id: string;
  icon1: JSX.Element;
  title: string;
  value: string | number;
  change: number;
  changeType: "positive" | "negative";
  icon2: JSX.Element;
}

function DashboardPage() {
  const [, setIsExportModalOpen] = useState(false);


  const overviewMetrics: OverviewMetric[] = [
    {
      id: "total-sales",
      icon1: <TotalSales />,
      title: "Total Sales",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <TotalSalesChart />,
    },
    {
      id: "total-products",
      icon1: <TotalProducts />,
      title: "Total Products",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <TotalProductsChart />,
    },
    {
      id: "total-orders",
      icon1: <TotalOrders />,
      title: "Total Orders",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <TotalOrdersChart />,
    },
    {
      id: "total-revenue",
      icon1: <TotalRevenue />,
      title: "Total Revenue",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <TotalRevenueChart />,
    },
    {
      id: "cancelled-orders",
      icon1: <CancelledOrders />,
      title: "Cancelled Orders",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <CancelledOrdersChart />,
    },
    {
      id: "pending-orders",
      icon1: <PendingOrders />,
      title: "Pending Orders",
      value: "0",
      change: 22.7,
      changeType: "negative",
      icon2: <PendingOrdersChart />,
    },
    {
      id: "completed-orders",
      icon1: <CompletedOrders />,
      title: "Completed Orders",
      value: "0",
      change: 22.7,
      changeType: "negative",
      icon2: <CompletedOrdersChart />,
    },
    {
      id: "average-rating",
      icon1: <Rating />,
      title: "Average Store Rating",
      value: "0",
      change: 22.7,
      changeType: "negative",
      icon2: <RatingChart />,
    },
  ]

  // const fieldOptions = [
  //   // ...secondaryMetrics.map((metric) => ({
  //   //   label: metric.title,
  //   //   value: metric.id,
  //   // })),
  //   { label: "Fixtures Table & Data", value: "Fixtures Table & Data" },
  //   { label: "Game Week Table & Data", value: "Game Week Table & Data" },
  //   { label: "Competitions Table & Data", value: "Competitions Table & Data" },
  //   { label: "Best XI Table & Data", value: "Best XI Table & Data" },
  // ];

  // const handleExport = (data: {
  //   dateRangeFrom: string;
  //   dateRangeTo: string;
  //   format: string;
  //   fields: Record<string, boolean>;
  // }) => {
  //   console.log("Export data:", data);
  //   // Placeholder: Integrate with backend to export data as CSV or Excel
  // };

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-col">
          <h3 className="text-sm font-bold">Overview</h3>
        </div>
        <div className="flex gap-2">
          <Button variant={"outline"} onClick={() => setIsExportModalOpen(true)} className="border-[#F5F5F5] dark:border-[#1F1F1F]">
            <RiShare2Fill /> Export
          </Button>
          <Button > <PlusIcon /> Add Product</Button>
        </div>
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {overviewMetrics.map((metric) => (
            <OverviewMetric key={metric.id} metric={metric} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4 mt-8">
          <SalesRevenueChart />
          <BestSellingProducts />
        </div>
      </div>
      {/* <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        fieldOptions={fieldOptions}
        title="Teams & Leagues" // Set the dynamic part of the title 
      /> */}
    </div>
  );
}

export default DashboardPage;