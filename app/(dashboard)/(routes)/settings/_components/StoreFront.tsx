"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Trash2, Copy, ExternalLink, PlusIcon } from "lucide-react";
import EditIcon from "@/components/svgIcons/Edit";
import SaveIcon from "@/components/svgIcons/SaveIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import QrIcon from "@/components/svgIcons/QrIcon";
import LinkIcon from "@/components/svgIcons/LinkIcon";
import ThemeIcon from "@/components/svgIcons/ThemeIcon";

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  icon: string;
}

function StorefrontComponent() {
  const [isEditingStorefront, setIsEditingStorefront] = useState(false);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const [storefrontData, setStorefrontData] = useState({
    storeName: "Pizza Cafe",
    storeType: "Food & Restaurant",
    whatsappNumber: "809 789 7891",
    countryCode: "+254",
    location: "Lagos",
    bio: "Welcome to Pizza Cafe, where flavorful taste and food meets exceptional culinary experience with tasty treats that's guaranteed to warm your buds.",
    customUrl: "www.swiftree.com/cassandrakitchen",
  });

  const [bankAccounts] = useState<BankAccount[]>([
    {
      id: "1",
      accountNumber: "0102798098",
      bankName: "Access Bank",
      accountHolder: "Olasandra Kayla .A.",
      icon: "/access-bank-icon.png",
    },
    {
      id: "2",
      accountNumber: "9027895098",
      bankName: "Unity",
      accountHolder: "Olasandra Kayla .A.",
      icon: "/unity-bank-icon.png",
    },
    {
      id: "3",
      accountNumber: "2025092169",
      bankName: "Kuda Bank",
      accountHolder: "Olasandra Kayla .A.",
      icon: "/kuda-bank-icon.png",
    },
  ]);

  const [themeColor, setThemeColor] = useState("Surge Green");
  const [availabilityEnabled, setAvailabilityEnabled] = useState(true);

  const handleEditStorefront = () => setIsEditingStorefront(true);
  const handleCancelStorefront = () => setIsEditingStorefront(false);
  const handleSaveStorefront = () => {
    setIsEditingStorefront(false);
    // Save logic here
  };

  const handleEditTheme = () => setIsEditingTheme(true);
  const handleCancelTheme = () => setIsEditingTheme(false);
  const handleSaveTheme = () => {
    setIsEditingTheme(false);
    // Save logic here
  };

  const handleInputChange = (field: string, value: string) => {
    setStorefrontData((prev) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification here
  };

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-20 h-20 rounded-lg">
            <AvatarImage src="/placeholder-store.jpg" alt="Store Logo" />
            <AvatarFallback>PC</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-medium">Cassie&apos;s Kitchen</h3>
            <span className="text-xs">Food & Restaurant</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant={"outline"}><QrIcon/> <span className="hidden sm:inline">View QR Banner</span> </Button>
          <Button variant={"outline"}> <span className="hidden sm:inline">Visit Storefront</span>  <LinkIcon/></Button>
        </div>
      </div>
      {/* Storefront Setup */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-6 pt-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Storefront Setup</h2>
              {!isEditingStorefront ? (
                <Button
                  onClick={handleEditStorefront}
                  variant="outline"
                  size="sm"
                  className="dark:bg-background"
                >
                  <span className="hidden sm:inline mr-2">Edit</span>
                  <EditIcon />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelStorefront} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveStorefront} variant="default" size="sm">
                    <SaveIcon />
                    <span className="hidden sm:inline ml-2">Save Changes</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Store Logo */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 rounded-lg">
                  <AvatarImage src="/placeholder-store.jpg" alt="Store Logo" />
                  <AvatarFallback>PC</AvatarFallback>
                </Avatar>
                {isEditingStorefront && (
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Store Name */}
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-xs">
                  Store Name *
                </Label>
                <Input
                  id="storeName"
                  value={storefrontData.storeName}
                  onChange={(e) => handleInputChange("storeName", e.target.value)}
                  disabled={!isEditingStorefront}
                  className="dark:bg-background"
                />
              </div>

              {/* WhatsApp Business Number */}
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-xs">
                  WhatsApp Business Number *
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={storefrontData.countryCode}
                    onValueChange={(value) => handleInputChange("countryCode", value)}
                    disabled={!isEditingStorefront}
                  >
                    <SelectTrigger className="max-w-[120px] dark:bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+254">+254</SelectItem>
                      <SelectItem value="+234">+234</SelectItem>
                      <SelectItem value="+1">+1</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="whatsapp"
                    value={storefrontData.whatsappNumber}
                    onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                    disabled={!isEditingStorefront}
                    className="flex-1 dark:bg-background"
                  />
                </div>
              </div>

              {/* Store Type */}
              <div className="space-y-2">
                <Label htmlFor="storeType" className="text-xs">
                  Store Type *
                </Label>
                <Select
                  value={storefrontData.storeType}
                  onValueChange={(value) => handleInputChange("storeType", value)}
                  disabled={!isEditingStorefront}
                >
                  <SelectTrigger className="w-full dark:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food & Restaurant">Food & Restaurant</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                    <SelectItem value="Cafe">Cafe</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Location */}
              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs">
                  Location *
                </Label>
                <Select
                  value={storefrontData.location}
                  onValueChange={(value) => handleInputChange("location", value)}
                  disabled={!isEditingStorefront}
                >
                  <SelectTrigger className="w-full dark:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lagos">Lagos</SelectItem>
                    <SelectItem value="Abuja">Abuja</SelectItem>
                    <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs">
                Bio *
              </Label>
              <Textarea
                id="bio"
                value={storefrontData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditingStorefront}
                className="min-h-[100px] dark:bg-background resize-none"
                maxLength={500}
              />
              <div className="text-right text-xs text-muted-foreground">
                {storefrontData.bio.length}/500
              </div>
            </div>

            {/* Custom Storefront URL */}
            <div className="space-y-2">
              <Label htmlFor="customUrl" className="text-xs">
                Custom Storefront URL *
              </Label>
              <div className="flex gap-2 ">
                <div className="flex items-center gap-2 flex-1 px-2 py-1.5 border rounded-md dark:bg-background">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{storefrontData.customUrl}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(storefrontData.customUrl)}
                  className="dark:bg-background"
                >
                <span className="hidden sm:inline">Copy Link </span>  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Availability Setup */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Availability Setup</h3>
              <Switch
                checked={availabilityEnabled}
                onCheckedChange={setAvailabilityEnabled}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Setup */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Bank Account Setup</h3>
              <Button variant="outline" size="sm">
               <span className="hidden sm:inline">Add Bank Account</span>  <PlusIcon/>
              </Button>
            </div>

            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {/* Bank icon placeholder */}
                      <span className="text-xs font-bold">{account.bankName.slice(0, 2)}</span>
                    </div>
                    <div>
                      <h4 className="font-medium text-sm">{account.accountNumber}</h4>
                      <p className="text-xs text-muted-foreground">
                        {account.bankName} . {account.accountHolder}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme & Customization */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Theme & Customization</h3>
              {!isEditingTheme ? (
                <Button
                  onClick={handleEditTheme}
                  variant="outline"
                  size="sm"
                  className="dark:bg-background"
                >
                  <span className="hidden sm:inline mr-2">Edit</span>
                  <EditIcon />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelTheme} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTheme} variant="default" size="sm">
                    <SaveIcon />
                    <span className="hidden sm:inline ml-2">Save Changes</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <ThemeIcon/>
                <span className="text-sm">Theme</span>
              </div>
              <Select
                value={themeColor}
                onValueChange={setThemeColor}
                disabled={!isEditingTheme}
              >
                <SelectTrigger className="w-[180px] dark:bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Surge Green">Surge Green</SelectItem>
                  <SelectItem value="Ocean Blue">Ocean Blue</SelectItem>
                  <SelectItem value="Sunset Orange">Sunset Orange</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-destructive">Danger Zone</h3>
                <p className="text-xs text-muted-foreground">
                  After making a deletion request, you will have &quot;6 months&quot; to maintain this account.
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteSection(!showDeleteSection)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Store
              </Button>
            </div>

            {showDeleteSection && (
              <div className="space-y-4 pt-4">
                <div className="bg-[#FFEFEF] border border-[#E40101] rounded-lg p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <p className="text-sm">
                      To permanently erase your store, click the button below. This implies that you won&apos;t have access to data in these store, products listed, orders and any information related to this account. This action is irreversible.
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm" className="text-sm text-center block">
                    To delete account, enter{" "}
                    <span className="font-semibold">&quot;delete_pizza_cafe&quot;</span>
                  </Label>
                  <Input
                    id="deleteConfirm"
                    placeholder="Enter here..."
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="dark:bg-background"
                  />
                </div>

                <div className="flex gap-2 justify-end pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeleteSection(false);
                      setDeleteConfirmText("");
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    disabled={deleteConfirmText !== "delete_pizza_cafe"}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Store
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default StorefrontComponent;