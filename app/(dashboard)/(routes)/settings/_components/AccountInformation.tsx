"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Trash2, Upload, X } from "lucide-react";
import EditIcon from "@/components/svgIcons/Edit";
import SaveIcon from "@/components/svgIcons/SaveIcon";
import { Card, CardContent } from "@/components/ui/card";
import StoreIcon from "@/components/svgIcons/StoreIcon";
import Imag from "@/components/svgIcons/Image2";
import AddStoreModal from "./AddStoreModal";
import DeleteStoreModal from "./DeleteStoreModal";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

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
  const [cacFile, setCacFile] = useState<File | null>(null);
  const [cacFilePreview, setCacFilePreview] = useState<string | null>(null);
  const [isUploadingCac, setIsUploadingCac] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadTime, setUploadTime] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const uploadTimer = React.useRef<NodeJS.Timeout | null>(null);
  const uploadProgressTimer = React.useRef<NodeJS.Timeout | null>(null);
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
    documentType: "cac", // Default to 'cac' as per API docs
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

  // Format file size function
  const formatFileSize = (size: number) => {
    return size < 1024 * 1024
      ? `${(size / 1024).toFixed(2)} KB`
      : `${(size / (1024 * 1024)).toFixed(2)} MB`;
  };

  // Fetch store data from API for profile section
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsFetching(true);
        console.log('🔄 Starting to fetch store data for profile...');

        const response = await fetch('/api/store');

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch store data');
        }

        const result = await response.json();

        console.log('📦 Profile - Full API response:', result);
        console.log('📦 Profile - Store details data:', result.data?.storeDetails);

        if (result.status === 'success' && result.data?.storeDetails) {
          const storeDetails = result.data.storeDetails;
          const metadata = storeDetails.metadata || {};

          console.log('🎯 Profile - Extracted store details:', {
            owner_name: metadata.owner_name,
            phone: metadata.phone,
            address: metadata.address,
            city: metadata.city,
            state: metadata.state,
            country: metadata.country,
            post_code: metadata.post_code,
            address_line_2: metadata.address_line_2
          });

          // Populate form data with API response
          setFormData(prev => ({
            ...prev,
            owner_name: metadata.owner_name || "",
            phone: metadata.phone || "",
            address: metadata.address || "",
            address_line_2: metadata.address_line_2 || "",
            city: metadata.city || "",
            state: metadata.state || "",
            post_code: metadata.post_code || "",
            country: metadata.country || "NG",
            // You can also populate business info if available
            cacNumber: storeDetails.cac || "",
            taxId: storeDetails.tin || "",
            documentType: storeDetails.doctype || "cac" // Default to 'cac'
          }));

          console.log('✅ Profile data loaded successfully');
        } else {
          console.warn('⚠️ No store details found in response for profile');
        }
      } catch (error) {
        console.error('❌ Error fetching store data for profile:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load profile data');
      } finally {
        setIsFetching(false);
      }
    };

    fetchStoreData();
  }, []);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (uploadTimer.current) {
        clearInterval(uploadTimer.current);
      }
      if (uploadProgressTimer.current) {
        clearInterval(uploadProgressTimer.current);
      }
    };
  }, []);

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
    // Reset file state when canceling
    setCacFile(null);
    setCacFilePreview(null);
    setUploadProgress(0);
    setUploadTime(0);
    if (uploadTimer.current) clearInterval(uploadTimer.current);
    if (uploadProgressTimer.current) clearInterval(uploadProgressTimer.current);
  };

  const handleSaveBusiness = async () => {
    if (!formData.cacNumber || !formData.documentType) {
      toast.error('Please fill in CAC Number and Document Type fields');
      return;
    }
  
    setIsLoading(true);
    const saveToast = toast.loading('Updating business information...');
  
    try {
      // Prepare the update data
      const updateData = {
        cac: formData.cacNumber.trim(),
        doctype: formData.documentType.trim(),
      };
  
      console.log('🔍 Updating business info:', updateData);
  
      const response = await fetch('/api/store', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to update business information');
      }
  
      console.log('✅ Business info updated successfully:', result);
  
      toast.dismiss(saveToast);
      toast.success('Business information updated successfully!');
      setIsEditingBusiness(false); // This exits edit mode
  
      // Clear file state when successfully saved
      setCacFile(null);
      setCacFilePreview(null);
      setUploadProgress(0);
      setUploadTime(0);
      if (uploadTimer.current) clearInterval(uploadTimer.current);
      if (uploadProgressTimer.current) clearInterval(uploadProgressTimer.current);
  
    } catch (error) {
      console.error('❌ Error updating business info:', error);
      toast.dismiss(saveToast);
      toast.error(error instanceof Error ? error.message : 'Failed to update business information');
    } finally {
      setIsLoading(false);
    }
  };

