"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Eye, EyeOff } from "lucide-react";
import EditIcon from "@/components/svgIcons/Edit";
import SaveIcon from "@/components/svgIcons/SaveIcon";

interface AccessLog {
  id: string;
  action: string;
  date: string;
  device: string;
  ipAddress: string;
}

function SecurityComponent() {
  const [isEditingPassword, setIsEditingPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [passwordData, setPasswordData] = useState({
    currentPassword: "••••••••",
    newPassword: "",
    confirmPassword: "",
  });

  // Expanded mock data with more entries
  const allAccessLogs: AccessLog[] = [
    { id: "1", action: "Login", date: "18/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72.101" },
    { id: "2", action: "Product Listing", date: "19/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72.101" },
    { id: "3", action: "Order Status Update", date: "20/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72.101" },
    { id: "4", action: "Product Listing", date: "21/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72.101" },
    { id: "5", action: "Withdrawal", date: "22/02/2025", device: "Macbook Pro 2020", ipAddress: "172.168.88.202" },
    { id: "6", action: "Logout", date: "23/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72.101" },
    { id: "7", action: "Login", date: "24/02/2025", device: "Samsung Galaxy S24", ipAddress: "192.168.72.103" },
    { id: "8", action: "Price Update", date: "25/02/2025", device: "Macbook Pro 2020", ipAddress: "172.168.88.202" },
    { id: "9", action: "Inventory Check", date: "26/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72.101" },
    { id: "10", action: "Customer Support", date: "27/02/2025", device: "Windows Desktop", ipAddress: "192.168.72.104" },
    { id: "11", action: "Login", date: "28/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72.101" },
    { id: "12", action: "Order Processing", date: "01/03/2025", device: "Macbook Pro 2020", ipAddress: "172.168.88.202" },
    { id: "13", action: "Product Upload", date: "02/03/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72.101" },
  ];

  // Pagination configuration
  const itemsPerPage = 6;
  const totalPages = Math.ceil(allAccessLogs.length / itemsPerPage);

  // Calculate current page data
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccessLogs = allAccessLogs.slice(startIndex, endIndex);

  const handleEditPassword = () => setIsEditingPassword(true);
  const handleCancelPassword = () => {
    setIsEditingPassword(false);
    setPasswordData({
      currentPassword: "••••••••",
      newPassword: "",
      confirmPassword: "",
    });
  };
  const handleSavePassword = () => {
    setIsEditingPassword(false);
    // Save password logic here
  };

  const handleInputChange = (field: string, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total pages are less than or equal to max visible
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      // Calculate start and end of middle pages
      let start = Math.max(2, currentPage - 1);
      let end = Math.min(totalPages - 1, currentPage + 1);
      
      // Adjust if we're at the beginning
      if (currentPage <= 2) {
        end = 3;
      }
      
      // Adjust if we're at the end
      if (currentPage >= totalPages - 1) {
        start = totalPages - 2;
      }
      
      // Add ellipsis after first page if needed
      if (start > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (end < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page
      pages.push(totalPages);
    }
    
    return pages;
  };

  return (
    <div className="w-full space-y-6 mt-4">
    

      {/* Access Log Section */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <h2 className="text-sm font-medium">Access Log</h2>

            {/* Table without headers */}
            <Table>
              <TableBody>
                {currentAccessLogs.map((log) => (
                  <TableRow key={log.id} className="border-b last:border-b-0">
                    <TableCell className="font-medium py-6">{log.action}</TableCell>
                    <TableCell className="">{log.date}</TableCell>
                    <TableCell className="">{log.device}</TableCell>
                    <TableCell className="text-right">{log.ipAddress}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-center gap-2 pt-4">
              {/* Previous Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="w-8 h-8"
              >
                <span className="text-sm">&lt;</span>
              </Button>

              {/* Page Numbers */}
              {getPageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === '...' ? (
                    <span className="px-2 text-sm text-muted-foreground">...</span>
                  ) : (
                    <Button
                      variant={currentPage === page ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(page as number)}
                      className="w-8 h-8"
                    >
                      {page}
                    </Button>
                  )}
                </React.Fragment>
              ))}

              {/* Next Button */}
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="w-8 h-8"
              >
                <span className="text-sm">&gt;</span>
              </Button>
            </div>

            {/* Page Info */}
            <div className="text-center text-sm text-muted-foreground">
              Showing {startIndex + 1}-{Math.min(endIndex, allAccessLogs.length)} of {allAccessLogs.length} entries
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SecurityComponent;