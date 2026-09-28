"use client";

import { Button } from "@/components/ui/button";
import React, { JSX, useState, useEffect } from "react";
import { RiShare2Fill } from "react-icons/ri";
import { Card, CardContent } from "@/components/ui/card";
import TotalSalesChart from "@/components/svgIcons/TotalSalesChart";
import TotalOrdersChart from "@/components/svgIcons/TotalOrdersChart";
import CancelledOrdersChart from "@/components/svgIcons/CancelledOrdersChart";
import PendingOrdersChart from "@/components/svgIcons/PendingOrdersChart";
import { OverviewMetric } from "./_components/OverviewMetric";
import ProductsIcon from "@/components/svgIcons/ProductsIcon";
import LowStock from "@/components/svgIcons/LowStock";
import OutOfStock from "@/components/svgIcons/OutOfStock";
import PendingDispatch from "@/components/svgIcons/PendingDispatch";
import ProductsTable from "./_components/ProductsTable";
import FoodTable from "./_components/FoodTable";
import { ExportModal } from "@/components/ExportModal";
import { isFoodBusinessType } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Boxes, MessageCircle, Plus, ShoppingBag, Ticket } from "lucide-react";

interface OverviewMetric {
  id: string;
  icon1: JSX.Element;
  title: string;
  value: string | number;
  change: number;
  changeType: "positive" | "negative";
  icon2: JSX.Element;
}

function ProductsPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [businessType, setBusinessType] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        const response = await fetch('/api/store', { cache: 'no-store' });
        if (!response.ok) throw new Error('Failed to fetch store data');
        
        const result = await response.json();
        const storeDetails = result.data?.storeDetails;
        if (result.status !== 'success' || !storeDetails) {
          throw new Error(result.message || 'Store details were not returned');
        }

        setBusinessType(storeDetails.business_type || "");
      } catch (error) {
        console.error('Error fetching store data:', error);
        setBusinessType("Retail & Wholesale Store");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  const isRestaurant = isFoodBusinessType(businessType);

  const overviewMetrics: OverviewMetric[] = [
    {
      id: "total-products",
      icon1: <ProductsIcon />,
      title: isRestaurant ? "Total Food Items" : "Total Products",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <TotalSalesChart />,
    },
    {
      id: "low-stock",
      icon1: <LowStock />,
      title: isRestaurant ? "Low Stock Items" : "Low Stock",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <PendingOrdersChart/>,
    },
    {
      id: "total-orders",
      icon1: <OutOfStock />,
      title: "Total Orders",
      value: "0",
      change: 22.7,
      changeType: "positive",
      icon2: <CancelledOrdersChart />,
    },
    {
      id: "total-revenue",
      icon1: <PendingDispatch />,
      title: "Total Revenue",
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
    { label: "Thumbnail", value: "Thumbnail" },
    { label: isRestaurant ? "Food Name" : "Product Name", value: "Product Name" },
    { label: "Stock", value: "Stock" },
    { label: "Remanent", value: "Remanent" },
    { label: "Sales", value: "Sales" },
    { label: "Status", value: "Status" },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex-col">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            {isRestaurant ? "Food catalog" : "Retail catalog"}
          </p>
          <h3 className="text-sm font-bold">
            {isRestaurant ? "Food Items" : "Products"}
          </h3>
          <p className="mt-1 max-w-2xl text-xs text-muted-foreground">
            Manage items that can sell through website storefront, web chat and WhatsApp AI.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline ml-2">
              {isRestaurant ? "New food item" : "New product"}
            </span>
          </Button>
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
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              icon: isRestaurant ? Boxes : ShoppingBag,
              title: isRestaurant ? "Food item setup" : "Retail product setup",
              description: isRestaurant
                ? "Simple, customizable and bundle food products stay visible from one catalog."
                : "Stock, variants, markup pricing and fulfillment rules stay visible from one catalog.",
            },
            {
              icon: MessageCircle,
              title: "AI sales assistant sync",
              description: "Catalog availability is previewed for WhatsApp and web chat selling.",
            },
            {
              icon: Ticket,
              title: "V2 pricing model",
              description: "Markup-plan items can show buyer-facing fees without changing vendor base price.",
            },
          ].map((item) => (
            <Card key={item.title} className="shadow-none">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="border-primary/20 text-primary">
                    V2
                  </Badge>
                </div>
                <h4 className="mt-4 text-sm font-semibold">{item.title}</h4>
                <p className="mt-2 text-xs text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
          <CardContent>
            {isRestaurant ? <FoodTable /> : <ProductsTable />}
          </CardContent>
        </Card>
      </div>
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        endpointPrefix={isRestaurant ? "FoodItems" : "Products"}
        fieldOptions={fieldOptions}
        dataName={isRestaurant ? "Food Items" : "Products"}
      />
    </div>
  );
}

export default ProductsPage;
