"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, FilterIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { BsThreeDots } from "react-icons/bs";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EyeIcon from "@/components/svgIcons/EyeIcon";
import EditIcon from "@/components/svgIcons/EditIcon";
import DeleteIcon from "@/components/svgIcons/DeleteIcon";
import DeleteIcon2 from "@/components/svgIcons/DeleteIcon2";
import ActionModal from "@/components/ActionModal";
import Image from "next/image";
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
import { Label } from "@/components/ui/label";
import AddFoodModal, { EditableFoodItem } from "./AddFoodModal";
import { getCurrencySymbol } from "@/lib/v2-currency";
import Loading from "@/components/Loading";
import { toast } from "sonner";
interface FoodTableProps {
  currency?: string;
  isAddModalOpen?: boolean;
  onAddModalOpenChange?: (open: boolean) => void;
  canManageProducts?: boolean;
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface FoodApiItem {
  id: number;
  uid: string;
  storeId: string;
  name: string;
  description: string;
  product_images: string[];
  discount_type?: 'fixed' | 'percentage' | null;
  discount_value?: number | string | null;
  type: string;
  status: string;
  availability: string;
  availabilityPeriod?: EditableFoodItem["availabilityPeriod"] | EditableFoodItem["availabilityPeriod"][];
  servingType: string[];
  servingTypePricing?: EditableFoodItem["servingTypePricing"];
  servingTypePrices?: EditableFoodItem["servingTypePrices"];
  category: string[];
  labels: string[];
  createdAt: string;
  updatedAt: string;
  deletedAt: null | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  addOnGroup: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  portion: any[];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  bundleConfig: any[];
}

interface FoodApiResponse {
  status: string;
  message: string;
  data: FoodApiItem[];
}

interface FrontendFoodItem extends EditableFoodItem {
  id: string;
  sku: string;
  productName: string;
  description?: string;
  stock: number;
  remanent: number;
  sales: number;
  status: string;
  createdAt: string;
  thumbnail: string | string[];
}

const transformFoodItem = (item: FoodApiItem): FrontendFoodItem => ({
  uid: item.uid,
  id: item.uid,  // Use uid as the ID
  sku: item.uid.substring(0, 8).toUpperCase(),
  name: item.name,
  productName: item.name,
  description: item.description,
  product_images: item.product_images || [],
  discount_type: item.discount_type ?? null,
  discount_value: item.discount_value ?? null,
  stock: 0,
  remanent: 0,
  sales: 0,
  status: mapStatusFromApi(item.status),
  createdAt: item.createdAt,
  thumbnail: item.product_images?.[0] || "/thumbnails/default.png",
  type: item.type,
  category: item.category || [],
  labels: item.labels || [],
  servingType: item.servingType || [],
  servingTypePricing: item.servingTypePricing || item.servingTypePrices || [],
  availability: item.availability,
  availabilityPeriod: Array.isArray(item.availabilityPeriod) ? item.availabilityPeriod[0] : item.availabilityPeriod,
  addOnGroup: item.addOnGroup || [],
  portion: item.portion || [],
  bundleConfig: item.bundleConfig || [],
});

const mapStatusFromApi = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'Available Today': 'Available Today',
    'Out of Stock': 'Out of Stock',
    'Seasonal': 'Seasonal',
  };
  return statusMap[status] || 'Available Today';
};

// ─── Component ──────────────────────────────────────────────────────────────

