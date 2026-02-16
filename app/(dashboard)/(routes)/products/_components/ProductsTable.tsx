"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, FilterIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { BsThreeDots } from "react-icons/bs";
import { Checkbox } from "@/components/ui/checkbox";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import EyeIcon from "@/components/svgIcons/EyeIcon";
import AddProductModal from "./AddProductModal";
import EditIcon from "@/components/svgIcons/EditIcon";
import ArchiveIcon from "@/components/svgIcons/ArchiveIcon";
import DeleteIcon from "@/components/svgIcons/DeleteIcon";
import ActionModal from "@/components/ActionModal";
import ArchiveIcon2 from "@/components/svgIcons/ArchiveIcon2";
import DeleteIcon2 from "@/components/svgIcons/DeleteIcon2";
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
import { format } from "date-fns";
import { Label } from "@/components/ui/label";
import ProductDetailsModal from "./ProductDetailsModal";
import Loading from "@/components/Loading";
import { toast } from "sonner";

interface Product {
  id: string;
  store_id: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any 
  variants: any[];
  created_at: string;
  updated_at: string;
  product_sku: string;
  product_name: string;
  product_type: string;
  product_price: number;
  product_images: string[];
  product_status: string;
  est_prod_days_to: number;
  product_quantity: number;
  est_prod_days_from: number;
  product_description: string;
}

interface ApiResponse {
  status: string;
  message: string;
  data: {
    items: Product[];
    total: number;
    totalPages: number;
  };
}

interface FrontendProduct {
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
  variants?: { id: string; size: string | number; color: string; price: number; quantity: number }[];
}

// Transform API product to frontend format
const transformProduct = (product: Product): FrontendProduct => ({
  id: product.id,
  sku: product.product_sku,
  productName: product.product_name,
  description: product.product_description,
  stock: product.product_quantity,
  remanent: product.product_quantity, // Using same as stock for now
  sales: product.product_price,
  status: mapStatusFromApi(product.product_status),
  createdAt: product.created_at,
  thumbnail: product.product_images?.[0] || '/thumbnails/default.png',
  variants: Array.isArray(product.variants) ? product.variants : [],
});

const mapStatusFromApi = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'ready': 'Ready Stock',
    'made-to-order': 'Made-to-order',
    'out-of-stock': 'Out of Stock'
  };
  return statusMap[status] || 'Ready Stock';
};

const mapStatusToApi = (status: string): string => {
  const statusMap: { [key: string]: string } = {
    'Ready Stock': 'ready',
    'Made-to-order': 'made-to-order',
    'Out of Stock': 'out-of-stock'
  };
  return statusMap[status] || 'ready';
};

