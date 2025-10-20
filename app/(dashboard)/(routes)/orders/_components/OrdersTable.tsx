"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, FilterIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { orderData } from "@/lib/mockdata";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MarkIcon from "@/components/svgIcons/MarkIcon";
import MessageIcon from "@/components/svgIcons/MessageIcon";
import Cancelcon from "@/components/svgIcons/Cancelcon";
import EyeIcon from "@/components/svgIcons/EyeIcon";
import Allcon from "@/components/svgIcons/Allcon";
import Pending from "@/components/svgIcons/Pending";
import Processing from "@/components/svgIcons/Processing";
import Shipped from "@/components/svgIcons/Shipped";
import Fulfilled from "@/components/svgIcons/Fulfilled";
import Cancelled from "@/components/svgIcons/Cancelled";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function OrderTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState(orderData);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [filterStatus, setFilterStatus] = useState<string>("all"); // New status filter
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [filterDeliveryPartner, setFilterDeliveryPartner] = useState<string>("all");
  const [filterEscrow, setFilterEscrow] = useState<string>("all");
  const router = useRouter();

  useEffect(() => {
    let filteredOrders = [...orderData];

    // Filter by search term
    if (searchTerm) {
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by status tab
    if (activeTab !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.status.toLowerCase() === activeTab.toLowerCase()
      );
    }

    // Filter by date range
    if (filterDateRange.from && filterDateRange.to) {
      filteredOrders = filteredOrders.filter(
        (order) => {
          const orderDate = new Date(order.date);
          return orderDate >= filterDateRange.from! && orderDate <= filterDateRange.to!;
        }
      );
    }

    // Filter by status
    if (filterStatus && filterStatus !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.status === filterStatus
      );
    }

    // Filter by payment status
    if (filterPaymentStatus && filterPaymentStatus !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.payment === filterPaymentStatus
      );
    }

    // Filter by delivery partner
    if (filterDeliveryPartner && filterDeliveryPartner !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.deliveryPartner === filterDeliveryPartner
      );
    }

    // Filter by escrow status
    if (filterEscrow && filterEscrow !== "all") {
      filteredOrders = filteredOrders.filter(
        (order) => order.escrow === filterEscrow
      );
    }

    setOrders(filteredOrders);
    setSelectedOrders([]);
    setCurrentPage(0);
  }, [searchTerm, activeTab, filterDateRange, filterStatus, filterPaymentStatus, filterDeliveryPartner, filterEscrow]);

  const totalPages = Math.ceil(orders.length / pageSize);
  const displayedOrders = orders.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push(currentPage - 1, currentPage);
      else pages.push(1);
      if (currentPage < totalPages - 2) pages.push("...");
      pages.push(totalPages - 1);
    }
    return pages;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(displayedOrders.map((order) => order.orderId));
    } else {
      setSelectedOrders([]);
    }
  };

  const handleSelectOrder = (orderId: string, checked: boolean) => {
    if (checked) {
      setSelectedOrders((prev) => [...prev, orderId]);
    } else {
      setSelectedOrders((prev) => prev.filter((id) => id !== orderId));
    }
  };

  const getPaymentClass = (status: string) => {
    switch (status) {
      case "Paid":
        return "bg-[#53DC19] border border-[#C9FFB2]";
      case "Pending":
        return "bg-[#FFB347] border border-[#FCE3BF]";
      case "Failed":
        return "bg-[#E40101] border border-[#FFD3D3]";
      default:
        return "";
    }
  };

  const getDeliveryClass = (status: string) => {
    switch (status) {
      case "Fulfilled":
        return "bg-[#EFFFE9] rounded-xl";
      case "Pending":
        return "bg-[#FFF5E8] rounded-xl";
      case "Shipped":
        return "bg-[#F9E4FF] rounded-xl";
      case "Processing":
        return "bg-[#E6F6FF] rounded-xl";
      case "Cancelled":
        return "bg-[#FFEFEF] rounded-xl";
      default:
        return "";
    }
  };

  const clearFilters = () => {
    setFilterDateRange({ from: undefined, to: undefined });
    setFilterStatus("all");
    setFilterPaymentStatus("all");
    setFilterDeliveryPartner("all");
    setFilterEscrow("all");
    setIsFilterOpen(false);
  };

  return (
    <div className="w-full">
      {/* Search and Filter Section */}
      <div className="flex justify-between mb-4 space-x-4">
        <div className="relative flex items-center pb-2">
          <Input
            type="text"
            placeholder="Search by Order ID/Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 md:w-84 pr-8 py-2 text-xs sm:text-sm dark:bg-background rounded-lg border-[#F5F5F5] dark:border-[#1F1F1F]"
          />
          <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            className="border-[#F5F5F5] dark:border-[#1F1F1F] dark:bg-background"
            onClick={() => {
              setIsFilterOpen(!isFilterOpen);
              if (isFilterOpen) clearFilters();
            }}
          >
            <FilterIcon />
            <span className="hidden sm:inline ml-2">
              {isFilterOpen ? "Clear Filter" : "Filter"}
            </span>
          </Button>
          <Button variant="outline" className="border-[#4FCA6A] text-[#4FCA6A] dark:bg-background">
            <PlusIcon className="text-[#4FCA6A]" />
            <span className="hidden sm:inline ml-2">Add Order</span>
          </Button>
        </div>
      </div>
      {isFilterOpen && (
        <div className="mb-4 p-4 bg-white dark:bg-[#1F1F1F] rounded-lg border border-[#F5F5F5] dark:border-[#2D2D2D]">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFilter">Filter by Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      (!filterDateRange.from || !filterDateRange.to) && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDateRange.from && filterDateRange.to
                      ? `${format(filterDateRange.from, "dd-MM-yyyy")} to ${format(filterDateRange.to, "dd-MM-yyyy")}`
                      : <span>Pick a date range</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={{
                      from: filterDateRange.from,
                      to: filterDateRange.to,
                    }}
                    onSelect={(range) => setFilterDateRange({ from: range?.from, to: range?.to })}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Status</Label>
              <Select onValueChange={setFilterStatus} value={filterStatus}>
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Processing">Processing</SelectItem>
                  <SelectItem value="Shipped">Shipped</SelectItem>
                  <SelectItem value="Fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentFilter">Payment Status</Label>
              <Select onValueChange={setFilterPaymentStatus} value={filterPaymentStatus}>
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue placeholder="All payment statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Pending">Pending</SelectItem>
                  <SelectItem value="Failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryFilter">Delivery Partner</Label>
              <Select onValueChange={setFilterDeliveryPartner} value={filterDeliveryPartner}>
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue placeholder="All partners" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Kwik">Kwik</SelectItem>
                  <SelectItem value="GIG">GIG</SelectItem>
                  <SelectItem value="Sendnow">Sendnow</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="escrowFilter">Escrow</Label>
              <Select onValueChange={setFilterEscrow} value={filterEscrow}>
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue placeholder="All escrow statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="Held">Held</SelectItem>
                  <SelectItem value="Released">Released</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-0 px-2 pb-4">
        <Button
          variant="ghost"
          className={`px-4 rounded-none text-[#A0A0A0] ${activeTab === "all" ? "border-b border-[#4FCA6A] text-black" : ""}`}
          onClick={() => setActiveTab("all")}
        >
          <Allcon />
          <span className="hidden sm:inline ml-2">All</span>
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-none text-[#A0A0A0] ${activeTab === "pending" ? "border-b border-[#4FCA6A] text-black" : ""}`}
          onClick={() => setActiveTab("pending")}
        >
          <Pending />
          <span className="hidden sm:inline ml-2">Pending</span>
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-none text-[#A0A0A0] ${activeTab === "processing" ? "border-b border-[#4FCA6A] text-black" : ""}`}
          onClick={() => setActiveTab("processing")}
        >
          <Processing />
          <span className="hidden sm:inline ml-2">Processing</span>
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-none text-[#A0A0A0] ${activeTab === "shipped" ? "border-b border-[#4FCA6A] text-black" : ""}`}
          onClick={() => setActiveTab("shipped")}
        >
          <Shipped />
          <span className="hidden sm:inline ml-2">Shipped</span>
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-none text-[#A0A0A0] ${activeTab === "fulfilled" ? "border-b border-[#4FCA6A] text-black" : ""}`}
          onClick={() => setActiveTab("fulfilled")}
        >
          <Fulfilled />
          <span className="hidden sm:inline ml-2">Fulfilled</span>
        </Button>
        <Button
          variant="ghost"
          className={`px-4 rounded-none text-[#A0A0A0] ${activeTab === "cancelled" ? "border-b border-[#4FCA6A] text-black" : ""}`}
          onClick={() => setActiveTab("cancelled")}
        >
          <Cancelled />
          <span className="hidden sm:inline ml-2">Cancelled</span>
        </Button>
      </div>

      <Table>
        <TableHeader className="bg-[#F5F5F5] dark:bg-background">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedOrders.length === displayedOrders.length && displayedOrders.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Order ID</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Date</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Customer Name</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Payment</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Total</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Items</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Status</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedOrders.length > 0 ? (
            displayedOrders.map((order) => (
              <TableRow key={order.orderId}>
                <TableCell className="py-6">
                  <Checkbox
                    checked={selectedOrders.includes(order.orderId)}
                    onCheckedChange={(checked) => handleSelectOrder(order.orderId, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="text-[#4FCA6A] underline">{order.orderId}</TableCell>
                <TableCell>{format(new Date(order.date), "dd/MM/yyyy")}</TableCell>
                <TableCell>{order.customerName}</TableCell>
                <TableCell>
                  <span className="flex items-center">
                    <span className={`w-2 h-2 rounded-full mr-2 ${getPaymentClass(order.payment)}`}></span>
                    {order.payment}
                  </span>
                </TableCell>
                <TableCell>₦{order.total.toLocaleString()}</TableCell>
                <TableCell>{order.items}</TableCell>
                <TableCell>
                  <span className={`flex items-center text-black px-2 py-1 w-[] rounded ${getDeliveryClass(order.status)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${order.status === "Fulfilled" ? "bg-[#53DC19]" :
                      order.status === "Pending" ? "bg-[#FFB347]" :
                        order.status === "Shipped" ? "bg-[#C200F8]" :
                          order.status === "Processing" ? "bg-[#06A4FF]" :
                            order.status === "Cancelled" ? "bg-[#E40101]" : ""}`}></span>
                    {order.status}
                  </span>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" className="p-0">
                        <BsThreeDots className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => {
                        localStorage.setItem('selectedOrder', JSON.stringify(order));
                        router.push(`/orders/${order.orderId}`);
                      }}>
                        <EyeIcon /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem><MarkIcon /> Mark as Ready</DropdownMenuItem>
                      <DropdownMenuItem><MessageIcon /> Message Customer</DropdownMenuItem>
                      <DropdownMenuItem className="text-[#E40101]"><Cancelcon className="text-[#E40101]" /> Cancel Order</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                No orders found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4 space-x-2">
        <span className="text-sm">
          {`${(currentPage * pageSize) + 1}-${Math.min((currentPage + 1) * pageSize, orders.length)} of ${orders.length}`}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 0))}
          disabled={currentPage === 0}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        {getPageNumbers().map((page, index) => (
          <span key={index}>
            {page === "..." ? (
              <span className="px-2 text-sm">...</span>
            ) : (
              <Button
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => setCurrentPage(Number(page))}
                disabled={page === "..." || page === currentPage}
              >
                {Number(page) + 1}
              </Button>
            )}
          </span>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={currentPage >= totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}