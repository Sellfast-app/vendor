"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Trash2 } from "lucide-react";
import EditIcon from "@/components/svgIcons/Edit";
import SaveIcon from "@/components/svgIcons/SaveIcon";
import { Card, CardContent } from "@/components/ui/card";
import StoreIcon from "@/components/svgIcons/StoreIcon";
import Imag from "@/components/svgIcons/Image2";
import AddStoreModal from "./AddStoreModal";
import DeleteStoreModal from "./DeleteStoreModal";

interface Store {
  id: string;
  name: string;
  type: string;
  whatsappNumber: string;
  bio: string;
  image: string | null;
}

function AccountInformation() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [formData, setFormData] = useState({
    firstName: "Cassandra",
    lastName: "Kayla",
    email: "cassandrakayla@gmail.com",
    whatsappNumber: "809 789 7891",
    countryCode: "+234",
    country: "Nigeria",
    state: "Rivers",
    city: "Port Harcourt",
    lga: "Obio-Akpor",
    cacNumber: "RC123456",
    taxId: "NNNNNNNN-NNN",
    documentType: "",
  });

  const [stores, setStores] = useState<Store[]>([
    {
      id: "1",
      name: "Cassie's Kitchen",
      type: "Bakery • Lagos • Active",
      whatsappNumber: "+234 809 123 4567",
      bio: "A cozy bakery serving fresh pastries.",
      image: "/placeholder-store1.jpg",
    },
    {
      id: "2",
      name: "Burger Shack",
      type: "Restaurant • Lagos • Inactive",
      whatsappNumber: "+234 809 234 5678",
      bio: "Serving delicious burgers and fries.",
      image: "/placeholder-store2.jpg",
    },
    {
      id: "3",
      name: "Pizza Cafe",
      type: "Bakery • Lagos • Inactive",
      whatsappNumber: "+234 809 345 6789",
      bio: "Your go-to spot for authentic pizza.",
      image: "/placeholder-store3.jpg",
    },
  ]);

  const [isAddStoreModalOpen, setIsAddStoreModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [isEditStoreMode, setIsEditStoreMode] = useState(false);
  const [isDeleteStoreModalOpen, setIsDeleteStoreModalOpen] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = () => {
    setIsEditingProfile(false);
    // Save changes logic here
  };

  const handleEditBusiness = () => {
    setIsEditingBusiness(true);
  };

  const handleCancelBusiness = () => {
    setIsEditingBusiness(false);
  };

  const handleSaveBusiness = () => {
    setIsEditingBusiness(false);
    // Save changes logic here
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    setIsEditStoreMode(true);
    setIsAddStoreModalOpen(true);
  };

  const handleAddStore = () => {
    setEditingStore(null);
    setIsEditStoreMode(false);
    setIsAddStoreModalOpen(true);
  };

  const handleCloseStoreModal = () => {
    setIsAddStoreModalOpen(false);
    setEditingStore(null);
    setIsEditStoreMode(false);
  };

  const handleOpenDeleteModal = (store: Store) => {
    setStoreToDelete(store);
    setIsDeleteStoreModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (storeToDelete) {
      setStores(stores.filter(store => store.id !== storeToDelete.id));
      setStoreToDelete(null);
    }
  };

  return (
    <div className="w-full space-y-6">
      {/* Profile Section */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Profile</h2>
              {!isEditingProfile ? (
                <Button
                  onClick={handleEditProfile}
                  variant="outline"
                  size="sm"
                  className="dark:bg-background"
                >
                  <span className="hidden sm:inline mr-2">Edit</span>
                  <EditIcon />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelProfile} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} variant="default" size="sm">
                    <SaveIcon />
                    <span className="hidden sm:inline ml-2">Save Changes</span>
                  </Button>
                </div>
              )}
            </div>

            {/* Profile Picture */}
            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20">
                  <AvatarImage src="/placeholder-avatar.jpg" alt="Profile" />
                  <AvatarFallback>CK</AvatarFallback>
                </Avatar>
                {isEditingProfile && (
                  <button className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white">
                    <Camera className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Form Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* First Name */}
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-xs">
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditingProfile}
                  className="dark:bg-background"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-xs">
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditingProfile}
                  className="dark:bg-background"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-2 md:col-span-2 w-full md:w-[50%]">
                <Label htmlFor="email" className="text-xs">
                  Email *
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditingProfile}
                  className="dark:bg-background"
                />
              </div>
              {/* WhatsApp Number */}
              <div className="space-y-2 md:col-span-2 w-full md:w-[50%]">
                <Label htmlFor="whatsapp" className="text-xs">
                  WhatsApp Business Number *
                </Label>
                <div className="flex gap-2">
                  <Select
                    value={formData.countryCode}
                    onValueChange={(value) =>
                      handleInputChange("countryCode", value)
                    }
                    disabled={!isEditingProfile}
                  >
                    <SelectTrigger className="max-w-[120px] dark:bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+234">+234</SelectItem>
                      <SelectItem value="+1">+1</SelectItem>
                      <SelectItem value="+44">+44</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="whatsapp"
                    value={formData.whatsappNumber}
                    onChange={(e) =>
                      handleInputChange("whatsappNumber", e.target.value)
                    }
                    disabled={!isEditingProfile}
                    className="flex-1 dark:bg-background"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              {/* Country */}
              <div className="space-y-2 w-full">
                <Label htmlFor="country" className="text-xs">
                  Country *
                </Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                  disabled={!isEditingProfile}
                >
                  <SelectTrigger className="w-full dark:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Nigeria">Nigeria</SelectItem>
                    <SelectItem value="Ghana">Ghana</SelectItem>
                    <SelectItem value="Kenya">Kenya</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* State */}
              <div className="space-y-2 w-full">
                <Label htmlFor="state" className="text-xs">
                  State *
                </Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleInputChange("state", value)}
                  disabled={!isEditingProfile}
                >
                  <SelectTrigger className="w-full dark:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Rivers">Rivers</SelectItem>
                    <SelectItem value="Lagos">Lagos</SelectItem>
                    <SelectItem value="Abuja">Abuja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="city" className="text-xs">
                  City *
                </Label>
                <Select
                  value={formData.city}
                  onValueChange={(value) => handleInputChange("city", value)}
                  disabled={!isEditingProfile}
                >
                  <SelectTrigger className="w-full dark:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                    <SelectItem value="Ikeja">Ikeja</SelectItem>
                    <SelectItem value="Victoria Island">Victoria Island</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {/* LGA */}
              <div className="space-y-2 w-full">
                <Label htmlFor="lga" className="text-xs">
                  L.G.A *
                </Label>
                <Select
                  value={formData.lga}
                  onValueChange={(value) => handleInputChange("lga", value)}
                  disabled={!isEditingProfile}
                >
                  <SelectTrigger className="w-full dark:bg-background">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Obio-Akpor">Obio-Akpor</SelectItem>
                    <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                    <SelectItem value="Eleme">Eleme</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Linked Stores */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Linked Stores</h3>
              <Button
                variant="default"
                size="sm"
                onClick={handleAddStore}
              >
                <StoreIcon />
                <span className="ml-2 hidden sm:inline">Add Store</span>
              </Button>
            </div>

            <div className="space-y-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-4"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="w-12 h-12 rounded-md">
                      <AvatarImage src={store.image || ""} alt={store.name} />
                      <AvatarFallback>{store.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h4 className="font-medium text-sm">{store.name}</h4>
                      <p className="text-xs text-muted-foreground">{store.type}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {store.type.includes("Active") && (
                      <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                        Current
                      </span>
                    )}
                    {store.type.includes("Inactive") && (
                      <Button variant="outline" size="sm" className="dark:bg-background">
                        Switch
                      </Button>
                    )}
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="dark:bg-background"
                      onClick={() => handleEditStore(store)}
                    >
                      <span className="hidden sm:inline mr-2">Edit</span>
                      <EditIcon />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-destructive dark:bg-background"
                      onClick={() => handleOpenDeleteModal(store)}
                    >
                      <span className="hidden sm:inline mr-2">Delete</span>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          {/* Business Information */}
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Business Information</h3>
              {!isEditingBusiness ? (
                <Button
                  onClick={handleEditBusiness}
                  variant="outline"
                  size="sm"
                >
                  <span className="hidden sm:inline mr-2">Edit</span>
                  <EditIcon />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelBusiness} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button onClick={handleSaveBusiness} variant="default" size="sm">
                    <SaveIcon />
                    <span className="hidden sm:inline ml-2">Save Changes</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* CAC Number */}
              <div className="space-y-2">
                <Label htmlFor="cacNumber" className="text-xs">
                  CAC Number *
                </Label>
                <Input
                  id="cacNumber"
                  value={formData.cacNumber}
                  onChange={(e) => handleInputChange("cacNumber", e.target.value)}
                  disabled={!isEditingBusiness}
                  className="dark:bg-background"
                />
              </div>

              {/* Tax ID */}
              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-xs">
                  Tax Identification Number *
                </Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange("taxId", e.target.value)}
                  disabled={!isEditingBusiness}
                  className="dark:bg-background"
                />
              </div>

              {/* Document Type */}
              <div className="space-y-2">
                <Label htmlFor="documentType" className="text-xs">
                  Document Type *
                </Label>
                <Select
                  value={formData.documentType}
                  onValueChange={(value) =>
                    handleInputChange("documentType", value)
                  }
                  disabled={!isEditingBusiness}
                >
                  <SelectTrigger className="w-full dark:bg-background">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cac">CAC Certificate</SelectItem>
                    <SelectItem value="tin">TIN Certificate</SelectItem>
                    <SelectItem value="business">Business Permit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Document Upload */}
            <div className="border-1 border-dashed border-primary rounded-2xl p-8 text-center">
              <div className="flex flex-col items-center gap-2">
                <div className="flex items-center justify-center">
                  <Imag />
                </div>
                <p className="text-sm font-medium">
                  Upload document and business certificate
                </p>
                <p className="text-xs text-muted-foreground">Max 10MB, JPEG, PNG, PDF</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-medium text-destructive">
                  Danger Zone
                </h3>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all associated data
                </p>
              </div>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => setShowDeleteSection(!showDeleteSection)}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Account
              </Button>
            </div>

            {/* Delete Account Expanded Section */}
            {showDeleteSection && (
              <div className="space-y-4 pt-4">
                {/* Warning Alert */}
                <div className="bg-[#FFEFEF] border border-[#E40101] rounded-full p-4">
                  <div className="flex gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 flex-shrink-0" />
                    <p className="text-sm">
                      After making a deletion request, you will have{" "}
                      <span className="font-semibold">&quot;6 months&quot;</span>{" "}
                      to maintain this account.
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-center text-muted-foreground px-4">
                  To permanently erase your whole Swiftree account, click the
                  button below. This implies that you won&apos;t have access to
                  your stores created, products listed, orders and any
                  information related to this account. This action is
                  irreversible.
                </p>

                {/* Confirmation Input */}
                <div className="space-y-2">
                  <Label htmlFor="deleteConfirm" className="text-sm text-center block">
                    To delete account, enter{" "}
                    <span className="font-semibold">&quot;delete_my_account&quot;</span>
                  </Label>
                  <Input
                    id="deleteConfirm"
                    placeholder="Enter here..."
                    value={deleteConfirmText}
                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                    className="dark:bg-background"
                  />
                </div>

                {/* Action Buttons */}
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
                    disabled={deleteConfirmText !== "delete_my_account"}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AddStoreModal
        isOpen={isAddStoreModalOpen}
        onClose={handleCloseStoreModal}
        stores={stores}
        setStores={setStores}
        editStore={editingStore}
        isEditMode={isEditStoreMode}
      />

      <DeleteStoreModal
        isOpen={isDeleteStoreModalOpen}
        onClose={() => {
          setIsDeleteStoreModalOpen(false);
          setStoreToDelete(null);
        }}
        onConfirm={handleConfirmDelete}
        store={storeToDelete}
      />
    </div>
  );
}

export default AccountInformation;