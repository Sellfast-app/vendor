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
import { Badge } from "@/components/ui/badge";
import { MessageCircle, MonitorSmartphone, PackageCheck, ShoppingBag } from "lucide-react";

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
      id: "total-orders",
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
      id: "cancelled-orders",
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
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-col">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Omnichannel orders
          </p>
          <h3 className="text-sm font-bold">Orders</h3>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Track orders coming from website storefront, WhatsApp AI and web chat checkout.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsExportModalOpen(true)}>
            <RiShare2Fill /> <span className="hidden sm:inline ml-2">Export</span>
          </Button>
        </div>
      </div>
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {overviewMetrics.map((metric) => (
            <OverviewMetric key={metric.id} metric={metric} />
          ))}
        </div>
        <div className="grid gap-4 lg:grid-cols-4">
          {[
            [ShoppingBag, "Website", "862 orders"],
            [MessageCircle, "WhatsApp AI", "314 orders"],
            [MonitorSmartphone, "Web Chat", "210 orders"],
            [PackageCheck, "Fulfillment", "186 active"],
          ].map(([Icon, label, value]) => (
            <Card key={label as string} className="shadow-none">
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-xs text-muted-foreground">{label as string}</p>
                  <p className="mt-2 text-lg font-semibold">{value as string}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="shadow-none border-primary/20 bg-[#F7FFF9]">
          <CardContent className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-primary/20 text-primary">V2 preview</Badge>
                <span className="text-sm font-semibold">Order routing</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Order status, payment provider, delivery method and channel source are grouped for the dashboard redesign.
              </p>
            </div>
            <Button variant="outline" onClick={() => setIsExportModalOpen(true)}>
              <RiShare2Fill /> <span className="ml-2">Export order report</span>
            </Button>
          </CardContent>
        </Card>
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
