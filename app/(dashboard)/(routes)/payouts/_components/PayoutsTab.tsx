"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Withdrawals from "./Withdrawals";
import SubscriptionBillings from "./SubscriptionBillings";
import EscrowTransactions from "./EscrowTransactions";

export default function PayoutsTab() {
  return (
    <Tabs defaultValue="withdraw" className="w-full">
      <TabsList className="grid grid-cols-4 mb-6 bg-transparent gap-2">
        <TabsTrigger 
          value="withdraw" 
          className="bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
         Withdrawals
        </TabsTrigger>
        <TabsTrigger 
          value="billings" 
          className="bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
         Subscription Billings
        </TabsTrigger>
        <TabsTrigger 
          value="escrow" 
          className="bg-transparent data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
         Escrow Transactions
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="withdraw">
        <Withdrawals />
      </TabsContent>
      
      <TabsContent value="billings">
        <SubscriptionBillings />
      </TabsContent>
      
      <TabsContent value="escrow">
        <EscrowTransactions />
      </TabsContent>
      
    </Tabs>
  );
}