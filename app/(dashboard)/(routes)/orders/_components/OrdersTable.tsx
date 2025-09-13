"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight,  FilterIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { orderData } from "@/lib/mockdata";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import MarkIcon from "@/components/svgIcons/MarkIcon";
import MessageIcon from "@/components/svgIcons/MessageIcon";
import Cancelcon from "@/components/svgIcons/Cancelcon";
import EyeIcon from "@/components/svgIcons/EyeIcon";

export default function OrderTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [orders, setOrders] = useState(orderData);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);

  useEffect(() => {
    let filteredOrders = [...orderData];
    if (searchTerm) {
      filteredOrders = filteredOrders.filter(
        (order) =>
          order.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          order.customerName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setOrders(filteredOrders);
    setSelectedOrders([]);
  }, [searchTerm]);

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

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4 space-x-4">
        <div className="relative flex items-center pb-2 ">
          <Input
            type="text"
            placeholder="Search by Order ID/Customer..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-84 pr-4 py-2 bg-background rounded-lg border-[#F5F5F5] dark:border-[#1F1F1F]"
          />
          <SearchIcon className="absolute right-2 top-2.7 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-[#F5F5F5] dark:border-[#1F1F1F]"><FilterIcon /> Filter</Button>
          <Button variant="outline" className="border-[#4FCA6A] text-[#4FCA6A]"><PlusIcon className="text-[#4FCA6A]" /> Add Order</Button>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-[#F5F5F5]">
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
                <TableCell>{order.date}</TableCell>
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
                  <span className={`flex items-center px-2 py-1 w-[] rounded ${getDeliveryClass(order.status)}`}>
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
                            <DropdownMenuItem> <EyeIcon /> View Details</DropdownMenuItem>
                            <DropdownMenuItem> <MarkIcon/> Mark as Ready</DropdownMenuItem>
                            <DropdownMenuItem>   <MessageIcon/> Message Customer</DropdownMenuItem>
                            <DropdownMenuItem><Cancelcon/> Cancel Order</DropdownMenuItem>
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