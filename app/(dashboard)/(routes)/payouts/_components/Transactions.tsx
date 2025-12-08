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
import { Popover, PopoverContent, PopoverTrigger } from "@radix-ui/react-popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

// Interface for Transaction based on actual API response
interface Transaction {
  id: string;
  store_id: string;
  amount: string;
  currency: string;
  transaction_status: number;
  reference: string;
  meta_data: {
    email: string;
    order_id: string;
    vendor_id: string;
    total_paid: number;
    access_code: string;
    items_total: number;
    delivery_fee: number;
    paystack_fee: number;
    delivery_rate: {
      fee: number;
      name: string;
      code: string;
      pickup_date: string;
      delivery_date: string;
      delivery_window: string;
      pickup_window: string;
    } | null;
    split_applied: boolean;
    intended_split: {
      totalPaid: number;
      paystackFee: number;
      businessShare: number;
      platformShare: number;
    };
    authorization_url: string;
    vendor_subaccount: string;
    platform_fee_percent: number;
  };
  created_at: string;
  updated_at: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    items: Transaction[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

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

// COMPLETE UPDATED TRANSACTIONS TABLE CODE
export default function TransactionsTable() {
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    status: "",
    startDate: "",
    endDate: "",
  });
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Fetch transactions from API
  const fetchTransactions = async () => {
    setIsLoading(true);
    try {
      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filter.status && { status: filter.status }),
        ...(filter.startDate && { startDate: filter.startDate }),
        ...(filter.endDate && { endDate: filter.endDate }),
      });

      const response = await fetch(`/api/transactions?${queryParams}`);
      const result: ApiResponse = await response.json();

      console.log('Transactions API Response:', result);

      if (result.status === 'success') {
        const transactionsData = result.data.items || [];
        setTransactions(transactionsData);
        setTotalCount(result.data.total || 0);
        setTotalPages(result.data.totalPages || 0);
        
        console.log(`Loaded ${transactionsData.length} transactions`);
      } else {
        toast.error(result.message || 'Failed to fetch transactions');
        setTransactions([]);
        setTotalCount(0);
        setTotalPages(0);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
      toast.error('Failed to load transactions');
      setTransactions([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [currentPage, searchTerm, filter]);

  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      
      if (currentPage > 3) pages.push("...");
      
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) pages.push("...");
      
      pages.push(totalPages);
    }
    return pages;
  };

  const handleResetFilters = () => {
    setFilter({
      status: "",
      startDate: "",
      endDate: "",
    });
    setSearchTerm("");
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchTransactions();
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTransactions(transactions.map((transaction) => transaction.id));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectTransaction = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedTransactions((prev) => [...prev, id]);
    } else {
      setSelectedTransactions((prev) => prev.filter((item) => item !== id));
    }
  };

  const getStatusClass = (status: number) => {
    switch (status) {
      case 1:
        return "bg-[#EFFFE9] rounded-xl text-[#53DC19]";
      case 0:
        return "bg-[#FFF5E8] rounded-xl text-[#FFB347]";
      case 2:
      case 3:
        return "bg-[#FFEFEF] rounded-xl text-[#E40101]";
      default:
        return "bg-gray-100 rounded-xl text-gray-600";
    }
  };

  const getStatusText = (status: number) => {
    switch (status) {
      case 1:
        return "Completed";
      case 0:
        return "Pending";
      case 2:
        return "Failed";
      case 3:
        return "Cancelled";
      default:
        return "Unknown";
    }
  };

  const formatCurrency = (amount: string | number, currency: string = "NGN") => {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
    }).format(numAmount);
  };

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "N/A";
    }
  };

  const handleDownloadReceipt = (transaction: Transaction) => {
    const deliveryRate = transaction.meta_data.delivery_rate;
    
    // Generate receipt data with null-safe handling
    const receiptData = {
      transactionId: transaction.id,
      reference: transaction.reference,
      customerEmail: transaction.meta_data.email,
      amount: formatCurrency(transaction.amount, transaction.currency),
      deliveryFee: formatCurrency(transaction.meta_data.delivery_fee || 0, transaction.currency),
      totalPaid: formatCurrency(transaction.meta_data.total_paid, transaction.currency),
      status: getStatusText(transaction.transaction_status),
      pickupDate: deliveryRate ? formatDateTime(deliveryRate.pickup_date) : "N/A",
      deliveryDate: deliveryRate ? formatDateTime(deliveryRate.delivery_date) : "N/A",
      deliveryService: deliveryRate?.name || "N/A",
      orderId: transaction.meta_data.order_id,
      date: formatDateTime(transaction.created_at),
    };

    // Create and download receipt as JSON
    const blob = new Blob([JSON.stringify(receiptData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt_${transaction.reference}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Skeleton loader for table rows
  const TableRowSkeleton = () => (
    <>
      {Array.from({ length: pageSize }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-4 w-4" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-6 w-20 rounded-full" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-8 w-8 rounded-md" />
          </TableCell>
        </TableRow>
      ))}
    </>
  );

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4 space-x-4">
        <div className="relative flex items-center pb-2">
          <Input
            type="text"
            placeholder="Search by email or reference..."
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
                <DropdownMenuLabel>Filter Transactions</DropdownMenuLabel>
                <div className="flex space-x-2">
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
                        placeholder="Start Date"
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
                        placeholder="End Date"
                      />
                    </div>
                  </div>
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
                    <option value="0">Pending</option>
                    <option value="1">Completed</option>
                    <option value="2">Failed</option>
                    <option value="3">Cancelled</option>
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
                checked={selectedTransactions.length === transactions.length && transactions.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Customer Email</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Amount</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Delivery Fee</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Pickup Date</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Delivery Date</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Status</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRowSkeleton />
          ) : transactions.length > 0 ? (
            transactions.map((transaction) => {
              const deliveryRate = transaction.meta_data.delivery_rate;
              
              return (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedTransactions.includes(transaction.id)}
                      onCheckedChange={(checked) => handleSelectTransaction(transaction.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    {transaction.meta_data.email}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(transaction.amount, transaction.currency)}
                  </TableCell>
                  <TableCell className="font-semibold">
                    {formatCurrency(transaction.meta_data.delivery_fee || 0, transaction.currency)}
                  </TableCell>
                  <TableCell>
                    {deliveryRate ? (
                      <>
                        {formatDate(deliveryRate.pickup_date)}
                        <div className="text-xs text-muted-foreground">
                          {deliveryRate.pickup_window || "N/A"}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {deliveryRate ? (
                      <>
                        {formatDate(deliveryRate.delivery_date)}
                        <div className="text-xs text-muted-foreground">
                          {deliveryRate.delivery_window || "N/A"}
                        </div>
                      </>
                    ) : (
                      <span className="text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <span className={`flex items-center px-2 py-1 rounded text-sm capitalize ${getStatusClass(transaction.transaction_status)}`}>
                      <span className={`w-2 h-2 rounded-full mr-2 ${
                        transaction.transaction_status === 1 ? "bg-[#53DC19]" :
                        transaction.transaction_status === 0 ? "bg-[#FFB347]" : "bg-[#E40101]"
                      }`} />
                      {getStatusText(transaction.transaction_status)}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="p-0">
                          <BsThreeDots className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => window.open(`/transactions/${transaction.id}`, "_blank")}>
                          <EyeIcon /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownloadReceipt(transaction)} className="text-primary">
                          <DownloadIcon className="text-primary" /> Download Receipt
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              );
            })
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                No transactions found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm text-muted-foreground">
          Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalCount)} of {totalCount} transactions
        </span>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1 || isLoading}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          {getPageNumbers().map((page, index) => (
            <span key={index}>
              {page === "..." ? (
                <span className="px-2 text-sm">...</span>
              ) : (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setCurrentPage(Number(page))}
                  disabled={isLoading}
                >
                  {page}
                </Button>
              )}
            </span>
          ))}
          
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
      </div>
    </div>
  );
}