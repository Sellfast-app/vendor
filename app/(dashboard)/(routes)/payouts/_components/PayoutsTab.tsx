"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Transactions from "./Transactions";
import SubscriptionBillings from "./SubscriptionBillings";
import EscrowTransactions from "./EscrowTransactions";
import { PiHandWithdraw } from "react-icons/pi";
import { FaCreditCard } from "react-icons/fa";
import { GrTransaction } from "react-icons/gr";

export default function PayoutsTab() {
  return (
    <Tabs defaultValue="withdraw" className="w-full">
      <TabsList className="grid grid-cols-4 mb-6 bg-transparent gap-2">
        <TabsTrigger 
          value="withdraw" 
          className="bg-transparent data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-white border border-input"
        >
        <PiHandWithdraw className="md:hidden"/> <span className="hidden sm:inline ml-2"> Transactions</span>
        </TabsTrigger>
        {/* <TabsTrigger 
          value="billings" 
          className="bg-transparent data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input"
        >
        <FaCreditCard className="md:hidden"/>  <span className="hidden sm:inline ml-2">Subscription Billings</span>
        </TabsTrigger> */}
        {/* <TabsTrigger 
          value="escrow" 
          className="bg-transparent data-[state=active]:bg-primary dark:data-[state=active]:bg-primary data-[state=active]:text-primary-foreground border border-input space-x-2"
        >
        <GrTransaction className="md:hidden"/>  <span className="hidden sm:inline ml-2">Escrow Transactions</span>
        </TabsTrigger> */}
      </TabsList>
      
      <TabsContent value="withdraw">
        <Transactions />
      </TabsContent>
      
      <TabsContent value="billings">
        <SubscriptionBillings />
      </TabsContent>
{/*       
      <TabsContent value="escrow">
        <EscrowTransactions />
      </TabsContent> */}
      
    </Tabs>
  );
}