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
  const [storeTypeError, setStoreTypeError] = useState(false);

  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setStoreTypeError(false);
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
        setBusinessType("");
        setStoreTypeError(true);
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

  if (storeTypeError) {
    return (
      <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex h-64 flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm font-medium">Unable to load your store type.</p>
          <p className="text-sm text-muted-foreground">
            Refresh the page to try again. Product tools are unavailable until the store type is confirmed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex-col">
          <h3 className="text-sm font-bold">
            {isRestaurant ? "Food Items" : "Products"}
          </h3>
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
