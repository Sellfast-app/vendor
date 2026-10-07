"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, Search, ShoppingBag } from "lucide-react";
import { useState } from "react";

const orderTabs = ["All", "Pending", "Processing", "Shipped", "Fulfilled", "Cancelled"];

export default function OrdersTable() {
  const [activeTab, setActiveTab] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("all");
  const [deliveryMethod, setDeliveryMethod] = useState("all");

  return (
    <div className="w-full space-y-5">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-sm">
          <Input value={searchTerm} onChange={(event) => setSearchTerm(event.target.value)} placeholder="Search orders or customers" className="pr-9" />
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        </div>
        <Button variant="outline" onClick={() => setShowFilters((current) => !current)}>
          <Filter className="h-4 w-4" />
          <span className="ml-2">{showFilters ? "Hide filters" : "Filters"}</span>
        </Button>
      </div>

      {showFilters && (
        <div className="grid gap-3 rounded-lg border bg-muted/20 p-4 sm:grid-cols-2">
          <Select value={paymentStatus} onValueChange={setPaymentStatus}>
            <SelectTrigger><SelectValue placeholder="Payment status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All payment statuses</SelectItem>
              <SelectItem value="paid">Paid</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>
          <Select value={deliveryMethod} onValueChange={setDeliveryMethod}>
            <SelectTrigger><SelectValue placeholder="Delivery method" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All delivery methods</SelectItem>
              <SelectItem value="vendor">Vendor delivery</SelectItem>
              <SelectItem value="pickup">Pickup</SelectItem>
              <SelectItem value="sendbox">Sendbox</SelectItem>
              <SelectItem value="gig">GIG Logistics</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto border-b pb-px">
        {orderTabs.map((tab) => (
          <Button key={tab} variant="ghost" onClick={() => setActiveTab(tab)} className={`shrink-0 rounded-none border-b-2 px-3 text-xs ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground"}`}>
            {tab}
          </Button>
        ))}
      </div>

      <div className="rounded-lg border">
        <div className="flex min-h-64 flex-col items-center justify-center px-6 py-12 text-center">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <h2 className="mt-4 text-sm font-semibold">No orders yet</h2>
          <p className="mt-1 max-w-md text-xs text-muted-foreground">Orders from your website, WhatsApp AI and web chat will appear here once your first sale is completed.</p>
        </div>
      </div>
    </div>
  );
}
