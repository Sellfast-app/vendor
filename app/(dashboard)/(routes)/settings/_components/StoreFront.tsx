"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Trash2, Copy, ExternalLink, PlusIcon, Loader2, ImageIcon } from "lucide-react";
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

interface BrandColor {
  primary: string;
  secondary: string;
  accent: string;
}

interface StoreMetadata {
  owner_name?: string;
  address?: string;
  address_line_2?: string;
  city?: string;
  state?: string;
  post_code?: string;
  phone?: string;
  latitude?: number;
  longitude?: number;
  country?: string;
  brand_color?: BrandColor;
}

interface StoreDetails {
  storeName: string;
  storeType: string;
  whatsappNumber: string;
  countryCode: string;
  location: string;
  bio: string;
  customUrl: string;
  botUrl: string;
  logo?: string | null;
  banner?: string | null;
  metadata?: StoreMetadata;
  enabled_fulfillment_modes?: string[];
}

function StorefrontComponent() {
  const [isEditingStorefront, setIsEditingStorefront] = useState(false);
  const [isEditingTheme, setIsEditingTheme] = useState(false);
  const [isEditingDeliveryMethod, setIsEditingDeliveryMethod] = useState(false);
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [storefrontUrl, setStorefrontUrl] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [isSavingTheme, setIsSavingTheme] = useState(false);
  const [isSavingDeliveryMethod, setIsSavingDeliveryMethod] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [storefrontData, setStorefrontData] = useState<StoreDetails>({
    storeName: "",
    storeType: "",
    whatsappNumber: "",
    countryCode: "+234",
    location: "Lagos",
    bio: "",
    customUrl: "www.swiftree.com/cassandrakitchen",
    botUrl: "",
    logo: null,
    banner: null,
  });

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [themeColor, setThemeColor] = useState("Surge Green");
  const [availabilityEnabled, setAvailabilityEnabled] = useState(true);
  const [deliveryMethods, setDeliveryMethods] = useState({
    pickup: false,
    platform: false,
    vendor: false
  });

  // Function to get theme colors based on theme name
  const getThemeColors = (themeName: string): BrandColor => {
    const themeMap: Record<string, BrandColor> = {
      'Surge Green': { primary: '#4FCA6A', secondary: '#45B862', accent: '#D1FFDB' },
      'Ocean Blue': { primary: '#3B82F6', secondary: '#2563EB', accent: '#E7F2FF' },
      'Sunset Orange': { primary: '#F97316', secondary: '#EA580C', accent: '#FFEDD5' },
      'Purple Elegance': { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#EDE8FF' }
    };
    
    return themeMap[themeName] || themeMap['Surge Green'];
  };

  // Function to determine theme name based on brand colors
  const getThemeFromBrandColor = (brandColor?: BrandColor): string => {
    if (!brandColor) return "Surge Green";
    
    const { primary } = brandColor;
    if (primary === '#3B82F6') return "Ocean Blue";
    if (primary === '#F97316') return "Sunset Orange";
    if (primary === '#8B5CF6') return "Purple Elegance";
    return "Surge Green";
  };

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
          const brandColor = metadata.brand_color || {};

          console.log('🎯 Extracted store details:', {
            name: storeDetails.store_name,
            type: storeDetails.business_type,
            bio: storeDetails.store_description,
            phone: metadata.phone,
            city: metadata.city,
            logo: storeDetails.logo,
            banner: storeDetails.banner,
            brand_color: brandColor
          });

          // Determine theme based on brand_color
          const currentTheme = getThemeFromBrandColor(brandColor);
          setThemeColor(currentTheme);
          
          // Also check localStorage for theme and use it if database doesn't have one
          if (!brandColor.primary && typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('colorScheme');
            if (storedTheme) {
              const themeDisplayMap: Record<string, string> = {
                'surge-green': 'Surge Green',
                'ocean-blue': 'Ocean Blue',
                'sunset-orange': 'Sunset Orange',
                'purple-elegance': 'Purple Elegance'
              };
              
              const displayTheme = themeDisplayMap[storedTheme] || 'Surge Green';
              setThemeColor(displayTheme);
              console.log('🎨 Using theme from localStorage:', storedTheme);
            }
          }

          // Determine country code based on phone number
          let countryCode = "+234";
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

          // Parse enabled_fulfillment_modes
          const enabledModes = storeDetails.enabled_fulfillment_modes || [];
          setDeliveryMethods({
            pickup: enabledModes.includes('pickup'),
            platform: enabledModes.includes('platform'),
            vendor: enabledModes.includes('vendor')
          });
          
          console.log('✅ Loaded delivery methods:', {
            pickup: enabledModes.includes('pickup'),
            platform: enabledModes.includes('platform'),
            vendor: enabledModes.includes('vendor')
          });

          setStorefrontData(prev => ({
            ...prev,
            storeName: storeDetails.store_name || "",
            storeType: storeDetails.business_type || "",
            bio: storeDetails.store_description || "",
            whatsappNumber: formattedPhone,
            countryCode: countryCode,
            location: metadata.city || "Lagos",
            logo: storeDetails.logo || null,
            banner: storeDetails.banner || null,
            botUrl: storeDetails.bot_url || "",
            metadata: metadata,
            enabled_fulfillment_modes: enabledModes
          }));

          console.log('✅ Store data loaded successfully into state');
          toast.success('Store data loaded successfully');
        } else {
          console.warn('⚠️ No store details found in response');
          toast.warning('No store data found');
        }
      } catch (error) {
        console.error('❌ Error fetching store data:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load store data');

        setStorefrontData(prev => ({
          ...prev,
          storeName: "Pizza Cafe",
          storeType: "Food & Restaurant",
          bio: "Welcome to Pizza Cafe...",
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

  useEffect(() => {
    console.log('🔄 storefrontData updated:', storefrontData);
  }, [storefrontData]);

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

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

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

      if (result.data?.logo) {
        setStorefrontData(prev => ({
          ...prev,
          logo: result.data.logo
        }));
        toast.success('Logo uploaded successfully!');
      } else {
        toast.success('Logo updated successfully!');
      }

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

  const handleBannerUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a JPEG, PNG, or WebP image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Banner size must be less than 10MB');
      return;
    }

    setIsUploadingBanner(true);

    try {
      const formData = new FormData();
      formData.append('banner', file);

      const response = await fetch('/api/store/banner', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to upload banner');
      }

      if (result.data?.banner) {
        setStorefrontData(prev => ({
          ...prev,
          banner: result.data.banner
        }));
        toast.success('Banner uploaded successfully!');
      } else if (result.data?.store?.banner) {
        setStorefrontData(prev => ({
          ...prev,
          banner: result.data.store.banner
        }));
        toast.success('Banner uploaded successfully!');
      } else {
        toast.success('Banner updated successfully!');
      }

      if (bannerInputRef.current) {
        bannerInputRef.current.value = '';
      }

    } catch (error) {
      console.error('❌ Banner upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload banner');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleEditStorefront = () => setIsEditingStorefront(true);
  const handleCancelStorefront = () => setIsEditingStorefront(false);
  const handleSaveStorefront = () => {
    setIsEditingStorefront(false);
    toast.success('Changes saved successfully!');
  };

  const handleEditTheme = () => setIsEditingTheme(true);
  const handleCancelTheme = () => setIsEditingTheme(false);

  const handleSaveTheme = async () => {
    if (isSavingTheme) return;
    
    setIsSavingTheme(true);
  
    try {
      const brandColor = getThemeColors(themeColor);
      
      const requestBody = {
        metadata: {
          owner_name: storefrontData.metadata?.owner_name || "Store Owner",
          address: storefrontData.metadata?.address || "",
          address_line_2: storefrontData.metadata?.address_line_2 || "",
          city: storefrontData.metadata?.city || storefrontData.location || "Lagos",
          state: storefrontData.metadata?.state || "Lagos",
          post_code: storefrontData.metadata?.post_code || "",
          phone: storefrontData.metadata?.phone || `+234${storefrontData.whatsappNumber.replace(/^0/, '')}`,
          latitude: storefrontData.metadata?.latitude || 0,
          longitude: storefrontData.metadata?.longitude || 0,
          country: storefrontData.metadata?.country || "NG",
          brand_color: brandColor
        }
      };
  
      console.log('🔄 Sending theme update request:', requestBody);
  
      toast.loading('Updating theme...');
      
      const response = await fetch('/api/store', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
  
      const result = await response.json();
  
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update theme');
      }
  
      const themeMap: Record<string, string> = {
        'Surge Green': 'surge-green',
        'Ocean Blue': 'ocean-blue',
        'Sunset Orange': 'sunset-orange',
        'Purple Elegance': 'purple-elegance'
      };
      
      const themeValue = themeMap[themeColor] || 'surge-green';
      localStorage.setItem('colorScheme', themeValue);
      
      console.log('💾 Saved theme to localStorage:', themeValue);
  
      setIsEditingTheme(false);
      toast.dismiss();
      toast.success('Theme updated successfully!');
      
      setStorefrontData(prev => ({
        ...prev,
        metadata: {
          ...prev.metadata,
          brand_color: brandColor
        }
      }));
  
      window.dispatchEvent(new Event('themeChange'));
  
    } catch (error) {
      console.error('❌ Error updating theme:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Failed to update theme');
    } finally {
      setIsSavingTheme(false);
    }
  };

  // Delivery Method Handlers
  const handleEditDeliveryMethod = () => setIsEditingDeliveryMethod(true);
  
  const handleCancelDeliveryMethod = () => {
    setIsEditingDeliveryMethod(false);
    // Reset to original values
    const enabledModes = storefrontData.enabled_fulfillment_modes || [];
    setDeliveryMethods({
      pickup: enabledModes.includes('pickup'),
      platform: enabledModes.includes('platform'),
      vendor: enabledModes.includes('vendor')
    });
  };
  
  const handleDeliveryMethodChange = (method: 'pickup' | 'platform' | 'vendor') => {
    setDeliveryMethods(prev => {
      const newState = { ...prev };
      
      if (method === 'platform' && !prev.platform) {
        newState.platform = true;
        newState.vendor = false;
      } else if (method === 'vendor' && !prev.vendor) {
        newState.vendor = true;
        newState.platform = false;
      } else {
        newState[method] = !prev[method];
      }
      
      return newState;
    });
  };
  
  const handleSaveDeliveryMethod = async () => {
    if (isSavingDeliveryMethod) return;
    
    if (!deliveryMethods.pickup && !deliveryMethods.platform && !deliveryMethods.vendor) {
      toast.error('Please select at least one delivery method');
      return;
    }
    
    setIsSavingDeliveryMethod(true);
    
    try {
      const enabledModes: string[] = [];
      if (deliveryMethods.pickup) enabledModes.push('pickup');
      if (deliveryMethods.platform) enabledModes.push('platform');
      if (deliveryMethods.vendor) enabledModes.push('vendor');
      
      const requestBody = {
        enabled_fulfillment_modes: enabledModes
      };
      
      console.log('🔄 Sending delivery method update:', requestBody);
      
      toast.loading('Updating delivery methods...');
      
      const response = await fetch('/api/store', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to update delivery methods');
      }
      
      setIsEditingDeliveryMethod(false);
      toast.dismiss();
      toast.success('Delivery methods updated successfully!');
      
      setStorefrontData(prev => ({
        ...prev,
        enabled_fulfillment_modes: enabledModes
      }));
      
      console.log('✅ Delivery methods updated:', enabledModes);
      
    } catch (error) {
      console.error('❌ Error updating delivery methods:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Failed to update delivery methods');
    } finally {
      setIsSavingDeliveryMethod(false);
    }
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

  if (isLoading) {
    return (
      <div className="w-full space-y-6">
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
              </div>
            </div>
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
              className="object-cover"
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
                    className="object-cover"
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
              <Label htmlFor="banner" className="text-xs">Store Banner</Label>
              <input
                type="file"
                ref={bannerInputRef}
                onChange={handleBannerUpload}
                accept="image/jpeg,image/jpg,image/png,image/webp"
                className="hidden"
              />
              <div
                className="border-1 border-dashed border-primary rounded-2xl p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors"
                onClick={() => isEditingStorefront && bannerInputRef.current?.click()}
              >
                {isUploadingBanner ? (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <p className="text-sm font-medium">Uploading banner...</p>
                  </div>
                ) : storefrontData.banner ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-12 bg-cover bg-center rounded-md border"
                      style={{ backgroundImage: `url(${storefrontData.banner})` }} />
                    <p className="text-sm font-medium">Banner uploaded</p>
                    <p className="text-xs text-muted-foreground">Click to change banner</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 text-primary" />
                    <p className="text-sm font-medium">
                      {isEditingStorefront ? 'Upload store banner' : 'No banner uploaded'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {isEditingStorefront ? 'Max 10MB, JPEG, PNG, WebP' : 'Edit to upload banner'}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customUrl" className="text-xs">Custom Storefront URL *</Label>
              <div className="flex flex-col md:flex-row gap-2 ">
                <div className="flex items-center gap-2 flex-1 px-2 py-1.5 border rounded-md dark:bg-background overflow-auto">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{storefrontUrl || storefrontData.customUrl}</span>
                </div>
                <Button variant="outline" size="sm" onClick={copyStorefrontUrl} className="dark:bg-background">
                  <span className="hidden sm:inline">Copy Link </span>  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="botUrl" className="text-xs">Custom WhatsApp Bot URL *</Label>
              <div className="flex flex-col md:flex-row gap-2 ">
                <div className="flex items-center gap-2 flex-1 px-2 py-1.5 border rounded-md dark:bg-background overflow-auto">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{storefrontData.botUrl || "No bot URL available"}</span>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => copyToClipboard(storefrontData.botUrl)} 
                  className="dark:bg-background"
                  disabled={!storefrontData.botUrl}
                >
                  <span className="hidden sm:inline">Copy Link </span>  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Delivery Method Card - NEW */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium">Delivery Method</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  Choose how customers can receive their orders
                </p>
              </div>
              {!isEditingDeliveryMethod ? (
                <Button
                  onClick={handleEditDeliveryMethod}
                  variant="outline"
                  size="sm"
                  className="dark:bg-background"
                >
                  <span className="hidden sm:inline mr-2">Edit</span>
                  <EditIcon />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelDeliveryMethod} variant="outline" size="sm">
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveDeliveryMethod} 
                    variant="default" 
                    size="sm"
                    disabled={isSavingDeliveryMethod}
                  >
                    {isSavingDeliveryMethod ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <SaveIcon />
                        <span className="hidden sm:inline ml-2">Save Changes</span>
                      </>
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Pickup Checkbox */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  id="pickup"
                  checked={deliveryMethods.pickup}
                  onChange={() => handleDeliveryMethodChange('pickup')}
                  disabled={!isEditingDeliveryMethod}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed"
                />
                <div className="flex-1">
                  <label 
                    htmlFor="pickup" 
                    className={`text-sm font-medium ${!isEditingDeliveryMethod ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    Pickup
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Customers can pick up orders from your store location
                  </p>
                </div>
              </div>

              {/* Platform Delivery Checkbox */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  id="platform"
                  checked={deliveryMethods.platform}
                  onChange={() => handleDeliveryMethodChange('platform')}
                  disabled={!isEditingDeliveryMethod || deliveryMethods.vendor}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="flex-1">
                  <label 
                    htmlFor="platform" 
                    className={`text-sm font-medium ${!isEditingDeliveryMethod || deliveryMethods.vendor ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}`}
                  >
                    Platform Delivery
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Orders are delivered through Swiftree&apos;s delivery service
                  </p>
                  {deliveryMethods.vendor && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      ⚠️ Cannot be selected with Vendor Delivery
                    </p>
                  )}
                </div>
              </div>

              {/* Vendor Delivery Checkbox */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <input
                  type="checkbox"
                  id="vendor"
                  checked={deliveryMethods.vendor}
                  onChange={() => handleDeliveryMethodChange('vendor')}
                  disabled={!isEditingDeliveryMethod || deliveryMethods.platform}
                  className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div className="flex-1">
                  <label 
                    htmlFor="vendor" 
                    className={`text-sm font-medium ${!isEditingDeliveryMethod || deliveryMethods.platform ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}`}
                  >
                    Vendor Delivery
                  </label>
                  <p className="text-xs text-muted-foreground mt-1">
                    You handle delivery logistics yourself
                  </p>
                  {deliveryMethods.platform && (
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">
                      ⚠️ Cannot be selected with Platform Delivery
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Info box showing current selection */}
            {(deliveryMethods.pickup || deliveryMethods.platform || deliveryMethods.vendor) && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Currently enabled:</strong>{' '}
                  {[
                    deliveryMethods.pickup && 'Pickup',
                    deliveryMethods.platform && 'Platform Delivery',
                    deliveryMethods.vendor && 'Vendor Delivery'
                  ].filter(Boolean).join(', ')}
                </p>
              </div>
            )}
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
                  <Button 
                    onClick={handleSaveTheme} 
                    variant="default" 
                    size="sm"
                    disabled={isSavingTheme}
                  >
                    {isSavingTheme ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <SaveIcon />
                        <span className="hidden sm:inline ml-2">Save Changes</span>
                      </>
                    )}
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
                  <SelectItem value="Purple Elegance">Purple Elegance</SelectItem>
                </SelectContent>
              </Select>
            </div>
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