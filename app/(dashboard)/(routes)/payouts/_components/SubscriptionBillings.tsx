"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, DownloadIcon, FilterIcon, SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EyeIcon from "@/components/svgIcons/EyeIcon";
import { mockSubscriptionBillingData } from "@/lib/mockdata";

export default function SubscriptionBillingTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [billings, setBillings] = useState(mockSubscriptionBillingData);
  const [selectedBillings, setSelectedBillings] = useState<string[]>([]);

  useEffect(() => {
    let filteredBillings = [...mockSubscriptionBillingData];
    if (searchTerm) {
      filteredBillings = filteredBillings.filter(
        (billing) =>
          billing.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billing.card.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billing.plan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setBillings(filteredBillings);
    setSelectedBillings([]);
  }, [searchTerm]);

  const totalPages = Math.ceil(billings.length / pageSize);
  const displayedBillings = billings.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

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
      setSelectedBillings(displayedBillings.map((billing) => billing.id));
    } else {
      setSelectedBillings([]);
    }
  };

  const handleSelectBilling = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedBillings((prev) => [...prev, id]);
    } else {
      setSelectedBillings((prev) => prev.filter((item) => item !== id));
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Success":
        return "bg-[#EFFFE9] rounded-xl text-[#53DC19]";
      case "Pending":
        return "bg-[#FFF5E8] rounded-xl text-[#FFB347]";
      case "Failed":
        return "bg-[#FFEFEF] rounded-xl text-[#E40101]";
      default:
        return "";
    }
  };

  const handleDownloadReceipt = (receiptUrl: string | null) => {
    if (receiptUrl) {
      const a = document.createElement("a");
      a.href = receiptUrl;
      a.download = `receipt_${receiptUrl.split("/").pop()}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      alert("No receipt available for this billing.");
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4 space-x-4">
        <div className="relative flex items-center pb-2">
          <Input
            type="text"
            placeholder="Search by ID, Card, or Plan..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-84 pr-4 py-2 bg-background rounded-lg border-[#F5F5F5] dark:border-[#1F1F1F]"
          />
          <SearchIcon className="absolute right-2 top-2.7 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" className="border-[#F5F5F5] dark:border-[#1F1F1F]">
            <FilterIcon /> Filter
          </Button>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-[#F5F5F5]">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedBillings.length === displayedBillings.length && displayedBillings.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">ID</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Card</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Amount</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Plan</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Status</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Timestamp</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedBillings.length > 0 ? (
            displayedBillings.map((billing) => (
              <TableRow key={billing.id}>
                <TableCell>
                  <Checkbox
                    checked={selectedBillings.includes(billing.id)}
                    onCheckedChange={(checked) => handleSelectBilling(billing.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="text-[#4FCA6A] underline">{billing.id}</TableCell>
                <TableCell>{billing.card}</TableCell>
                <TableCell>₦{billing.amount.toLocaleString()}</TableCell>
                <TableCell>{billing.plan}</TableCell>
                <TableCell>
                  <span className={`flex items-center px-2 py-1 rounded text-sm ${getStatusClass(billing.status)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${billing.status === "Success" ? "bg-[#53DC19]" : billing.status === "Pending" ? "bg-[#FFB347]" : "bg-[#E40101]"}`} />
                    {billing.status}
                  </span>
                </TableCell>
                <TableCell>{new Date(billing.timestamp).toLocaleString()}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger>
                      <Button variant="ghost" className="p-0">
                        <BsThreeDots className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem onClick={() => window.open(`/billing/${billing.id}`, "_blank")}>
                        <EyeIcon /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownloadReceipt(billing.receiptUrl)} className="text-primary">
                        <DownloadIcon  className="text-primary"/> Download Receipt
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No billings found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4 space-x-2">
        <span className="text-sm">
          {`${(currentPage * pageSize) + 1}-${Math.min((currentPage + 1) * pageSize, billings.length)} of ${billings.length}`}
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