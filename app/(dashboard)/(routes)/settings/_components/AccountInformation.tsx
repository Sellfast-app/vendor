"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Trash2 } from "lucide-react";
import EditIcon from "@/components/svgIcons/Edit";
import SaveIcon from "@/components/svgIcons/SaveIcon";
import { Card, CardContent } from "@/components/ui/card";
import StoreIcon from "@/components/svgIcons/StoreIcon";
import Imag from "@/components/svgIcons/Image2";
import AddStoreModal from "./AddStoreModal";
import DeleteStoreModal from "./DeleteStoreModal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface Store {
  id: string;
  name: string;
  type: string;
  whatsappNumber: string;
  bio: string;
  image: string | null;
}

interface GeoLocation {
  lat: number;
  lng: number;
}

interface GeocodeResult {
  formatted_address: string;
  geometry: { location: GeoLocation };
}

function AccountInformation() {
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isEditingBusiness, setIsEditingBusiness] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Updated form data structure for API integration
  const [formData, setFormData] = useState({
    // Personal Info
    firstName: "",
    lastName: "",
    email: "",
    whatsappNumber: "",
    countryCode: "+234",
    
    // Store/Address Info for API
    owner_name: "",
    address: "",
    address_line_2: "",
    city: "",
    state: "",
    post_code: "",
    phone: "",
    country: "NG",
    
    // Business Info
    cacNumber: "",
    taxId: "",
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

  // Geocoding function - EXACTLY as provided by backend dev
  async function geocode(address: string): Promise<GeocodeResult | null> {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${process.env.NEXT_PUBLIC_GOOGLE_API_KEY}`;

    console.log('🔍 Geocoding URL (key hidden):', url.replace(process.env.NEXT_PUBLIC_GOOGLE_API_KEY!, '***'));

    try {
      const res = await fetch(url);
      const data = await res.json();

      console.log('🔍 Geocoding API response status:', data.status);

      if (!data.results || !data.results.length) {
        console.error('❌ Geocoding: No results found');
        toast.error('Address not found. Please check the address.');
        return null;
      }

      const place = data.results[0];

      console.log('✅ Geocoding success - Location:', place.geometry.location);
      toast.success('Address validated successfully!');

      return {
        formatted_address: place.formatted_address,
        geometry: place.geometry,
      };
    } catch (error) {
      console.error("❌ Geocoding error:", error);
      toast.error('Failed to validate address. Please try again.');
      return null;
    }
  }

  const handleEditProfile = () => {
    setIsEditingProfile(true);
  };

  const handleCancelProfile = () => {
    setIsEditingProfile(false);
  };

  const handleSaveProfile = async () => {
    // Basic validation
    const requiredFields = ['owner_name', 'address', 'city', 'state', 'country'];
    const missingFields = requiredFields.filter(field => !formData[field as keyof typeof formData]?.toString().trim());
    
    if (missingFields.length > 0) {
      toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
      return;
    }

    setIsLoading(true);
    const saveToast = toast.loading('Updating profile...');

    try {
      // Geocode the address
      const fullAddress = `${formData.address}, ${formData.city}, ${formData.state}, ${formData.country}`;
      console.log('🔍 Full address for geocoding:', fullAddress);
      
      const geocodeResult = await geocode(fullAddress);

      if (!geocodeResult) {
        console.error('❌ Geocoding failed - stopping process');
        toast.dismiss(saveToast);
        return;
      }

      // Prepare the update data according to API structure
      const updateData = {
        metadata: {
          owner_name: formData.owner_name.trim(),
          address: formData.address.trim(),
          address_line_2: formData.address_line_2?.trim() || '',
          city: formData.city.trim(),
          state: formData.state.trim(),
          post_code: formData.post_code?.trim() || '',
          phone: formData.phone?.trim() || formData.whatsappNumber?.trim() || '',
          latitude: geocodeResult.geometry.location.lat,
          longitude: geocodeResult.geometry.location.lng,
          country: formData.country.trim(),
        }
      };

      console.log('🔍 Sending update data to API:', updateData);

      // Call the API route
      const response = await fetch('/api/store', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      console.log('🔍 API Response status:', response.status);

      const responseData = await response.json().catch(() => ({ error: 'Invalid JSON response' }));

      if (!response.ok) {
        console.error('❌ API Error response:', responseData);
        throw new Error(responseData.error || `Server error: ${response.status}`);
      }

      console.log('✅ Store updated successfully:', responseData);
      
      toast.dismiss(saveToast);
      toast.success('Profile updated successfully!');
      setIsEditingProfile(false);
      
    } catch (error) {
      console.error('❌ Error updating store:', error);
      toast.dismiss(saveToast);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditBusiness = () => {
    setIsEditingBusiness(true);
  };

  const handleCancelBusiness = () => {
    setIsEditingBusiness(false);
  };

  const handleSaveBusiness = () => {
    setIsEditingBusiness(false);
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
      toast.success('Store deleted successfully');
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
                  <Button 
                    onClick={handleSaveProfile} 
                    variant="default" 
                    size="sm"
                    disabled={isLoading}
                  >
                    <SaveIcon />
                    <span className="hidden sm:inline ml-2">
                      {isLoading ? "Saving..." : "Save Changes"}
                    </span>
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

            {/* Store Owner Name and Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="owner_name" className="text-xs">
                  Store Owner Name *
                </Label>
                <Input
                  id="owner_name"
                  value={formData.owner_name}
                  onChange={(e) => handleInputChange("owner_name", e.target.value)}
                  disabled={!isEditingProfile}
                  className="dark:bg-background"
                  placeholder="Enter store owner name"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-xs">
                  Business Phone *
                </Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditingProfile}
                  className="dark:bg-background"
                  placeholder="Enter business phone"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="country" className="text-xs">
                  Country *
                </Label>
                <Input
                  id="country"
                  value={formData.country}
                  onChange={(e) => handleInputChange("country", e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full dark:bg-background"
                  placeholder="Enter country"
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="state" className="text-xs">
                  State *
                </Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full dark:bg-background"
                  placeholder="Enter state"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="city" className="text-xs">
                  City *
                </Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full dark:bg-background"
                  placeholder="Enter city"
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="address" className="text-xs">
                  Address *
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full dark:bg-background"
                  placeholder="Enter full address"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-2 w-full">
                <Label htmlFor="address_line_2" className="text-xs">
                  Address Line 2
                </Label>
                <Input
                  id="address_line_2"
                  value={formData.address_line_2}
                  onChange={(e) => handleInputChange("address_line_2", e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full dark:bg-background"
                  placeholder="Apartment, suite, unit, etc."
                />
              </div>
              <div className="space-y-2 w-full">
                <Label htmlFor="post_code" className="text-xs">
                  Post Code *
                </Label>
                <Input
                  id="post_code"
                  value={formData.post_code}
                  onChange={(e) => handleInputChange("post_code", e.target.value)}
                  disabled={!isEditingProfile}
                  className="w-full dark:bg-background"
                  placeholder="Enter post code"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* REST OF THE CODE REMAINS EXACTLY THE SAME */}
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
                    <Button variant="ghost" size="icon" onClick={() => {router.push(`/settings/store/${store.id}`);}}>
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

              {/* Document Type - CHANGED TO INPUT */}
              <div className="space-y-2">
                <Label htmlFor="documentType" className="text-xs">
                  Document Type *
                </Label>
                <Input
                  id="documentType"
                  value={formData.documentType}
                  onChange={(e) => handleInputChange("documentType", e.target.value)}
                  disabled={!isEditingBusiness}
                  className="w-full dark:bg-background"
                  placeholder="e.g., CAC Certificate, TIN Certificate"
                />
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