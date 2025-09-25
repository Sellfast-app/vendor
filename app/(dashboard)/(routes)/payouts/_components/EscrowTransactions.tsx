"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, FilterIcon, SearchIcon, TruckIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EyeIcon from "@/components/svgIcons/EyeIcon";
import { mockEscrowData } from "@/lib/mockdata";

export default function EscrowTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [escrows, setEscrows] = useState(mockEscrowData);
  const [selectedEscrows, setSelectedEscrows] = useState<string[]>([]);

  useEffect(() => {
    let filteredEscrows = [...mockEscrowData];
    if (searchTerm) {
      filteredEscrows = filteredEscrows.filter(
        (escrow) =>
          escrow.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          escrow.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setEscrows(filteredEscrows);
    setSelectedEscrows([]);
  }, [searchTerm]);

  const totalPages = Math.ceil(escrows.length / pageSize);
  const displayedEscrows = escrows.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

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
      setSelectedEscrows(displayedEscrows.map((escrow) => escrow.id));
    } else {
      setSelectedEscrows([]);
    }
  };

  const handleSelectEscrow = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedEscrows((prev) => [...prev, id]);
    } else {
      setSelectedEscrows((prev) => prev.filter((item) => item !== id));
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Escrow":
        return "bg-[#FFF5E8] rounded-xl text-[#FFB347]";
      case "Available":
        return "bg-[#EFFFE9] rounded-xl text-[#53DC19]";
      default:
        return "";
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4 space-x-4">
        <div className="relative flex items-center pb-2">
          <Input
            type="text"
            placeholder="Search by Order ID or Status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full sm:w-64 md:w-84 pr-8 py-2 text-xs sm:text-sm dark:bg-background rounded-lg border-[#F5F5F5] dark:border-[#1F1F1F]"
          />
          <SearchIcon className="absolute right-2 top-2.7 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-[#F5F5F5] dark:border-[#1F1F1F] dark:bg-background">
            <FilterIcon /> <span className="hidden sm:inline ml-2">Filter</span>
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-[#F5F5F5] dark:bg-background">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedEscrows.length === displayedEscrows.length && displayedEscrows.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Order ID</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Amount</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Status</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Timestamp</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedEscrows.length > 0 ? (
            displayedEscrows.map((escrow) => (
              <TableRow key={escrow.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedEscrows.includes(escrow.id)}
                    onCheckedChange={(checked) => handleSelectEscrow(escrow.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="text-[#4FCA6A] underline">{escrow.id}</TableCell>
                <TableCell>₦{escrow.amount.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`flex items-center px-2 py-1 rounded text-sm ${getStatusClass(escrow.status)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${escrow.status === "Escrow" ? "bg-[#FFB347]" : "bg-[#53DC19]"}`} />
                    {escrow.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(escrow.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" className="p-0">
                        <BsThreeDots className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => window.open(escrow.orderInfoUrl, "_blank")}>
                        <EyeIcon /> View Order Info
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.open(escrow.trackingUrl, "_blank")}>
                        <TruckIcon /> Track Delivery
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="text-center">
                No escrows found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4 space-x-2">
        <span className="text-sm">
          {`${(currentPage * pageSize) + 1}-${Math.min((currentPage + 1) * pageSize, escrows.length)} of ${escrows.length}`}
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