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

  const accessLogs: AccessLog[] = [
    { id: "1", action: "Login", date: "18/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72" },
    { id: "2", action: "Product Listing", date: "19/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72" },
    { id: "3", action: "Order Status Update", date: "20/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72" },
    { id: "4", action: "Product Listing", date: "21/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72" },
    { id: "5", action: "Withdrawal", date: "22/02/2025", device: "Macbook Pro 2020", ipAddress: "172.168.88" },
    { id: "6", action: "Logout", date: "23/02/2025", device: "Iphone 15 Pro Max", ipAddress: "192.168.72" },
  ];

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

  return (
    <div className="w-full space-y-6 mt-4">
      {/* Password Section */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Password</h2>
              {!isEditingPassword ? (
                <Button
                  onClick={handleEditPassword}
                  variant="outline"
                  size="sm"
                  className="dark:bg-background"
                >
                  <span className="hidden sm:inline mr-2">Edit</span>
                  <EditIcon />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelPassword} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSavePassword} variant="default" size="sm">
                    <SaveIcon />
                    <span className="hidden sm:inline ml-2">Save Changes</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Password Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-xs">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={passwordData.currentPassword}
                    onChange={(e) => handleInputChange("currentPassword", e.target.value)}
                    disabled={!isEditingPassword}
                    className="dark:bg-background pr-10"
                  />
                  {isEditingPassword && (
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showCurrentPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* New Password */}
              <div className="space-y-2">
                <Label htmlFor="newPassword" className="text-xs">
                  New Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    placeholder="e.g., Password123#"
                    value={passwordData.newPassword}
                    onChange={(e) => handleInputChange("newPassword", e.target.value)}
                    disabled={!isEditingPassword}
                    className="dark:bg-background pr-10"
                  />
                  {isEditingPassword && (
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showNewPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs">
                  Confirm Password <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="e.g., Password123#"
                    value={passwordData.confirmPassword}
                    onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                    disabled={!isEditingPassword}
                    className="dark:bg-background pr-10"
                  />
                  {isEditingPassword && (
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Eye className="w-4 h-4 text-muted-foreground" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Access Log Section */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <h2 className="text-sm font-medium">Access Log</h2>

            {/* Table without headers */}
            <Table>
              <TableBody>
                {accessLogs.map((log) => (
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
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <span className="text-sm">&lt;</span>
              </Button>

              <Button
                variant={currentPage === 1 ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage(1)}
              >
                1
              </Button>

              <Button
                variant={currentPage === 2 ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage(2)}
              >
                2
              </Button>

              <span className="text-sm text-muted-foreground">...</span>

              <Button
                variant={currentPage === 5 ? "default" : "ghost"}
                size="sm"
                onClick={() => setCurrentPage(5)}
              >
                5
              </Button>

              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCurrentPage(Math.min(5, currentPage + 1))}
                disabled={currentPage === 5}
              >
                <span className="text-sm">&gt;</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SecurityComponent;