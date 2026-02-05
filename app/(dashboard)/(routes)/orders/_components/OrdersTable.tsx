"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  FilterIcon,
  PlusIcon,
  SearchIcon,
} from "lucide-react";
import { useState, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import CreateOrderModal from "./CreateOrderModal";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  order_total: number;
  order_total_quantity: number;
  payment_status: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  delivery_notee: string;
  delivery_fee: number;
  delivery_method: string;
  order_items: Array<{
    name: string;
    price: number;
    discount: number;
    quantity: number;
    product_id: string;
    store_id: string;
    product_name?: string;
    product_image?: string;
  }>;
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    items: Order[];
    total: number;
    totalPages: number;
  };
}

export default function OrderTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState("all");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState<{
    from: Date | undefined;
    to: Date | undefined;
  }>({ from: undefined, to: undefined });
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterPaymentStatus, setFilterPaymentStatus] = useState<string>("all");
  const [filterDeliveryPartner, setFilterDeliveryPartner] =
    useState<string>("all");
  const [filterEscrow, setFilterEscrow] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const router = useRouter();
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false);

  // Fetch orders from API
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });
  
      // Add search if present
      if (searchTerm) {
        queryParams.append('search', searchTerm);
        console.log('🔍 Search term:', searchTerm);
      }
  
      // Handle status filter - activeTab takes precedence
      const statusToUse = activeTab !== 'all' ? activeTab : (filterStatus !== 'all' ? filterStatus : '');
      if (statusToUse) {
        queryParams.append('status', statusToUse);
        console.log('📊 Status filter:', statusToUse);
      }
  
      // Add payment status filter
      if (filterPaymentStatus && filterPaymentStatus !== 'all') {
        queryParams.append('paymentStatus', filterPaymentStatus);
        console.log('💳 Payment status filter:', filterPaymentStatus);
      }
  
      // Add delivery method filter
      if (filterDeliveryPartner && filterDeliveryPartner !== 'all') {
        queryParams.append('deliveryMethod', filterDeliveryPartner);
        console.log('🚚 Delivery method filter:', filterDeliveryPartner);
      }
  
      // Add date range filters
      if (filterDateRange.from) {
        const startDate = filterDateRange.from.toISOString().split('T')[0];
        queryParams.append('startDate', startDate);
        console.log('📅 Start date:', startDate);
      }
      if (filterDateRange.to) {
        const endDate = filterDateRange.to.toISOString().split('T')[0];
        queryParams.append('endDate', endDate);
        console.log('📅 End date:', endDate);
      }
  
      console.log('🌐 Full API URL:', `/api/orders?${queryParams.toString()}`);
  
      const response = await fetch(`/api/orders?${queryParams}`);
      const result: ApiResponse = await response.json();
  
      console.log("📦 Full API Response:", JSON.stringify(result, null, 2));
  
      if (result.status === "success") {
        const ordersData = result.data.items || [];
        setOrders(ordersData);
        setTotalCount(result.data.total || 0);
        console.log(`✅ Loaded ${ordersData.length} orders out of ${result.data.total} total`);
      } else {
        console.error('❌ API returned error:', result.message);
        toast.error(result.message || "Failed to fetch orders");
        setOrders([]);
        setTotalCount(0);
      }
    } catch (error) {
      console.error("❌ Error fetching orders:", error);
      toast.error("Failed to load orders");
      setOrders([]);
      setTotalCount(0);
    } finally {
      setIsLoading(false);
    }
  };

