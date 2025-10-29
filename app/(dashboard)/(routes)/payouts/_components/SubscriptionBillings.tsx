"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, DownloadIcon, FilterIcon, SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EyeIcon from "@/components/svgIcons/EyeIcon";
import { mockSubscriptionBillingData } from "@/lib/mockdata";
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";

function DatePicker({
  id,
  date,
  onSelect,
  placeholder,
}: {
  id: string;
  date: string;
  onSelect: (date: string) => void;
  placeholder: string;
}) {
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState<Date | undefined>(date ? new Date(date) : undefined);

  const handleSelect = (selectedDate: Date | undefined) => {
    onSelect(selectedDate ? selectedDate.toISOString().split("T")[0] : "");
    if (selectedDate) setMonth(selectedDate);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id}
            variant="outline"
            className="w-full justify-start text-left font-normal pl-3 pr-10 py-2 border rounded-md text-sm bg-[#F8F8F8] dark:bg-gray-700"
          >
            <span>
              {date
                ? new Date(date).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" })
                : placeholder}
            </span>
            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-30" align="start">
          <Calendar
            mode="single"
            selected={date ? new Date(date) : undefined}
            onSelect={handleSelect}
            month={month}
            className="rounded-md border"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function SubscriptionBillingTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    card: "",
    plan: "",
    status: "",
    startDate: "",
    endDate: "",
  });
  const [billings, setBillings] = useState(mockSubscriptionBillingData);
  const [selectedBillings, setSelectedBillings] = useState<string[]>([]);

  useEffect(() => {
    let filteredBillings = [...mockSubscriptionBillingData];

    // Search filter
    if (searchTerm) {
      filteredBillings = filteredBillings.filter(
        (billing) =>
          billing.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billing.card.toLowerCase().includes(searchTerm.toLowerCase()) ||
          billing.plan.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Card filter
    if (filter.card) {
      filteredBillings = filteredBillings.filter((billing) =>
        billing.card.toLowerCase().includes(filter.card.toLowerCase())
      );
    }

    // Plan filter
    if (filter.plan) {
      filteredBillings = filteredBillings.filter((billing) =>
        billing.plan.toLowerCase().includes(filter.plan.toLowerCase())
      );
    }

    // Status filter
    if (filter.status) {
      filteredBillings = filteredBillings.filter((billing) => 
        billing.status.toLowerCase() === filter.status.toLowerCase()
      );
    }

    // Date range filter
    if (filter.startDate && filter.endDate) {
      filteredBillings = filteredBillings.filter(
        (billing) =>
          new Date(billing.timestamp) >= new Date(filter.startDate) &&
          new Date(billing.timestamp) <= new Date(filter.endDate)
      );
    } else if (filter.startDate) {
      filteredBillings = filteredBillings.filter(
        (billing) => new Date(billing.timestamp) >= new Date(filter.startDate)
      );
    } else if (filter.endDate) {
      filteredBillings = filteredBillings.filter(
        (billing) => new Date(billing.timestamp) <= new Date(filter.endDate)
      );
    }

    setBillings(filteredBillings);
    setSelectedBillings([]);
  }, [searchTerm, filter.card, filter.plan, filter.status, filter.startDate, filter.endDate]);

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

  const handleResetFilters = () => {
    setFilter({
      card: "",
      plan: "",
      status: "",
      startDate: "",
      endDate: "",
    });
  };

  const handleApplyFilters = () => {
    // Filters are applied automatically in useEffect
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
            className="w-full sm:w-64 md:w-84 pr-8 py-2 text-xs sm:text-sm dark:bg-background rounded-lg border-[#F5F5F5] dark:border-[#1F1F1F]"
          />
          <SearchIcon className="absolute right-2 top-2.7 h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex space-x-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="border-[#F5F5F5] dark:border-[#1F1F1F] dark:bg-background flex items-center space-x-2">
                <FilterIcon />
                <span className="hidden sm:inline">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-84 bg-white border rounded-lg shadow-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <DropdownMenuLabel>Filter Billings</DropdownMenuLabel>
                <div className="space-x-2">
                  <Button variant="ghost" onClick={handleResetFilters} className="text-xs">
                    Reset
                  </Button>
                  <Button variant="default" onClick={handleApplyFilters} className="text-xs">
                    Apply Filter
                  </Button>
                </div>
              </div>
              <DropdownMenuSeparator />
              <div className="space-y-4">
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm">Date Range</label>
                  </div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <label htmlFor="start-date" className="text-xs text-gray-400 dark:text-gray-100">
                        From:
                      </label>
                      <DatePicker
                        id="start-date"
                        date={filter.startDate}
                        onSelect={(date) => setFilter((prev) => ({ ...prev, startDate: date }))}
                        placeholder="DD/MM/YY"
                      />
                    </div>
                    <div className="relative flex-1">
                      <label htmlFor="end-date" className="text-xs text-gray-400 dark:text-gray-100">
                        To:
                      </label>
                      <DatePicker
                        id="end-date"
                        date={filter.endDate}
                        onSelect={(date) => setFilter((prev) => ({ ...prev, endDate: date }))}
                        placeholder="DD/MM/YY"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm">Plan</label>
                  </div>
                  <select
                    value={filter.plan}
                    onChange={(e) => setFilter((prev) => ({ ...prev, plan: e.target.value }))}
                    className="w-full bg-[#F8F8F8] border-0 rounded p-2"
                  >
                    <option value="">All Plans</option>
                    <option value="Basic">Basic</option>
                    <option value="Pro">Pro</option>
                    <option value="Enterprise">Enterprise</option>
                    <option value="Premium">Premium</option>
                  </select>
                </div>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between">
                    <label className="text-sm">Status</label>
                  </div>
                  <select
                    value={filter.status}
                    onChange={(e) => setFilter((prev) => ({ ...prev, status: e.target.value }))}
                    className="w-full bg-[#F8F8F8] border-0 rounded p-2"
                  >
                    <option value="">All Status</option>
                    <option value="Success">Success</option>
                    <option value="Pending">Pending</option>
                    <option value="Failed">Failed</option>
                  </select>
                </div>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Table>
        <TableHeader className="bg-[#F5F5F5] dark:bg-background">
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
                        <DownloadIcon className="text-primary" /> Download Receipt
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