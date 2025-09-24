"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight} from "lucide-react";
import { useState, useEffect } from "react";
import { salesMockData } from "@/lib/mockdata";
import { Checkbox } from "@/components/ui/checkbox";

export default function SalesBreakdown() {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 6;
  const [searchTerm, ] = useState("");
  const [salesData, setSalesData] = useState(salesMockData);
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);

  useEffect(() => {
    let filteredData = [...salesMockData];
    if (searchTerm) {
      filteredData = filteredData.filter(
        (product) =>
          product.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    setSalesData(filteredData);
    setSelectedProducts([]);
  }, [searchTerm]);

  const totalPages = Math.ceil(salesData.length / pageSize);
  const displayedProducts = salesData.slice(currentPage * pageSize, (currentPage + 1) * pageSize);

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
      setSelectedProducts(displayedProducts.map((product) => product.id));
    } else {
      setSelectedProducts([]);
    }
  };

  const handleSelectProduct = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedProducts((prev) => [...prev, id]);
    } else {
      setSelectedProducts((prev) => prev.filter((productId) => productId !== id));
    }
  };

  return (
    <div className="w-full">
      <Table>
        <TableHeader className="bg-[#F5F5F5] dark:bg-background">
          <TableRow>
            <TableHead className="w-[50px]">
              <Checkbox
                checked={selectedProducts.length === displayedProducts.length && displayedProducts.length > 0}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Product</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Revenue</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Sales</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Reviews</TableHead>
            <TableHead className="font-semibold text-[#A0A0A0] text-sm">Views</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {displayedProducts.length > 0 ? (
            displayedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="py-6">
                  <Checkbox
                    checked={selectedProducts.includes(product.id)}
                    onCheckedChange={(checked) => handleSelectProduct(product.id, checked as boolean)}
                  />
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                      <div className="font-medium">{product.productName}</div>
                  </div>
                </TableCell>
                <TableCell >₦{product.revenue.toLocaleString()}</TableCell>
                <TableCell>{product.sales.toLocaleString()}</TableCell>
                <TableCell>
                  <span className="flex items-center">
                    {product.reviews}
                  </span>
                </TableCell>
                <TableCell>{product.views.toLocaleString()}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={8} className="text-center">
                No products found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <div className="flex justify-center mt-4 space-x-2">
        <span className="text-sm">
          {`${(currentPage * pageSize) + 1}-${Math.min((currentPage + 1) * pageSize, salesData.length)} of ${salesData.length}`}
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