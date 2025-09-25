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
import PreviewIcon from "@/components/svgIcons/PreviewIcon";
import DeleteIcon from "@/components/svgIcons/DeleteIcon";
import ActionModal from "@/components/ActionModal";
import ArchiveIcon2 from "@/components/svgIcons/ArchiveIcon2";
import DeleteIcon2 from "@/components/svgIcons/DeleteIcon2";

export default function ProductTable() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;
  const [searchTerm, setSearchTerm] = useState("");
  const [products, setProducts] = useState(mockData);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isArchiveModalOpen, setIsArchiveModalOpen] = useState(false);
       // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  useEffect(() => {
    let filteredProducts = [...mockData];
    if (searchTerm) {
      filteredProducts = filteredProducts.filter(
        (product) =>
          product.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.productName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setProducts(filteredProducts);
    setSelectedProducts([]);
  }, [searchTerm]);

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
      // Add archive logic here (e.g., update product status)
      console.log(`Archiving product: ${selectedProduct.sku}`);
      setIsArchiveModalOpen(false);
      setSelectedProduct(null);
    }
  };
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openDeleteModal = (product: any) => {
    setSelectedProduct(product);
    setIsDeleteModalOpen(true);
  };
     // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const openArchiveModal = (product: any) => {
    setSelectedProduct(product);
    setIsArchiveModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="flex justify-between mb-4 space-x-4">
        <div className="relative flex items-center pb-2 ">
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
          <Button variant="outline" className="border-[#F5F5F5] dark:border-[#1F1F1F] dark:bg-background"><FilterIcon /> <span className="hidden sm:inline ml-2">Filter</span></Button>
          <Button variant="outline" className="border-[#4FCA6A] text-[#4FCA6A] dark:bg-background" onClick={() => setIsProductModalOpen(true)}><PlusIcon className="text-[#4FCA6A]"/> <span className="hidden sm:inline ml-2">Add Product</span></Button>
        </div>
      </div>

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
                  <img
                    src={`/thumbnails/${product.sku}.png`}
                    alt={product.productName}
                    className="w-12 h-12 rounded object-cover"
                  />
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
                    }`}/>
                    {product.status}
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
                      <DropdownMenuItem>
                        <EyeIcon /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <EditIcon /> Edit Product
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <PreviewIcon /> Preview Product
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
      <AddProductModal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} />
      <ActionModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        titleText="Confirm Action"
        icon={<DeleteIcon2 />}
        heading="Delete Product"
        description="Are you sure you want to delete this product? This action cannot be undone."
        productImage={`/thumbnails/${selectedProduct?.sku}.png`}
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
        productImage={`/thumbnails/${selectedProduct?.sku}.png`}
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