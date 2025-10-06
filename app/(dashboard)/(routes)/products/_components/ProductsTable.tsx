"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, FilterIcon, PlusIcon, SearchIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { BsThreeDots } from "react-icons/bs";
import { mockData } from "@/lib/mockdata";
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

interface Product {
  sku: string;
  productName: string;
  description?: string;
  stock: number;
  remanent: number;
  sales: number;
  status: string;
  createdAt: string;
  thumbnail: string | string[]; // Can be string or array of strings
  variants?: { id: string; size: string | number; color: string; price: number; quantity: number }[];
}

export default function ProductTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState<Product[]>(mockData as Product[]);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterDateRange, setFilterDateRange] = useState<{ from: Date | undefined; to: Date | undefined }>({ from: undefined, to: undefined });
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterStockRange, setFilterStockRange] = useState<{ min: number; max: number }>({ min: 0, max: Infinity });
  const [sortBy, setSortBy] = useState<string>("default");
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  useEffect(() => {
    let filteredProducts = [...mockData] as Product[];
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (filterDateRange.from && filterDateRange.to) {
      filteredProducts = filteredProducts.filter(
        (product) => {
          const productDate = new Date(product.createdAt);
          return productDate >= filterDateRange.from! && productDate <= filterDateRange.to!;
        }
      );
    }
    if (filterStatus) {
      filteredProducts = filteredProducts.filter(
        (product) => product.status === filterStatus
      );
    }
    if (filterStockRange.min !== 0 || filterStockRange.max !== Infinity) {
      filteredProducts = filteredProducts.filter(
        (product) => product.stock >= filterStockRange.min && product.stock <= filterStockRange.max
      );
    }

    filteredProducts.sort((a, b) => {
      switch (sortBy) {
        case "product name (A-Z)":
          return a.productName.localeCompare(b.productName);
        case "product name (Z-A)":
          return b.productName.localeCompare(a.productName);
        case "stock (High-Low)":
          return b.stock - a.stock;
        case "stock (Low-High)":
          return a.stock - b.stock;
        default:
          return 0;
      }
    });

    setProducts(filteredProducts);
    setSelectedProducts([]);
  }, [searchTerm, filterDateRange, filterStatus, filterStockRange, sortBy]);

  // Add event listener for product addition
  useEffect(() => {
    const handleProductAdded = (event: CustomEvent<Product>) => {
      setProducts((prev) => {
        // Check if product with the same SKU already exists
        const existingProduct = prev.find(p => p.sku === event.detail.sku);
        if (!existingProduct) {
          return [...prev, event.detail];
        }
        return prev; // Do not add if SKU exists
      });
      setCurrentPage(0); // Reset to first page
    };

    window.addEventListener("productAdded", handleProductAdded as EventListener);

    return () => {
      window.removeEventListener("productAdded", handleProductAdded as EventListener);
    };
  }, []);

  // Helper function to get the first thumbnail URL
  const getFirstThumbnail = (thumbnail: string | string[]): string => {
    if (Array.isArray(thumbnail)) {
      return thumbnail[0] || '/thumbnails/default.png';
    }
    return thumbnail || '/thumbnails/default.png';
  };

  const totalPages = Math.ceil(products.length / pageSize);
  const displayedProducts = products.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

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

  const handleDeleteConfirm = () => {
    if (selectedProduct) {
      setProducts(products.filter((p) => p.sku !== selectedProduct.sku));
      setIsDeleteModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const handleArchiveConfirm = () => {
    if (selectedProduct) {
      console.log(`Archiving product: ${selectedProduct.sku}`);
      setIsArchiveModalOpen(false);
      setSelectedProduct(null);
    }
  };

  const openDeleteModal = (product: Product) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };

  const openArchiveModal = (product: Product) => {
    setSelectedProduct(product);
    setIsArchiveModalOpen(true);
  };

  const clearFilters = () => {
    setFilterDateRange({ from: undefined, to: undefined });
    setFilterStatus("");
    setFilterStockRange({ min: 0, max: Infinity });
    setSortBy("default");
    setIsFilterOpen(false);
  };

  const handleAddProduct = (newProduct: Product) => {
    // Dispatch custom event to notify other components (no direct state update here)
    window.dispatchEvent(new CustomEvent("productAdded", { detail: newProduct }));
    setCurrentPage(0); // Reset to first page
  };

  const openDetailsModal = (product: Product) => {
    console.log("Opening details modal for:", product);
    setSelectedProduct(product);
    setIsEditMode(false); // View mode
    setIsDetailsModalOpen(true);
  };

  const openEditModal = (product: Product) => {
    console.log("Opening edit modal for:", product);
    setSelectedProduct(product);
    setIsEditMode(true); // Edit mode
    setIsDetailsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setProducts((prev) => prev.map((p) => (p.sku === product.sku ? product : p)));
    setIsDetailsModalOpen(false);
  };

  const handleDelete = (sku: string) => {
    setProducts((prev) => prev.filter((p) => p.sku !== sku));
    setIsDetailsModalOpen(false);
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
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Remanent</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Sales</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Status</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedProducts.length > 0 ? (
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
              <TableCell colSpan={9} className="text-center">
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4 space-x-2">
        <span className="text-sm">
          {`${(currentPage * pageSize) + 1}-${Math.min((currentPage + 1) * pageSize, products.length)} of ${products.length}`}
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