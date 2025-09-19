"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesBreakdown from "./SalesBreakdown";
import PayoutsRevenue from "./PayoutsRevenue";
import InventoryTrends from "./InventoryTrends";
import CustomerInsights from "./CustomerInsights";

export default function AnalyticsTabs() {
  return (
    <Tabs defaultValue="sales" className="w-full">
      <TabsList className="grid grid-cols-4 mb-6 bg-transparent gap-2">
        <TabsTrigger 
          value="sales" 
          className="bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
          Sales Breakdown
        </TabsTrigger>
        <TabsTrigger 
          value="payouts" 
          className="bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
          Payouts Revenue
        </TabsTrigger>
        <TabsTrigger 
          value="inventory" 
          className="bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
          Inventory Trends
        </TabsTrigger>
        <TabsTrigger 
          value="customer" 
          className="bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
          Customer Insights
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="sales">
        <SalesBreakdown />
      </TabsContent>
      
      <TabsContent value="payouts">
        <PayoutsRevenue />
      </TabsContent>
      
      <TabsContent value="inventory">
        <InventoryTrends />
      </TabsContent>
      
      <TabsContent value="customer">
        <CustomerInsights />
      </TabsContent>
    </Tabs>
  );
}