const handleUploadAll = async () => {
  // First validate business info
  if (!formData.cacNumber || !formData.documentType) {
    toast.error('Please fill in CAC Number and Document Type fields');
    return;
  }

  try {
    // If there's a file selected, upload it first
    if (cacFile) {
      await handleUploadCac();
    }

    // Then save the business information
    await handleSaveBusiness();
    
  } catch (error) {
    console.error('❌ Error in upload process:', error);
    // Error already handled in individual functions
  }
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


  const handleCacFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    // Validate file type
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      toast.error('Invalid file type. Please upload JPEG, PNG, or PDF');
      return;
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File size exceeds 10MB limit');
      return;
    }

    setCacFile(file);

    // Create preview for images
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCacFilePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setCacFilePreview(null); // PDF files won't have preview
    }

    // Reset upload progress and start timer
    setUploadProgress(0);
    setUploadTime(0);

    toast.success('File selected successfully. Click "Upload" to upload the document.');
  };

  const handleUploadCac = async () => {
    if (!cacFile) {
      toast.error('Please select a file to upload');
      return;
    }
  
    if (!formData.cacNumber || !formData.documentType) {
      toast.error('Please fill in CAC Number and Document Type before uploading');
      return;
    }
  
    setIsUploadingCac(true);
    setUploadProgress(0);
    setUploadTime(0);
    const uploadToast = toast.loading('Uploading CAC document...');
  
    // Start upload time timer
    if (uploadTimer.current) clearInterval(uploadTimer.current);
    uploadTimer.current = setInterval(() => {
      setUploadTime((prev) => prev + 1);
    }, 1000);
  
    try {
      const uploadFormData = new FormData();
      
      uploadFormData.append('cert_media', cacFile);
      uploadFormData.append('cac', formData.cacNumber.trim());
      uploadFormData.append('doc_type', formData.documentType.trim());
  
      console.log('📤 Sending to Next.js API:');
      console.log('- Field "cert_media":', cacFile.name);
      console.log('- Field "cac":', formData.cacNumber);
      console.log('- Field "doc_type":', formData.documentType);
  
      // Start progress simulation
      let progress = 0;
      if (uploadProgressTimer.current) clearInterval(uploadProgressTimer.current);
      uploadProgressTimer.current = setInterval(() => {
        progress += 10;
        setUploadProgress(progress);
        if (progress >= 90) {
          clearInterval(uploadProgressTimer.current!);
        }
      }, 200);
  
      const response = await fetch('/api/store/cac', {
        method: 'POST',
        body: uploadFormData,
      });
  
      // Clear progress timer and set to 100%
      if (uploadProgressTimer.current) clearInterval(uploadProgressTimer.current);
      setUploadProgress(100);
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.message || 'Failed to upload CAC document');
      }
  
      console.log('✅ CAC upload successful:', result);
  
      if (uploadTimer.current) clearInterval(uploadTimer.current);
      toast.dismiss(uploadToast);
      toast.success('CAC document uploaded successfully!');
  
      // Clear file state after successful upload
      setCacFile(null);
      setCacFilePreview(null);
      setUploadProgress(0);
      setUploadTime(0);
      
      // Reset the file input
      const fileInput = document.getElementById('cac-upload') as HTMLInputElement;
      if (fileInput) fileInput.value = '';
  
    } catch (error) {
      console.error('❌ Error uploading CAC:', error);
      if (uploadTimer.current) clearInterval(uploadTimer.current);
      if (uploadProgressTimer.current) clearInterval(uploadProgressTimer.current);
      toast.dismiss(uploadToast);
      toast.error(error instanceof Error ? error.message : 'Failed to upload CAC document');
    } finally {
      setIsUploadingCac(false);
    }
  };

  const handleRemoveLogo = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCacFile(null);
    setCacFilePreview(null);
    setUploadProgress(0);
    setUploadTime(0);
    setIsUploadingCac(false);

    if (uploadTimer.current) clearInterval(uploadTimer.current);
    if (uploadProgressTimer.current) clearInterval(uploadProgressTimer.current);

    // Reset the file input
    const fileInput = document.getElementById('cac-upload') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  // Skeleton Loading State for Profile Section
  if (isFetching) {
    return (
      <div className="w-full space-y-6">
        {/* Profile Section Skeleton */}
        <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-20" />
              </div>

              <div className="flex items-center gap-4">
                <Skeleton className="w-20 h-20 rounded-full" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>

              <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2 w-full">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Other sections skeleton can be added here if needed */}
      </div>
    );
  }

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
                  <AvatarFallback>
                    {formData.owner_name ? formData.owner_name.substring(0, 2).toUpperCase() : 'CK'}
                  </AvatarFallback>
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
                  <Button
                    onClick={handleUploadAll} // Changed to handleUploadAll
                    variant="default"
                    size="sm"
                    disabled={isLoading || isUploadingCac}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline ml-2">
                      {isUploadingCac ? "Uploading..." : (isLoading ? "Saving..." : "Upload")}
                    </span>
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
                  placeholder="Enter CAC number"
                />
              </div>

              {/* Tax ID */}
              <div className="space-y-2">
                <Label htmlFor="taxId" className="text-xs">
                  Tax Identification Number
                </Label>
                <Input
                  id="taxId"
                  value={formData.taxId}
                  onChange={(e) => handleInputChange("taxId", e.target.value)}
                  disabled={true} 
                  className="dark:bg-background opacity-50 cursor-not-allowed"
                  placeholder="Coming soon"
                />
              </div>

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
                  placeholder="cac"
                />
              </div>
            </div>

            {/* Document Upload - Using your preferred UI */}
            <div className="space-y-4">
              <Label className="text-xs">CAC Document *</Label>

              {/* Clickable Upload Area - Using your preferred style */}
              <div
                className={`border-1 border-dashed border-primary rounded-2xl p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors ${!isEditingBusiness ? 'opacity-50 cursor-not-allowed' : cacFile ? 'bg-white dark:bg-gray-800 border-gray-300' : ' border-[#4FCA6A] '
                  }`}
                onClick={() => {
                  if (isEditingBusiness && !isUploadingCac && !cacFile) {
                    document.getElementById('cac-upload')?.click();
                  }
                }}
              >
                {/* Hidden file input */}
                <Input
                  id="cac-upload"
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"
                  onChange={handleCacFileChange}
                  disabled={!isEditingBusiness || isUploadingCac}
                  className="hidden"
                />

                {/* No File Selected State */}
                {!cacFile && (
                  <div className="flex flex-col items-center justify-center gap-3 py-3">
                    <span className="text-gray-500">
                      <Imag />
                    </span>
                    <p className="text-sm">
                      <span className="text-[#4FCA6A]">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-400">Max File Size: 10MB</p>
                  </div>
                )}

                {/* File Selected State - Using your preferred preview UI */}
                {cacFile && (
                  <div className="flex items-center justify-between gap-4">
                    {/* File Preview */}
                    <div className="flex items-center space-x-4">
                      {cacFilePreview ? (
                        <img
                          src={cacFilePreview}
                          alt="CAC Preview"
                          className="w-16 h-16 rounded object-cover"
                        />
                      ) : cacFile.type === 'application/pdf' ? (
                        <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded flex items-center justify-center">
                          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      ) : null}
                    </div>

                    {/* File Info */}
                    <div className="flex-1">
                      <p className="text-sm pb-3 font-medium truncate">{cacFile.name}</p>

                      {/* File Metadata */}
                      <div className="flex items-center space-x-3 text-xs text-gray-500 pb-1">
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                          </svg>
                          {formatFileSize(cacFile.size)}
                        </span>
                        <span className="flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {uploadTime} sec
                        </span>
                        {isUploadingCac && (
                          <span className="text-black dark:text-white font-medium">
                            {uploadProgress}%
                          </span>
                        )}
                      </div>

                      {/* Progress Bar - Show during upload */}
                      {isUploadingCac && (
                        <div className="w-full rounded-full bg-gray-200 dark:bg-gray-700 h-1">
                          <div
                            className="h-1 rounded-full bg-[#4FCA6A]"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>

                    {/* Remove Button */}
                    <div className="flex items-center">
                      <button
                        onClick={handleRemoveLogo}
                        disabled={isUploadingCac}
                        className={`rounded-xl p-2 transition-colors ${isUploadingCac
                            ? 'bg-gray-300 cursor-not-allowed'
                            : 'bg-[#979C9E] hover:bg-gray-500'
                          }`}
                      >
                        <X className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Upload Button - REMOVED as requested */}
            </div>
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