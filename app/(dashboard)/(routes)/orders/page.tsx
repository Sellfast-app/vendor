"use client";

import { Button } from "@/components/ui/button";
import React, { JSX, useState } from "react";
import { RiShare2Fill } from "react-icons/ri";
import { Card, CardContent } from "@/components/ui/card";
import TotalSalesChart from "@/components/svgIcons/TotalSalesChart";
import TotalOrdersChart from "@/components/svgIcons/TotalOrdersChart";
import CancelledOrdersChart from "@/components/svgIcons/CancelledOrdersChart";
import PendingOrdersChart from "@/components/svgIcons/PendingOrdersChart";
import { OverviewMetric } from "./_components/OverviewMetric";
import ProductsIcon from "@/components/svgIcons/ProductsIcon";
import PendingDispatch from "@/components/svgIcons/PendingDispatch";
import PendingOrdersIcon from "@/components/svgIcons/PendingOrdersIcon";
import CancelledOrders from "@/components/svgIcons/CancelledOrders";
import OrdersTable from "./_components/OrdersTable";
import { ExportModal } from "@/components/ExportModal";

interface OverviewMetric {
  id: string;
  icon1: JSX.Element;
  title: string;
  value: string | number;
  change: number;
  changeType: "positive" | "negative";
  icon2: JSX.Element;
}

function OrdersPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  const overviewMetrics: OverviewMetric[] = [
    {
      id: "total-products",
      icon1: <ProductsIcon />,
      title: "Total Orders",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <TotalSalesChart />,
    },
    {
      id: "pending-orders",
      icon1: <PendingOrdersIcon />,
      title: "Pending Orders",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <PendingOrdersChart />,
    },
    {
      id: "total-orders",
      icon1: <CancelledOrders />,
      title: "Cancelled Orders",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <CancelledOrdersChart />,
    },
    {
      id: "total-revenue",
      icon1: <PendingDispatch />,
      title: "Fulfilled Orders",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <TotalOrdersChart />,
    },
  ];

  const fieldOptions = [
    ...overviewMetrics.map((metric) => ({
      label: metric.title,
      value: metric.id,
    })),
    { label: "Customer name", value: "Customer name" },
    { label: "Price", value: "Price" },
    { label: "Quantity", value: "Quantity" },
    { label: "Escrow Log", value: "Escrow Log" },
  ];

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-col">
          <h3 className="text-sm font-bold">Orders</h3>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsExportModalOpen(true)}>
            <RiShare2Fill /> Export
          </Button>
        </div>
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {overviewMetrics.map((metric) => (
            <OverviewMetric key={metric.id} metric={metric} />
          ))}
        </div>
        <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
          <CardContent>
            <OrdersTable />
          </CardContent>
        </Card>
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        endpointPrefix="Orders"
        fieldOptions={fieldOptions}
        dataName="Orders"
      />
    </div>
  );
}

export default OrdersPage;