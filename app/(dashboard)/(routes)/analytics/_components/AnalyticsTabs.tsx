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
    // Added 'relative' to the main container for better context
    <Tabs defaultValue="sales" className="w-full relative"> 
      {/* The key classes are:
        - flex, overflow-x-auto, whitespace-nowrap (for scrollability)
        - p-1 (Added padding to ensure the scrollbar is inside the component area)
        - ring-offset-background (Inherited from radix-ui/shadcn default styling for tabs list)
      */}
      <TabsList className="w-full overflow-x-auto flex-nowrap gap-2 bg-background justify-start scrollbar-hide p-1 ring-offset-background">
        <TabsTrigger 
          value="sales" 
          className="flex-shrink-0 bg-transparent data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
        <FaChartLine/><span className="hidden sm:inline ml-2"> Sales Breakdown</span>
        </TabsTrigger>
        <TabsTrigger 
          value="payouts" 
          className="flex-shrink-0 bg-transparent data-[state=active]:bg-primary  dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
         <PiHandCoinsDuotone/> <span className="hidden sm:inline ml-2"> Payouts Revenue</span>
        </TabsTrigger>
        <TabsTrigger 
          value="inventory" 
          className="flex-shrink-0 bg-transparent data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
         < MdOutlineInventory /> <span className="hidden sm:inline ml-2"> Inventory Trends</span>
        </TabsTrigger>
        <TabsTrigger 
          value="customer" 
          className="flex-shrink-0 bg-transparent data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
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