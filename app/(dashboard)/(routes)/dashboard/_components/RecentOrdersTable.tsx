"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import MarkIcon from "@/components/svgIcons/MarkIcon";
import MessageIcon from "@/components/svgIcons/MessageIcon";
import Cancelcon from "@/components/svgIcons/Cancelcon";
import EyeIcon from "@/components/svgIcons/EyeIcon";
import { format } from "date-fns";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  order_status: string;
  order_total: string;
  order_total_quantity: number;
  payment_status: string;
  payment_method: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string;
  customer_address: string;
  delivery_note: string;
  delivery_fee: string;
  delivery_method: string;
  order_items: Array<{
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

export default function RecentOrdersTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const router = useRouter();

  // Fetch recent orders from API
  const fetchRecentOrders = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      });

      const response = await fetch(`/api/orders/recent?${queryParams}`);
      const result: ApiResponse = await response.json();

      console.log('Recent Orders API Response:', result);

      if (result.status === 'success') {
        const ordersData = result.data.items || [];
        setOrders(ordersData);
        setTotalCount(result.data.total || 0);
        setTotalPages(result.data.totalPages || 0);
        
        console.log(`Loaded ${ordersData.length} recent orders`);
      } else {
        toast.error(result.message || 'Failed to fetch recent orders');
        setOrders([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching recent orders:', error);
      toast.error('Failed to load recent orders');
      setOrders([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentOrders();
  }, [currentPage]);

  const getPaymentClass = (status: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "completed":
        return "bg-[#53DC19]";
      case "pending":
        return "bg-[#FFB347]";
      case "failed":
        return "bg-[#E40101]";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "fulfilled":
      case "completed":
        return "text-[#065F46]";
      case "pending":
        return "text-[#F47200]";
      case "shipped":
        return "text-[#86198F]";
      case "processing":
        return "text-[#075985]";
      case "cancelled":
      case "failed":
        return "text-[#991B1B]";
      default:
        return "text-gray-800";
    }
  };

  const getStatusBackgroundColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "fulfilled":
      case "completed":
        return "bg-[#EFFFE9]";
      case "pending":
        return "bg-[#FFF5E8]";
      case "shipped":
        return "bg-[#F9E4FF]";
      case "processing":
        return "bg-[#E6F6FF]";
      case "cancelled":
      case "failed":
        return "bg-[#FFEFEF]";
      default:
        return "bg-gray-100";
    }
  };

  return (
    <div className="w-full">
      {/* Header with Pagination */}
      <div className="flex flex-col space-y-3 mb-4 lg:flex-row lg:justify-between lg:items-center lg:space-y-0">
        {/* Title Section */}
        <div>
          <h3 className="text-sm font-bold">Recent Orders</h3>
          <p className="text-xs text-gray-500">An overview of your most recent orders.</p>
        </div>
        
        {/* Pagination Section - Responsive */}
        <div className="flex items-center justify-between lg:justify-end space-x-2">
          {/* Mobile: Show only prev/next arrows and View All */}
          <div className="flex items-center space-x-1 lg:hidden">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <span className="text-xs text-gray-600 px-2">
              {currentPage} / {totalPages || 1}
            </span>
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Desktop: Show full pagination with numbers */}
          <div className="hidden lg:flex items-center space-x-2">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || isLoading}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {[...Array(Math.min(totalPages, 5))].map((_, index) => {
              const pageNumber = index + 1;
              if (totalPages <= 5) {
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(pageNumber)}
                    disabled={isLoading}
                  >
                    {pageNumber}
                  </Button>
                );
              }
              // Show ellipsis for large page counts
              if (index === 1 && currentPage > 3) {
                return <span key="ellipsis" className="px-2">...</span>;
              }
              if (index === 3 && currentPage < totalPages - 2) {
                return <span key="ellipsis2" className="px-2">...</span>;
              }
              if (
                pageNumber === 1 ||
                pageNumber === totalPages ||
                (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
              ) {
                return (
                  <Button
                    key={pageNumber}
                    variant={currentPage === pageNumber ? "default" : "outline"}
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setCurrentPage(pageNumber)}
                    disabled={isLoading}
                  >
                    {pageNumber}
                  </Button>
                );
              }
              return null;
            })}
            
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || isLoading}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          {/* View All Button */}
          <Button
            variant="link"
            className="text-[#4FCA6A] hover:text-[#45B862] text-xs lg:text-sm whitespace-nowrap p-0 h-auto"
            onClick={() => router.push('/orders')}
          >
            View All →
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader className="bg-[#F5F5F5] dark:bg-background">
            <TableRow>
              <TableHead className="font-semibold text-[#A0A0A0] text-xs lg:text-sm whitespace-nowrap">Order ID</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-xs lg:text-sm whitespace-nowrap">Customer</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-xs lg:text-sm whitespace-nowrap">Date</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-xs lg:text-sm whitespace-nowrap">Total</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-xs lg:text-sm whitespace-nowrap">Status</TableHead>
              <TableHead className="font-semibold text-[#A0A0A0] text-xs lg:text-sm whitespace-nowrap">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              // Skeleton Loading State
              [...Array(6)].map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-20 lg:w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24 lg:w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20 lg:w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-16 lg:w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-20 lg:w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8 rounded" />
                  </TableCell>
                </TableRow>
              ))
            ) : orders.length > 0 ? (
              orders.map((order) => (
                <TableRow key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-900">
                  <TableCell 
                    className="text-[#4FCA6A] underline cursor-pointer font-medium text-xs lg:text-sm whitespace-nowrap" 
                    onClick={() => {
                      localStorage.setItem('selectedOrder', JSON.stringify(order));
                      router.push(`/orders/${order.id}`);
                    }}
                  >
                    {order.order_number}
                  </TableCell>
                  <TableCell className="font-medium text-xs lg:text-sm whitespace-nowrap">{order.customer_name}</TableCell>
                  <TableCell className="text-xs lg:text-sm whitespace-nowrap">{format(new Date(order.created_at), "dd MMM yyyy")}</TableCell>
                  <TableCell className="font-semibold text-xs lg:text-sm whitespace-nowrap">₦{parseFloat(order.order_total).toLocaleString()}</TableCell>
                  <TableCell>
                    <span className={`flex items-center px-2 lg:px-3 py-1 rounded-full text-[10px] lg:text-xs font-medium whitespace-nowrap ${getStatusBackgroundColor(order.order_status)} ${getStatusTextColor(order.order_status)}`}>
                      <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full mr-1 lg:mr-2 ${getPaymentClass(order.order_status)}`}></span>
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
                        <DropdownMenuItem onClick={() => {
                          localStorage.setItem('selectedOrder', JSON.stringify(order));
                          router.push(`/orders/${order.id}`);
                        }}>
                          <EyeIcon className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <MarkIcon className="mr-2 h-4 w-4" />
                          Track Delivery
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-[#E40101]">
                          <Cancelcon className="mr-2 h-4 w-4 text-[#E40101]" />
                          Cancel Order
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground text-xs lg:text-sm">
                  No recent orders found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}