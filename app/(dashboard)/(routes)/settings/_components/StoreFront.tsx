"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Trash2, Copy, ExternalLink, PlusIcon, Loader2 } from "lucide-react";
import EditIcon from "@/components/svgIcons/Edit";
import SaveIcon from "@/components/svgIcons/SaveIcon";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import QrIcon from "@/components/svgIcons/QrIcon";
import LinkIcon from "@/components/svgIcons/LinkIcon";
import ThemeIcon from "@/components/svgIcons/ThemeIcon";
import AddBankModal from "../../payouts/_components/AddBankModal";
import Accessbank from "@/components/svgIcons/Accessbank";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface BankAccount {
  id: string;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  icon: React.ReactNode;
}

interface StoreDetails {
  storeName: string;
  storeType: string;
  whatsappNumber: string;
  countryCode: string;
  location: string;
  bio: string;
  customUrl: string;
  logo?: string | null;
}

function StorefrontComponent() {
  const [isEditingStorefront, setIsEditingStorefront] = useState(false);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [storefrontUrl, setStorefrontUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [storefrontData, setStorefrontData] = useState<StoreDetails>({
    storeName: "",
    storeType: "",
    whatsappNumber: "",
    countryCode: "+234",
    location: "Lagos",
    bio: "",
    customUrl: "www.swiftree.com/cassandrakitchen",
    logo: null,
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [themeColor, setThemeColor] = useState("Surge Green");
  const [availabilityEnabled, setAvailabilityEnabled] = useState(true);

  // Fetch store data from API
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setIsLoading(true);
        console.log('🔄 Starting to fetch store data...');
        
        const response = await fetch('/api/store');
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to fetch store data');
        }
        
        const result = await response.json();
        
        console.log('📦 Full API response:', result);
        console.log('📦 Store details data:', result.data?.storeDetails);
        
        if (result.status === 'success' && result.data?.storeDetails) {
          const storeDetails = result.data.storeDetails;
          const metadata = storeDetails.metadata || {};
          
          console.log('🎯 Extracted store details:', {
            name: storeDetails.store_name,
            type: storeDetails.business_type,
            bio: storeDetails.store_description,
            phone: metadata.phone,
            city: metadata.city,
            logo: storeDetails.logo
          });
          
          // Determine country code based on phone number
          let countryCode = "+234"; // Default to Nigeria
          if (metadata.phone) {
            if (metadata.phone.startsWith('+1')) {
              countryCode = "+1";
            } else if (metadata.phone.startsWith('+254')) {
              countryCode = "+254";
            } else if (metadata.phone.startsWith('0') || metadata.phone.startsWith('+234')) {
              countryCode = "+234";
            }
          }

          // Format phone number (remove country code if present)
          let formattedPhone = metadata.phone || "";
          if (formattedPhone.startsWith('+234')) {
            formattedPhone = formattedPhone.replace('+234', '0');
          } else if (formattedPhone.startsWith('234')) {
            formattedPhone = '0' + formattedPhone.slice(3);
          } else if (formattedPhone.startsWith('+1')) {
            formattedPhone = formattedPhone.slice(2);
          } else if (formattedPhone.startsWith('+254')) {
            formattedPhone = formattedPhone.slice(4);
          }

          setStorefrontData(prev => ({
            ...prev,
            storeName: storeDetails.store_name || "",
            storeType: storeDetails.business_type || "",
            bio: storeDetails.store_description || "",
            whatsappNumber: formattedPhone,
            countryCode: countryCode,
            location: metadata.city || "Lagos",
            logo: storeDetails.logo || null
          }));
          
          console.log('✅ Store data loaded successfully into state:', {
            storeName: storeDetails.store_name,
            storeType: storeDetails.business_type,
            bio: storeDetails.store_description,
            whatsappNumber: formattedPhone,
            countryCode: countryCode,
            location: metadata.city,
            logo: storeDetails.logo
          });
          toast.success('Store data loaded successfully');
        } else {
          console.warn('⚠️ No store details found in response');
          toast.warning('No store data found');
        }
      } catch (error) {
        console.error('❌ Error fetching store data:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load store data');
        
        // Set fallback values
        setStorefrontData(prev => ({
          ...prev,
          storeName: "Pizza Cafe",
          storeType: "Food & Restaurant",
          bio: "Welcome to Pizza Cafe, where flavorful taste and food meets exceptional culinary experience with tasty treats that's guaranteed to warm your buds.",
          whatsappNumber: "809 789 7891",
          countryCode: "+234",
          location: "Lagos"
        }));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreData();
  }, []);

  // Debug effect to log when storefrontData changes
  useEffect(() => {
    console.log('🔄 storefrontData updated:', storefrontData);
  }, [storefrontData]);

  // Existing storefront URL effect
  useEffect(() => {
    const getCookie = (name: string) => {
      const value = `; ${document.cookie}`;
      const parts = value.split(`; ${name}=`);
      if (parts.length === 2) return parts.pop()?.split(';').shift();
      return null;
    };

    const urlFromCookie = getCookie("store_url");
    if (urlFromCookie) {
      try {
        const decodedUrl = decodeURIComponent(urlFromCookie);
        setStorefrontUrl(decodedUrl);
      } catch {
        setStorefrontUrl(urlFromCookie);
      }
    }
  }, []);

  // Handle logo upload
  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    setIsUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);

      const response = await fetch('/api/store', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload logo');
      }

      // Update the logo in local state
      if (result.data?.logo) {
        setStorefrontData(prev => ({
          ...prev,
          logo: result.data.logo
        }));
        toast.success('Logo uploaded successfully!');
      } else {
        toast.success('Logo updated successfully!');
      }

      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

    } catch (error) {
      console.error('❌ Logo upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload logo');
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleEditStorefront = () => setIsEditingStorefront(true);
  const handleCancelStorefront = () => setIsEditingStorefront(false);
  const handleSaveStorefront = () => {
    setIsEditingStorefront(false);
    toast.success('Changes saved successfully!');
    // TODO: Add PATCH API call here for other store details
  };

  const handleEditTheme = () => setIsEditingTheme(true);
  const handleCancelTheme = () => setIsEditingTheme(false);
  const handleSaveTheme = () => {
    setIsEditingTheme(false);
    toast.success('Theme updated successfully!');
  };

  const handleInputChange = (field: keyof StoreDetails, value: string) => {
    setStorefrontData((prev) => ({ ...prev, [field]: value }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const handleVisitStorefront = () => {
    if (storefrontUrl) {
      let fullUrl = storefrontUrl;
      if (!storefrontUrl.startsWith('http')) {
        fullUrl = `https://${storefrontUrl}`;
      }
      fullUrl = fullUrl.replace(/%3A/g, ':').replace(/%2F/g, '/');
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } else {
      const fallbackUrl = storefrontData.customUrl.startsWith('http')
        ? storefrontData.customUrl
        : `https://${storefrontData.customUrl}`;
      window.open(fallbackUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const copyStorefrontUrl = () => {
    let urlToCopy = storefrontUrl || storefrontData.customUrl;
    urlToCopy = urlToCopy.replace(/%3A/g, ':').replace(/%2F/g, '/');
    copyToClipboard(urlToCopy);
  };

  const handleAddBank = (bankData: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  }) => {
    const getBankIcon = (bankName: string) => {
      if (bankName === 'Access Bank') {
        return <Accessbank />;
      }
      const colors: { [key: string]: string } = {
        'GTBank': 'bg-orange-500',
        'Zenith Bank': 'bg-red-600',
        'UBA': 'bg-red-700',
        'First Bank': 'bg-blue-800',
        'Fidelity Bank': 'bg-purple-600',
        'Sterling Bank': 'bg-blue-700',
        'Union Bank': 'bg-blue-600',
        'Wema Bank': 'bg-purple-700',
        'Unity Bank': 'bg-green-600',
        'Polaris Bank': 'bg-indigo-600',
        'Stanbic IBTC': 'bg-blue-500',
        'Ecobank': 'bg-red-500',
        'FCMB': 'bg-yellow-600',
        'Keystone Bank': 'bg-teal-600',
      };

      const abbreviation = bankName.split(' ').map(word => word[0]).join('').slice(0, 3).toUpperCase();
      const color = colors[bankName] || 'bg-gray-500';

      return (
        <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>
          {abbreviation}
        </div>
      );
    };

    const newBank: BankAccount = {
      id: `bank-${bankAccounts.length + 1}`,
      icon: getBankIcon(bankData.bankName),
      accountNumber: bankData.accountNumber,
      bankName: bankData.bankName,
      accountHolder: bankData.accountHolder
    };

    setBankAccounts([...bankAccounts, newBank]);
  };

  // Skeleton Loading State
  if (isLoading) {
    return (
      <div className="w-full space-y-6">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Skeleton className="w-20 h-20 rounded-lg" />
            <div className="flex flex-col gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-40" />
          </div>
        </div>

        {/* Main Card Skeleton */}
        <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
          <CardContent>
            <div className="space-y-6 pt-6">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-9 w-20" />
              </div>
              <Skeleton className="w-20 h-20 rounded-lg" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-11 w-full" />
                </div>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-11 w-full" />
                </div>
              </div>
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Additional Cards Skeleton */}
        <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
          <CardContent className="pt-6">
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Avatar className="w-20 h-20 rounded-lg">
            <AvatarImage 
              src={storefrontData.logo || "/placeholder-store.jpg"} 
              alt="Store Logo" 
            />
            <AvatarFallback>
              {storefrontData.storeName ? storefrontData.storeName.substring(0, 2).toUpperCase() : 'ST'}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-medium">{storefrontData.storeName || "Store Name"}</h3>
            <span className="text-xs">{storefrontData.storeType || "Store Type"}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant={"outline"}><QrIcon /> <span className="hidden sm:inline">View QR Banner</span> </Button>
          <Button variant={"outline"} onClick={handleVisitStorefront}> <span className="hidden sm:inline">Visit Storefront</span>  <LinkIcon /></Button>
        </div>
      </div>
      
      {/* Storefront Setup Card */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-6 pt-6">
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

            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 rounded-lg">
                  <AvatarImage 
                    src={storefrontData.logo || "/placeholder-store.jpg"} 
                    alt="Store Logo" 
                  />
                  <AvatarFallback>
                    {storefrontData.storeName ? storefrontData.storeName.substring(0, 2).toUpperCase() : 'ST'}
                  </AvatarFallback>
                </Avatar>
                {isEditingStorefront && (
                  <>
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleLogoUpload}
                      accept="image/*"
                      className="hidden"
                    />
                    <button 
                      className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                    >
                      {isUploadingLogo ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Camera className="w-3 h-3" />
                      )}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-xs">Store Name *</Label>
                <Input
                  id="storeName"
                  value={storefrontData.storeName}
                  onChange={(e) => handleInputChange("storeName", e.target.value)}
                  disabled={!isEditingStorefront}
                  className="dark:bg-background"
                  placeholder="Enter store name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-xs">WhatsApp Business Number *</Label>
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
                      <SelectItem value="+234">+234 (NG)</SelectItem>
                      <SelectItem value="+254">+254 (KE)</SelectItem>
                      <SelectItem value="+1">+1 (US)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    id="whatsapp"
                    value={storefrontData.whatsappNumber}
                    onChange={(e) => handleInputChange("whatsappNumber", e.target.value)}
                    disabled={!isEditingStorefront}
                    className="flex-1 dark:bg-background"
                    placeholder="Enter WhatsApp number"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="storeType" className="text-xs">Store Type *</Label>
                <Select
                  value={storefrontData.storeType}
                  onValueChange={(value) => handleInputChange("storeType", value)}
                  disabled={!isEditingStorefront}
                >
                  <SelectTrigger className="w-full dark:bg-background">
                    <SelectValue placeholder="Select store type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Food & Restaurant">Food & Restaurant</SelectItem>
                    <SelectItem value="Bakery">Bakery</SelectItem>
                    <SelectItem value="Cafe">Cafe</SelectItem>
                    <SelectItem value="Fashion">Fashion</SelectItem>
                    <SelectItem value="Electronics">Electronics</SelectItem>
                    <SelectItem value="Beauty & Cosmetics">Beauty & Cosmetics</SelectItem>
                    <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-xs">Location *</Label>
                <Select
                  value={storefrontData.location}
                  onValueChange={(value) => handleInputChange("location", value)}
                  disabled={!isEditingStorefront}
                >
                  <SelectTrigger className="w-full dark:bg-background">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Lagos">Lagos</SelectItem>
                    <SelectItem value="Abuja">Abuja</SelectItem>
                    <SelectItem value="Port Harcourt">Port Harcourt</SelectItem>
                    <SelectItem value="Ibadan">Ibadan</SelectItem>
                    <SelectItem value="Kano">Kano</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className="text-xs">Bio *</Label>
              <Textarea
                id="bio"
                value={storefrontData.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditingStorefront}
                className="min-h-[100px] dark:bg-background resize-none"
                maxLength={500}
                placeholder="Tell customers about your store..."
              />
              <div className="text-right text-xs text-muted-foreground">
                {storefrontData.bio.length}/500
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customUrl" className="text-xs">Custom Storefront URL *</Label>
              <div className="flex gap-2 ">
                <div className="flex items-center gap-2 flex-1 px-2 py-1.5 border rounded-md dark:bg-background">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{storefrontUrl || storefrontData.customUrl}</span>
                </div>
                <Button variant="outline" size="sm" onClick={copyStorefrontUrl} className="dark:bg-background">
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
              <Switch checked={availabilityEnabled} onCheckedChange={setAvailabilityEnabled} />
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
              <Button variant="outline" size="sm" onClick={() => setIsAddBankModalOpen(true)}>
                <span className="hidden sm:inline">Add Bank Account</span>  <PlusIcon />
              </Button>
            </div>

            <div className="space-y-3">
              {bankAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-4 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
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
                <Button onClick={handleEditTheme} variant="outline" size="sm" className="dark:bg-background">
                  <span className="hidden sm:inline mr-2">Edit</span>
                  <EditIcon />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelTheme} variant="outline" size="sm">Cancel</Button>
                  <Button onClick={handleSaveTheme} variant="default" size="sm">
                    <SaveIcon />
                    <span className="hidden sm:inline ml-2">Save Changes</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg">
              <div className="flex items-center gap-3">
                <ThemeIcon />
                <span className="text-sm">Theme</span>
              </div>
              <Select value={themeColor} onValueChange={setThemeColor} disabled={!isEditingTheme}>
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
              <Button variant="destructive" size="sm" onClick={() => setShowDeleteSection(!showDeleteSection)}>
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
      
      <AddBankModal
        isOpen={isAddBankModalOpen}
        onClose={() => setIsAddBankModalOpen(false)}
        onAddBank={handleAddBank}
      />
    </div>
  );
}

export default StorefrontComponent;