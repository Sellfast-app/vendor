"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SalesBreakdown from "./SalesBreakdown";
import PayoutsRevenue from "./PayoutsRevenue";
import InventoryTrends from "./InventoryTrends";
import CustomerInsights from "./CustomerInsights";
import { FaChartLine } from "react-icons/fa";
import { PiHandCoinsDuotone } from "react-icons/pi";
import { MdOutlineInventory } from "react-icons/md";
import { MdInsights } from "react-icons/md";


export default function AnalyticsTabs() {
  return (
    <Tabs defaultValue="sales" className="w-full">
      <TabsList className="grid grid-cols-4 mb-6 bg-transparent gap-2">
        <TabsTrigger 
          value="sales" 
          className="bg-transparent data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
        <FaChartLine/><span className="hidden sm:inline ml-2"> Sales Breakdown</span>
        </TabsTrigger>
        <TabsTrigger 
          value="payouts" 
          className="bg-transparent data-[state=active]:bg-primary  dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
         <PiHandCoinsDuotone/> <span className="hidden sm:inline ml-2"> Payouts Revenue</span>
        </TabsTrigger>
        <TabsTrigger 
          value="inventory" 
          className="bg-transparent data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
         < MdOutlineInventory /> <span className="hidden sm:inline ml-2"> Inventory Trends</span>
        </TabsTrigger>
        <TabsTrigger 
          value="customer" 
          className="bg-transparent data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
        <MdInsights/> <span className="hidden sm:inline ml-2"> Customer Insights</span>
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