useEffect(() => {
  fetchOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [
  currentPage,
  searchTerm,
  activeTab,
  filterStatus,
  filterPaymentStatus,
  filterDeliveryPartner, // <- ADD THIS
  filterDateRange.from,
  filterDateRange.to,
]);

  useEffect(() => {
    localStorage.setItem("filteredOrders", JSON.stringify(orders));
  }, [orders]);

  const totalPages = Math.ceil(totalCount / pageSize);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 3) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push("...");
      else pages.push(2);
      if (currentPage < totalPages - 1) pages.push("...");
      pages.push(totalPages);
    }
    return pages;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedOrders(orders.map((order) => order.id));
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
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-[#53DC19]";
      case "pending":
        return "bg-[#FFB347]";
      case "failed":
        return "bg-[#E40101]";
      default:
        return "bg-gray-400";
    }
  };

  const getDeliveryClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "fulfilled":
        return "bg-[#EFFFE9] text-[#065F46]";
      case "pending":
        return "bg-[#FFF5E8] text-[#9A3412]";
      case "shipped":
        return "bg-[#F9E4FF] text-[#86198F]";
      case "processing":
        return "bg-[#E6F6FF] text-[#075985]";
      case "cancelled":
        return "bg-[#FFEFEF] text-[#991B1B]";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleCreateOrder = (order: any) => {
    console.log("Creating order:", order);
    toast.success("Order created successfully");
    fetchOrders(); // Refresh the orders list
  };

  const clearFilters = () => {
    setFilterDateRange({ from: undefined, to: undefined });
    setFilterStatus("all");
    setFilterPaymentStatus("all");
    setFilterDeliveryPartner("all");
    setFilterEscrow("all");
    setIsFilterOpen(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchOrders();
  };

  const handleUpdateOrderStatus = async (
    orderId: string,
    status: "ready" | "cancelled",
  ) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      const result = await response.json();

      if (!response.ok) {
        toast.error(result.message || `Failed to update order status`);
        return;
      }

      toast.success(`Order marked as ${status}`);
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status");
    }
  };

  return (
    <div className="w-full">
      {/* Search and Filter Section */}
      <div className="flex justify-between mb-4 space-x-4">
        <form
          onSubmit={handleSearch}
          className="relative flex items-center pb-2"
        >
          <Input
            type="text"
            placeholder="Search by Order ID/Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 md:w-84 pr-8 py-2 text-xs sm:text-sm dark:bg-background rounded-lg border-[#F5F5F5] dark:border-[#1F1F1F]"
          />
          <SearchIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        </form>
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
          <Button
            variant="outline"
            className="border-[#4FCA6A] text-[#4FCA6A] dark:bg-background"
            onClick={() => setIsCreateOrderModalOpen(true)}
            disabled
          >
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
                      (!filterDateRange.from || !filterDateRange.to) &&
                      "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filterDateRange.from && filterDateRange.to ? (
                      `${format(filterDateRange.from, "dd-MM-yyyy")} to ${format(filterDateRange.to, "dd-MM-yyyy")}`
                    ) : (
                      <span>Pick a date range</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="range"
                    selected={{
                      from: filterDateRange.from,
                      to: filterDateRange.to,
                    }}
                    onSelect={(range) =>
                      setFilterDateRange({ from: range?.from, to: range?.to })
                    }
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="shipped">Shipped</SelectItem>
                  <SelectItem value="fulfilled">Fulfilled</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentFilter">Payment Status</Label>
              <Select
                onValueChange={setFilterPaymentStatus}
                value={filterPaymentStatus}
              >
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue placeholder="All payment statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deliveryFilter">Delivery Method</Label>
              <Select
                onValueChange={setFilterDeliveryPartner}
                value={filterDeliveryPartner}
              >
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue placeholder="All methods" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="pickup">Pickup</SelectItem>
                  <SelectItem value="sendbox">Sendbox</SelectItem>
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
                  <SelectItem value="held">Held</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button onClick={clearFilters} variant="outline" size="sm">
              Clear All Filters
            </Button>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex space-x-2 mb-4 px-2 pb-4 overflow-x-auto">
        {[
          { key: "all", label: "All", icon: <Allcon /> },
          { key: "pending", label: "Pending", icon: <Pending /> },
          { key: "processing", label: "Processing", icon: <Processing /> },
          { key: "shipped", label: "Shipped", icon: <Shipped /> },
          { key: "fulfilled", label: "Fulfilled", icon: <Fulfilled /> },
          { key: "cancelled", label: "Cancelled", icon: <Cancelled /> },
        ].map((tab) => (
          <Button
            key={tab.key}
            variant="ghost"
            className={`px-4 rounded-none text-[#A0A0A0] whitespace-nowrap ${activeTab === tab.key
                ? "border-b-2 border-[#4FCA6A] text-black dark:text-white"
                : ""
              }`}
            onClick={() => {
              setActiveTab(tab.key);
              setCurrentPage(1);
            }}
          >
            {tab.icon}
            <span className="hidden sm:inline ml-2">{tab.label}</span>
          </Button>
        ))}
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader className="bg-[#F5F5F5] dark:bg-background">
            <TableRow>
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={
                    selectedOrders.length === orders.length && orders.length > 0
                  }
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">
                Order ID
              </TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">
                Date
              </TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">
                Customer Name
              </TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">
                Payment
              </TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">
                Total
              </TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">
                Items
              </TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">
                Status
              </TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-sm">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#4FCA6A]"></div>
                    <span className="ml-2">Loading orders...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow
                  key={order.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900"
                >
                  <TableCell className="py-4">
                    <Checkbox
                      checked={selectedOrders.includes(order.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOrder(order.id, checked as boolean)
                      }
                    />
                  </TableCell>
                  <TableCell
                    className="text-[#4FCA6A] underline cursor-pointer"
                    onClick={() => {
                      localStorage.setItem(
                        "selectedOrder",
                        JSON.stringify(order),
                      );
                      router.push(`/orders/${order.id}`);
                    }}
                  >
                    {order.order_number}
                  </TableCell>
                  <TableCell>
                    {format(new Date(order.created_at), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.customer_name}
                  </TableCell>
                  <TableCell>
                    <span className="flex items-center">
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${getPaymentClass(order.payment_status)}`}
                      ></span>
                      <span className="capitalize">{order.payment_status}</span>
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">
                    ₦{(order.order_total)}
                  </TableCell>
                  <TableCell>{order.order_total_quantity}</TableCell>
                  <TableCell>
                    <span
                      className={`flex items-center px-3 py-1 rounded-full text-xs font-medium ${getDeliveryClass(order.order_status)}`}
                    >
                      <span
                        className={`w-2 h-2 rounded-full mr-2 ${getPaymentClass(order.order_status)}`}
                      ></span>
                      <span className="capitalize">{order.order_status}</span>
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <BsThreeDots className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => {
                            localStorage.setItem(
                              "selectedOrder",
                              JSON.stringify(order),
                            );
                            router.push(`/orders/${order.id}`);
                          }}
                        >
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() =>
                            handleUpdateOrderStatus(order.id, "ready")
                          }
                        >
                          <MarkIcon className="mr-2 h-4 w-4" />
                          Mark as Ready
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MessageIcon className="mr-2 h-4 w-4" />
                          Message Customer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-[#E40101]"
                          onClick={() =>
                            handleUpdateOrderStatus(order.id, "cancelled")
                          }
                        >
                          <Cancelcon className="mr-2 h-4 w-4" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  No orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center mt-4 space-x-2">
        <span className="text-sm">
          {`${(currentPage - 1) * pageSize + 1}-${Math.min(currentPage * pageSize, totalCount)} of ${totalCount}`}
        </span>
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          disabled={currentPage === 1}
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
                {Number(page)}
              </Button>
            )}
          </span>
        ))}
        <Button
          variant="outline"
          size="icon"
          onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
          disabled={currentPage >= totalPages}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <CreateOrderModal
        isOpen={isCreateOrderModalOpen}
        onClose={() => setIsCreateOrderModalOpen(false)}
        onCreateOrder={handleCreateOrder}
      />
    </div>
  );
}