export default function ProductTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<FrontendProduct[]>([]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<FrontendProduct | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterStockRange, setFilterStockRange] = useState<{ min: number; max: number }>({ min: 0, max: Infinity });
  const [sortBy, setSortBy] = useState<string>("default");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [totalProducts, setTotalProducts] = useState(0);

  // Fetch products from API - wrapped in useCallback to prevent unnecessary recreations
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Build query parameters
      const queryParams = new URLSearchParams({
        page: (currentPage + 1).toString(),
        pageSize: pageSize.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(filterStatus && { status: mapStatusToApi(filterStatus) }),
        ...(sortBy !== "default" && { 
          sort: sortBy.includes("product name") ? "product_name" : "product_quantity",
          dir: sortBy.includes("(A-Z)") || sortBy.includes("(Low-High)") ? "asc" : "desc"
        }),
        ...(filterStockRange.min > 0 && { minPrice: filterStockRange.min.toString() }),
        ...(filterStockRange.max < Infinity && { maxPrice: filterStockRange.max.toString() }),
      });

      const response = await fetch(`/api/products?${queryParams}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const result: ApiResponse = await response.json();
      
      if (result.status === 'success') {
        const transformedProducts = result.data.items.map(transformProduct);
        setProducts(transformedProducts);
        setTotalProducts(result.data.total);
      } else {
        throw new Error(result.message || 'Failed to fetch products');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
      toast.error('Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, filterStatus, filterStockRange, sortBy, pageSize]);

  // Fetch products when filters or page changes
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Add event listener for product addition
  useEffect(() => {
    const handleProductAdded = () => {
      fetchProducts(); // Refresh the list
      setCurrentPage(0); // Reset to first page
    };

    window.addEventListener("productAdded", handleProductAdded);

    return () => {
      window.removeEventListener("productAdded", handleProductAdded);
    };
  }, [fetchProducts]);

  // Helper function to get the first thumbnail URL
  const getFirstThumbnail = (thumbnail: string | string[]): string => {
    if (Array.isArray(thumbnail)) {
      return thumbnail[0] || '/thumbnails/default.png';
    }
    return thumbnail || '/thumbnails/default.png';
  };

  const totalPages = Math.ceil(totalProducts / pageSize);
  const displayedProducts = products;

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
      setSelectedProducts(displayedProducts.map((product) => product.sku));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (sku: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, sku]);
    } else {
      setSelectedProducts((prev) => prev.filter((id) => id !== sku));
    }
  };

  const getStatusClass = (status: string) => {
    switch (status) {
      case "Ready Stock":
        return "bg-[#EFFFE9] rounded-xl";
      case "Made-to-order":
        return "bg-[#FFF5E8] rounded-xl";
      case "Out of Stock":
        return "bg-[#FFEFEF] rounded-xl";
      default:
        return "";
    }
  };

  const handleDeleteConfirm = async () => {
    if (selectedProduct) {
      try {
        setIsLoading(true);
        
        const response = await fetch(`/api/products/${selectedProduct.id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.message || `Failed to delete product: ${response.status}`);
        }

        if (result.status === 'success') {
          // Remove the product from local state
          setProducts(products.filter((p) => p.id !== selectedProduct.id));
          console.log("✅ Product deleted successfully:", result);
          toast.success('Product deleted successfully!');
        } else {
          throw new Error(result.message || 'Failed to delete product');
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        toast.error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
      } finally {
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
        setIsLoading(false);
      }
    }
  };

  const handleArchiveConfirm = () => {
    if (selectedProduct) {
      console.log(`Archiving product: ${selectedProduct.sku}`);
      setIsArchiveModalOpen(false);
      setSelectedProduct(null);
      toast.info('Archive functionality coming soon!');
    }
  };

  const openDeleteModal = (product: FrontendProduct) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const openArchiveModal = (product: FrontendProduct) => {
    setSelectedProduct(product);
    setIsArchiveModalOpen(true);
  };

  const clearFilters = () => {
    setFilterDateRange({ from: undefined, to: undefined });
    setFilterStatus("");
    setFilterStockRange({ min: 0, max: Infinity });
    setSortBy("default");
    setIsFilterOpen(false);
    setSearchTerm("");
    toast.info('Filters cleared');
  };

  const handleAddProduct = (newProduct: FrontendProduct) => {
    window.dispatchEvent(new CustomEvent("productAdded", { detail: newProduct }));
    setCurrentPage(0);
    toast.success('Product added successfully!');
  };

  const openDetailsModal = (product: FrontendProduct) => {
    setSelectedProduct(product);
    setIsEditMode(false);
    setIsDetailsModalOpen(true);
  };

  const openEditModal = (product: FrontendProduct) => {
    setSelectedProduct(product);
    setIsEditMode(true);
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (product: FrontendProduct) => {
    setProducts((prev) => prev.map((p) => (p.sku === product.sku ? product : p)));
    setIsDetailsModalOpen(false);
    toast.success('Product updated successfully!');
  };

  const handleDelete = async (product: FrontendProduct) => {
    try {
      setIsLoading(true);
      
      const response = await fetch(`/api/products/${product.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to delete product');
      }

      if (result.status === 'success') {
        setProducts((prev) => prev.filter((p) => p.id !== product.id));
        console.log("✅ Product deleted successfully:", result);
        toast.success('Product deleted successfully!');
      } else {
        throw new Error(result.message || 'Failed to delete product');
      }
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error(`Failed to delete product: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsDetailsModalOpen(false);
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4 space-x-4">
        <div className="relative flex items-center pb-2">
          <Input
            type="text"
            placeholder="Search by name/SKU..."
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
            className="border-[#4FCA6A] text-[#4FCA6A] dark:bg-background"
            onClick={() => setIsProductModalOpen(true)}
          >
            <PlusIcon className="text-[#4FCA6A]" />
            <span className="hidden sm:inline ml-2">Add Product</span>
          </Button>
        </div>
      </div>

      {isFilterOpen && (
        <div className="mb-4 p-4 bg-white dark:bg-[#1F1F1F] rounded-lg border border-[#F5F5F5] dark:border-[#2D2D2D]">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label htmlFor="stockFilter">Stock</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  id="stockMin"
                  value={filterStockRange.min === 0 ? "" : filterStockRange.min}
                  onChange={(e) => setFilterStockRange((prev) => ({ ...prev, min: e.target.value ? parseInt(e.target.value) : 0 }))}
                  placeholder="From"
                  className="dark:bg-background"
                />
                <Input
                  type="number"
                  id="stockMax"
                  value={filterStockRange.max === Infinity ? "" : filterStockRange.max}
                  onChange={(e) => setFilterStockRange((prev) => ({ ...prev, max: e.target.value ? parseInt(e.target.value) : Infinity }))}
                  placeholder="To"
                  className="dark:bg-background"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="statusFilter">Status</Label>
              <Select onValueChange={setFilterStatus} value={filterStatus}>
                <SelectTrigger className="w-full dark:bg-background">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Ready Stock">Ready Stock</SelectItem>
                  <SelectItem value="Made-to-order">Made-to-order</SelectItem>
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
                  <SelectItem value="product name (A-Z)">Product Name (A-Z)</SelectItem>
                  <SelectItem value="product name (Z-A)">Product Name (Z-A)</SelectItem>
                  <SelectItem value="stock (High-Low)">Stock (High-Low)</SelectItem>
                  <SelectItem value="stock (Low-High)">Stock (Low-High)</SelectItem>
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
                checked={selectedProducts.length === displayedProducts.length && displayedProducts.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">SKU</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Thumbnail</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Product Name</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Stock</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Remnant</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Sales</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Status</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
               < Loading />
              </TableCell>
            </TableRow>
          ) : displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <TableRow key={product.sku}>
                <TableCell>
                  <Checkbox
                    checked={selectedProducts.includes(product.sku)}
                    onCheckedChange={(checked) => handleSelectProduct(product.sku, checked as boolean)}
                  />
                </TableCell>
                <TableCell className="text-[#4FCA6A] underline">{product.sku}</TableCell>
                <TableCell>
                  <div className="relative w-12 h-12 rounded overflow-hidden">
                    <Image
                      src={getFirstThumbnail(product.thumbnail)}
                      alt={product.productName}
                      fill
                      className="object-cover"
                      sizes="48px"
                      onError={(e) => { (e.target as HTMLImageElement).src = '/thumbnails/default.png'; }}
                    />
                  </div>
                </TableCell>
                <TableCell>{product.productName}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>{product.remanent}</TableCell>
                <TableCell>₦{product.sales.toLocaleString()}</TableCell>
                <TableCell>
                  <span className={`flex items-center px-2 py-1 text-black rounded text-sm ${getStatusClass(product.status)}`}>
                    <span className={`w-2 h-2 rounded-full mr-2 ${product.status === "Ready Stock" ? "bg-[#53DC19]" :
                      product.status === "Made-to-order" ? "bg-[#FFB347]" :
                        product.status === "Out of Stock" ? "bg-[#E40101]" : ""
                      }`} />
                    {product.status}
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
                      <DropdownMenuItem onClick={() => openDetailsModal(product)}>
                        <EyeIcon /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openEditModal(product)}>
                        <EditIcon /> Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openDeleteModal(product)}>
                        <DeleteIcon /> <span className="text-[#E40101]">Delete Product</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => openArchiveModal(product)}>
                        <ArchiveIcon /> Archive Product
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={9} className="text-center py-8">
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4 space-x-2">
        <span className="text-sm">
          {`${(currentPage * pageSize) + 1}-${Math.min((currentPage + 1) * pageSize, totalProducts)} of ${totalProducts}`}
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

      <AddProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setIsEditMode(false);
        }}
        onEdit={handleEdit}
        onDelete={handleDelete}
        product={selectedProduct}
        isEditMode={isEditMode}
      />
      <ActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        titleText="Confirm Action"
        icon={<DeleteIcon2 />}
        heading="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        productImage={selectedProduct ? getFirstThumbnail(selectedProduct.thumbnail) : '/thumbnails/default.png'}
        productName={selectedProduct?.productName || ""}
        productId={selectedProduct?.sku || ""}
        productPrice={selectedProduct?.sales.toLocaleString() || "0"}
        productStock={selectedProduct?.stock.toString() || "0"}
        confirmButtonColor="#E40101"
        confirmText="Delete"
        cancelText="Cancel"
      />
      <ActionModal
        isOpen={isArchiveModalOpen}
        onClose={() => setIsArchiveModalOpen(false)}
        onConfirm={handleArchiveConfirm}
        titleText="Confirm Action"
        icon={<ArchiveIcon2 />}
        heading="Archive Product"
        description="Are you sure you want to archive this product?"
        productImage={selectedProduct ? getFirstThumbnail(selectedProduct.thumbnail) : '/thumbnails/default.png'}
        productName={selectedProduct?.productName || ""}
        productId={selectedProduct?.sku || ""}
        productPrice={selectedProduct?.sales.toLocaleString() || "0"}
        productStock={selectedProduct?.stock.toString() || "0"}
        confirmButtonColor="#3B82F6"
        confirmText="Archive"
        cancelText="Cancel"
      />
    </div>
  );
}