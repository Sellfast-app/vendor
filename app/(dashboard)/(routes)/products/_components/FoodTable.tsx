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
import ArchiveIcon from "@/components/svgIcons/ArchiveIcon";
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
import Loading from "@/components/Loading";
import { toast } from "sonner";

// ─── Types ──────────────────────────────────────────────────────────────────

interface FoodApiItem {
  id: number;
  uid: string;
  storeId: string;
  name: string;
  description: string;
  product_images: string[];
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

export default function FoodTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [foodItems, setFoodItems] = useState<FrontendFoodItem[]>([]);
  const [selectedFoodItems, setSelectedFoodItems] = useState<string[]>([]);
  const [isAddFoodModalOpen, setIsAddFoodModalOpen] = useState(false);
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

      const response = await fetch(`/api/products/food`);

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
          items = items.filter(item => item.status === filterStatus);
        }

        // Client-side sorting
        if (sortBy !== "default") {
          items.sort((a, b) => {
            if (sortBy.includes("product name")) {
              return sortBy.includes("(A-Z)")
                ? a.productName.localeCompare(b.productName)
                : b.productName.localeCompare(a.productName);
            }
            if (sortBy.includes("stock")) {
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
  }, [searchTerm, filterStatus, sortBy]);

  // Fetch food items when filters or page changes
  useEffect(() => {
    fetchFoodItems();
  }, [fetchFoodItems]);

  useEffect(() => {
    setCurrentPage(0);
  }, [searchTerm, filterStatus, sortBy]);

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
    setIsAddFoodModalOpen(false);
    setCurrentPage(0);
    toast.success('Food item updated successfully!');
  };

  const openEditModal = (item: FrontendFoodItem) => {
    setSelectedFoodItem(item);
    setIsAddFoodModalOpen(true);
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
          <Button
            variant="outline"
            className="border-primary text-primary dark:bg-background"
            onClick={() => {
              setSelectedFoodItem(null);
              setIsAddFoodModalOpen(true);
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
              <Select onValueChange={setSortBy} value={sortBy}>
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="default">Default</SelectItem>
                  <SelectItem value="product name (A-Z)">Name (A-Z)</SelectItem>
                  <SelectItem value="product name (Z-A)">Name (Z-A)</SelectItem>
                  <SelectItem value="stock (High-Low)">Newest First</SelectItem>
                  <SelectItem value="stock (Low-High)">Oldest First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}

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
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Status</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
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
                      <DropdownMenuItem onClick={() => openEditModal(item)}>
                        <EditIcon /> Edit Item
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteModal(item)}>
                        <DeleteIcon /> <span className="text-[#E40101]">Delete Item</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <ArchiveIcon /> Archive Item
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                No food items found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

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
        isOpen={isAddFoodModalOpen}
        onClose={() => {
          setIsAddFoodModalOpen(false);
          setSelectedFoodItem(null);
        }}
        onFoodAdded={handleFoodAdded}
        onFoodUpdated={handleFoodUpdated}
        editFoodItem={selectedFoodItem}
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
