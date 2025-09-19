"use client";

import { Button } from "@/components/ui/button";
import React, { JSX, useState } from "react";
import { RiShare2Fill } from "react-icons/ri";
// import { ExportModal } from "../../_components/ExportModal";
import { Card, CardContent } from "@/components/ui/card";
import ProductsIcon from "@/components/svgIcons/ProductsIcon";
import LowStock from "@/components/svgIcons/LowStock";
import OutOfStock from "@/components/svgIcons/OutOfStock";
import PendingDispatch from "@/components/svgIcons/PendingDispatch";
import { AnalyticsMetric } from "./_components/AnalyticsMetric";

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

export default function AnalyticsPage() {
  const [, setIsExportModalOpen] = useState(false);

  const overviewMetrics: OverviewMetric[] = [
    {
      id: "total-products",
      icon1: <ProductsIcon />,
      title: "Total Revenue",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Net after refunds:",
      value2: "17,900,890"
    },
    {
      id: "low-stock",
      icon1: <LowStock />,
      title: "Processed Orders",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Top category",
      value2: "Short Cake"
    },
    {
      id: "total-orders",
      icon1: <OutOfStock />,
      title: "Out for Delivery",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Average time:",
      value2: "2 days(Kwik:1day)"
    },
    {
      id: "total-revenue",
      icon1: <PendingDispatch />,
      title: "Customer Growth",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Retention:",
      value2: "45%(repeat buyers)"
    },
    {
      id: "total-orders",
      icon1: <OutOfStock />,
      title: "Avg. Order Value",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Total Order Value:",
      value2: "50,900,890"
    },
    {
      id: "total-revenue",
      icon1: <PendingDispatch />,
      title: "Total Sales",
      value: "0",
      change: 22.7,
      changeType: "positive",
      title2: "Avg.sales/day:",
      value2: "120(1,000,000)"
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
          <h3 className="text-sm font-bold">Analytics</h3>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsExportModalOpen(true)}>
            <RiShare2Fill /> Export
          </Button>
        </div>
      </div>
      <div className="flex w-full">
        <div className="w-[35%]"></div>
        <div className="space-y-8 w-[60%]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-2">
          {overviewMetrics.map((metric) => (
            <AnalyticsMetric key={metric.id} metric={metric} />
          ))}
        </div>
        <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
          <CardContent>
          </CardContent>
        </Card>
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