export default function FoodTable({ currency = "NGN", isAddModalOpen: controlledAddModalOpen, onAddModalOpenChange, canManageProducts = true }: FoodTableProps) {
  const [localAddModalOpen, setLocalAddModalOpen] = useState(false);
  const isAddModalOpen = controlledAddModalOpen ?? localAddModalOpen;
  const setAddModalOpen = onAddModalOpenChange ?? setLocalAddModalOpen;
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [foodItems, setFoodItems] = useState<FrontendFoodItem[]>([]);
  const [selectedFoodItems, setSelectedFoodItems] = useState<string[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedFoodItem, setSelectedFoodItem] = useState<FrontendFoodItem | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("default");
  const [isLoading, setIsLoading] = useState(true);
  const [totalFoodItems, setTotalFoodItems] = useState(0);

  // Fetch food items from API
  const fetchFoodItems = useCallback(async () => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/products/food?_t=${Date.now()}`, {
        cache: "no-store",
      });

      if (!response.ok) {
        throw new Error('Failed to fetch food items');
      }

      const result: FoodApiResponse = await response.json();

      if (result.status === 'success') {
        let items = result.data.map(transformFoodItem);  // data is already an array

        // Client-side filtering
        if (searchTerm) {
          const searchLower = searchTerm.toLowerCase();
          items = items.filter(item =>
            item.productName.toLowerCase().includes(searchLower) ||
            item.sku.toLowerCase().includes(searchLower)
          );
        }

        if (filterStatus) {
          items = items.filter(item => item.status.toLowerCase() === filterStatus.toLowerCase());
        }

        if (filterDateRange.from || filterDateRange.to) {
          const from = filterDateRange.from ? new Date(filterDateRange.from).setHours(0, 0, 0, 0) : undefined;
          const to = filterDateRange.to ? new Date(filterDateRange.to).setHours(23, 59, 59, 999) : undefined;
          items = items.filter((item) => {
            const createdAt = new Date(item.createdAt).getTime();
            if (!Number.isFinite(createdAt)) return false;
            return (from === undefined || createdAt >= from) && (to === undefined || createdAt <= to);
          });
        }

        // Client-side sorting
        if (sortBy !== "default") {
          items.sort((a, b) => {
            if (sortBy.includes("product name")) {
              return sortBy.includes("(A-Z)")
                ? a.productName.localeCompare(b.productName)
                : b.productName.localeCompare(a.productName);
            }
            if (sortBy.includes("created date")) {
              return sortBy.includes("(High-Low)")
                ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
            }
            return 0;
          });
        }

        setTotalFoodItems(items.length);
        setFoodItems(items);
      } else {
        throw new Error(result.message || 'Failed to fetch food items');
      }
    } catch (error) {
      console.error('Error fetching food items:', error);
      setFoodItems([]);
      toast.error('Failed to fetch food items');
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterStatus, sortBy, filterDateRange]);

  // Fetch food items when filters or page changes
  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

  // Add event listener for food item addition
  useEffect(() => {
    const handleFoodAdded = () => {
      fetchFoodItems();
      setCurrentPage(0);
    };

    window.addEventListener("foodAdded", handleFoodAdded);

    return () => {
      window.removeEventListener("foodAdded", handleFoodAdded);
    };
  }, [fetchFoodItems]);

  // Helper function to get the first thumbnail URL
  const getFirstThumbnail = (thumbnail: string | string[]): string => {
    if (Array.isArray(thumbnail)) {
      return thumbnail[0] || '/thumbnails/default.png';
    }
    return thumbnail || '/thumbnails/default.png';
  };

  const totalPages = Math.ceil(totalFoodItems / pageSize);
  const displayedFoodItems = foodItems.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

  const getPageNumbers = () => {
    const pages: Array<number | string> = [];
    if (totalPages <= 3) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      const lastPage = totalPages - 1;
      const startPage = Math.max(1, currentPage - 1);
      const endPage = Math.min(lastPage - 1, currentPage + 1);

      pages.push(0);
      if (startPage > 1) pages.push("...");

      for (let page = startPage; page <= endPage; page++) {
        pages.push(page);
      }

      if (endPage < lastPage - 1) pages.push("...");
      pages.push(lastPage);
    }
    return pages;
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedFoodItems(displayedFoodItems.map((item) => item.uid));
    } else {
      setSelectedFoodItems([]);
    }
  };

  const handleSelectFoodItem = (uid: string, checked: boolean) => {
    if (checked) {
      setSelectedFoodItems((prev) => [...prev, uid]);
    } else {
      setSelectedFoodItems((prev) => prev.filter((id) => id !== uid));
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Available Today":
        return "bg-[#EFFFE9] rounded-xl";
      case "Seasonal":
        return "bg-[#FFF5E8] rounded-xl";
      case "Out of Stock":
        return "bg-[#FFEFEF] rounded-xl";
      default:
        return "";
    }
  };

  const clearFilters = () => {
    setFilterDateRange({ from: undefined, to: undefined });
    setFilterStatus("");
    setSortBy("default");
    setIsFilterOpen(false);
    setSearchTerm("");
    setCurrentPage(0);
    toast.info('Filters cleared');
  };

  const handleFoodAdded = () => {
    window.dispatchEvent(new CustomEvent("foodAdded"));
    setCurrentPage(0);
    toast.success('Food item added successfully!');
  };

  const handleFoodUpdated = () => {
    window.dispatchEvent(new CustomEvent("foodAdded"));
    setSelectedFoodItem(null);
    setAddModalOpen(false);
    setCurrentPage(0);
    toast.success('Food item updated successfully!');
  };

  const openEditModal = (item: FrontendFoodItem) => {
    setSelectedFoodItem(item);
    setAddModalOpen(true);
  };

  const openDeleteModal = (item: FrontendFoodItem) => {
    setSelectedFoodItem(item);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!selectedFoodItem) return;

    try {
      setIsLoading(true);
      const response = await fetch(`/api/products/food?uid=${encodeURIComponent(selectedFoodItem.uid)}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || `Failed to delete food item: ${response.status}`);
      }

      setFoodItems((prev) => prev.filter((item) => item.uid !== selectedFoodItem.uid));
      setTotalFoodItems((prev) => Math.max(prev - 1, 0));
      toast.success('Food item deleted successfully!');
    } catch (error) {
      console.error('Error deleting food item:', error);
      toast.error(`Failed to delete food item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDeleteModalOpen(false);
      setSelectedFoodItem(null);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4 space-x-4">
        <div className="relative flex items-center pb-2">
          <Input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(0); }}
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
          <Button
            variant="outline"
            className="border-primary text-primary dark:bg-background"
            onClick={() => {
              setSelectedFoodItem(null);
              setAddModalOpen(true);
            }}
          >
            <PlusIcon className="text-primary" />
            <span className="hidden sm:inline ml-2">Add Food Item</span>
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-4 p-4 bg-white dark:bg-[#1F1F1F] rounded-lg border border-[#F5F5F5] dark:border-[#2D2D2D]">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateFilter">Date Range</Label>
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
                    onSelect={(range) => { setFilterDateRange({ from: range?.from, to: range?.to }); setCurrentPage(0); }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Status</Label>
              <Select onValueChange={(value) => { setFilterStatus(value); setCurrentPage(0); }} value={filterStatus}>
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Available Today">Available Today</SelectItem>
                  <SelectItem value="Seasonal">Seasonal</SelectItem>
                  <SelectItem value="Out of Stock">Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sortFilter">Sort By</Label>
              <Select onValueChange={(value) => { setSortBy(value); setCurrentPage(0); }} value={sortBy}>
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="product name (A-Z)">Name (A-Z)</SelectItem>
                  <SelectItem value="product name (Z-A)">Name (Z-A)</SelectItem>
                  <SelectItem value="created date (High-Low)">Newest First</SelectItem>
                  <SelectItem value="created date (Low-High)">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

      <div className="hidden md:block">
      <Table>
        <TableHeader className="bg-[#F5F5F5] dark:bg-background">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedFoodItems.length === displayedFoodItems.length && displayedFoodItems.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">SKU</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Thumbnail</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Food Name</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Type</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Category</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Availability</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Discount</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Status</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                <Loading />
              </TableCell>
            </TableRow>
          ) : displayedFoodItems.length > 0 ? (
            displayedFoodItems.map((item) => (
              <TableRow key={item.uid}>
                <TableCell>
                  <Checkbox
                    checked={selectedFoodItems.includes(item.uid)}
                    onCheckedChange={(checked) => handleSelectFoodItem(item.uid, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="text-primary underline">{item.sku}</TableCell>
                <TableCell>
                  <div className="relative w-12 h-12 rounded overflow-hidden">
                    <Image
                      src={getFirstThumbnail(item.thumbnail)}
                      alt={item.productName}
                      fill
                      className="object-cover"
                      sizes="48px"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/thumbnails/default.png'; }}
                    />
                  </div>
                </TableCell>
                <TableCell>{item.productName}</TableCell>
                <TableCell>{item.type}</TableCell>
                <TableCell>{item.category?.join(", ") || "-"}</TableCell>
                <TableCell>{item.availability}</TableCell>
                <TableCell>{item.discount_type && item.discount_value != null ? `${item.discount_type === 'percentage' ? `${item.discount_value}%` : `${getCurrencySymbol(currency)}${Number(item.discount_value).toLocaleString()}`} off` : '—'}</TableCell>

                <TableCell>
                  <span className={`flex items-center px-2 py-1 text-black rounded text-sm ${getStatusClass(item.status)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${item.status === "Available Today" ? "bg-[#53DC19]" :
                        item.status === "Seasonal" ? "bg-[#FFB347]" :
                          item.status === "Out of Stock" ? "bg-[#E40101]" : ""
                      }`} />
                    {item.status}
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
                      <DropdownMenuItem>
                        <EyeIcon /> View Details
                      </DropdownMenuItem>
                      {canManageProducts && <>
                        <DropdownMenuItem onClick={() => openEditModal(item)}><EditIcon /> Edit Item</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openDeleteModal(item)}><DeleteIcon /> <span className="text-[#E40101]">Delete Item</span></DropdownMenuItem>
                      </>}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={10} className="text-center py-8">
                No food items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {isLoading ? Array.from({ length: 4 }).map((_, index) => <div key={index} className="h-24 animate-pulse rounded-md border bg-muted/40" />)
          : displayedFoodItems.length ? displayedFoodItems.map(item => (
            <article key={item.uid} className="flex min-w-0 items-start gap-3 rounded-md border bg-card p-3">
              <Checkbox checked={selectedFoodItems.includes(item.uid)} onCheckedChange={checked => handleSelectFoodItem(item.uid, checked as boolean)} aria-label={`Select ${item.productName}`} />
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded border bg-muted">
                <Image src={getFirstThumbnail(item.thumbnail)} alt={item.productName} fill className="object-cover" sizes="56px" onError={event => { (event.target as HTMLImageElement).src = "/thumbnails/default.png"; }} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="break-words text-sm font-medium">{item.productName}</p>
                <p className="truncate text-xs text-muted-foreground">{item.sku}</p>
                <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span>{item.type}</span>
                  <span>{item.availability}</span>
                  <span>{item.status}</span>
                </div>
              </div>
              {canManageProducts && <Button type="button" size="sm" variant="outline" className="min-h-9 shrink-0 px-2" onClick={() => openEditModal(item)} aria-label={`Edit ${item.productName}`}><EditIcon /><span className="ml-1">Edit</span></Button>}
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button type="button" variant="ghost" size="icon" className="h-9 w-8 shrink-0" aria-label={`More actions for ${item.productName}`}><BsThreeDots className="h-4 w-4" /></Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {canManageProducts && <>
                    <DropdownMenuItem onClick={() => openDeleteModal(item)}><DeleteIcon /> Delete item</DropdownMenuItem>
                  </>}
                </DropdownMenuContent>
              </DropdownMenu>
            </article>
          )) : <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No food items found</p>}
      </div>

      <div className="flex justify-center mt-4 space-x-2">
        <span className="text-sm">
          {totalFoodItems > 0
            ? `${(currentPage * pageSize) + 1}-${Math.min((currentPage + 1) * pageSize, totalFoodItems)} of ${totalFoodItems}`
            : "0 of 0"}
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
          onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.max(totalPages - 1, 0)))}
          disabled={currentPage >= totalPages - 1}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <AddFoodModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setAddModalOpen(false);
          setSelectedFoodItem(null);
        }}
        onFoodAdded={handleFoodAdded}
        onFoodUpdated={handleFoodUpdated}
        editFoodItem={selectedFoodItem}
        currency={currency}
      />
      <ActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        titleText="Confirm Action"
        icon={<DeleteIcon2 />}
        heading="Delete Food Item"
        description="Are you sure you want to delete this food item? This action cannot be undone."
        productImage={selectedFoodItem ? getFirstThumbnail(selectedFoodItem.thumbnail) : '/thumbnails/default.png'}
        productName={selectedFoodItem?.productName || ""}
        productId={selectedFoodItem?.sku || ""}
        productPrice={selectedFoodItem?.sales.toLocaleString() || "0"}
        productStock={selectedFoodItem?.stock.toString() || "0"}
        confirmButtonColor="#E40101"
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  );
}
