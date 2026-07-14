"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Copy, ExternalLink, PlusIcon, Loader2, ImageIcon } from "lucide-react";
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

type Meridiem = "AM" | "PM";

interface StoreAvailabilityEntry {
  day: string;
  openTime: string;
  closeTime: string;
}

interface AvailabilityDay {
  day: string;
  enabled: boolean;
  openingHour: string;
  openingMinute: string;
  openingPeriod: Meridiem;
  closingHour: string;
  closingMinute: string;
  closingPeriod: Meridiem;
}

const defaultAvailability: AvailabilityDay[] = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
].map((day) => ({
  day,
  enabled: false,
  openingHour: "00",
  openingMinute: "00",
  openingPeriod: "AM",
  closingHour: "00",
  closingMinute: "00",
  closingPeriod: "AM",
}));

const hours = Array.from({ length: 13 }, (_, index) =>
  String(index).padStart(2, "0")
);

const minutes = Array.from({ length: 60 }, (_, index) =>
  String(index).padStart(2, "0")
);

const fromTwentyFourHourTime = (time: string) => {
  const [hourValue = "00", minuteValue = "00"] = time.split(":");
  const numericHour = Number(hourValue);
  const period: Meridiem = numericHour >= 12 ? "PM" : "AM";
  const hour =
    numericHour === 0
      ? "00"
      : String(numericHour > 12 ? numericHour - 12 : numericHour).padStart(
          2,
          "0"
        );

  return {
    hour,
    minute: minuteValue.padStart(2, "0"),
    period,
  };
};

const mapStoreAvailability = (
  entries: StoreAvailabilityEntry[]
): AvailabilityDay[] => {
  const entriesByDay = new Map(entries.map((entry) => [entry.day, entry]));

  return defaultAvailability.map((defaultDay) => {
    const entry = entriesByDay.get(defaultDay.day);
    if (!entry) return { ...defaultDay };

    const opening = fromTwentyFourHourTime(entry.openTime);
    const closing = fromTwentyFourHourTime(entry.closeTime);

    return {
      ...defaultDay,
      enabled: true,
      openingHour: opening.hour,
      openingMinute: opening.minute,
      openingPeriod: opening.period,
      closingHour: closing.hour,
      closingMinute: closing.minute,
      closingPeriod: closing.period,
    };
  });
};

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
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [isFoodVendor, setIsFoodVendor] = useState(false); // ← NEW
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
  const [availability, setAvailability] =
    useState<AvailabilityDay[]>(defaultAvailability);

  // ── Delivery methods state — now includes relay ───────────────────────────
  const [deliveryMethods, setDeliveryMethods] = useState({
    pickup: false,
    sendbox: false,
    vendor: false,
    gig: false,
    relay: false, // ← NEW
  });

  const getThemeColors = (themeName: string): BrandColor => {
    const themeMap: Record<string, BrandColor> = {
      'Surge Green': { primary: '#4FCA6A', secondary: '#45B862', accent: '#D1FFDB' },
      'Ocean Blue': { primary: '#3B82F6', secondary: '#2563EB', accent: '#E7F2FF' },
      'Sunset Orange': { primary: '#F97316', secondary: '#EA580C', accent: '#FFEDD5' },
      'Purple Elegance': { primary: '#8B5CF6', secondary: '#7C3AED', accent: '#EDE8FF' }
    };
    return themeMap[themeName] || themeMap['Surge Green'];
  };

  const updateAvailabilityDay = (
    index: number,
    field: keyof Omit<AvailabilityDay, "day">,
    value: string | boolean
  ) => {
    setAvailability((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const resetAvailability = () => {
    setAvailability(defaultAvailability.map((item) => ({ ...item })));
  };

  const toTwentyFourHourTime = (
    hour: string,
    minute: string,
    period: Meridiem
  ) => {
    const numericHour = Number(hour);
    const convertedHour =
      period === "AM"
        ? numericHour % 12
        : numericHour === 12
          ? 12
          : numericHour + 12;

    return `${String(convertedHour).padStart(2, "0")}:${minute}`;
  };

  const saveAvailability = async () => {
    if (isSavingAvailability) return;

    const availableDateTimes = availability
      .filter((item) => item.enabled)
      .map((item) => ({
        day: item.day,
        openTime: toTwentyFourHourTime(
          item.openingHour,
          item.openingMinute,
          item.openingPeriod
        ),
        closeTime: toTwentyFourHourTime(
          item.closingHour,
          item.closingMinute,
          item.closingPeriod
        ),
      }));

    if (availableDateTimes.length === 0) {
      toast.error("Enable at least one day before saving availability");
      return;
    }

    setIsSavingAvailability(true);
    try {
      const response = await fetch("/api/store/availability", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availableDateTimes }),
      });
      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Failed to save availability"
        );
      }

      toast.success(
        result.message || "Availability saved successfully"
      );
    } catch (error) {
      console.error("Error saving availability:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Failed to save availability"
      );
    } finally {
      setIsSavingAvailability(false);
    }
  };

  const getThemeFromBrandColor = (brandColor?: BrandColor): string => {
    if (!brandColor) return "Surge Green";
    const { primary } = brandColor;
    if (primary === '#3B82F6') return "Ocean Blue";
    if (primary === '#F97316') return "Sunset Orange";
    if (primary === '#8B5CF6') return "Purple Elegance";
    return "Surge Green";
  };

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

          // ── Detect food vendor ──────────────────────────────────────────
          const businessType: string = storeDetails.business_type || '';
          const isFood = businessType === 'Restaurant/Food Service';
          setIsFoodVendor(isFood);
          console.log('🍔 Is food vendor:', isFood);

          const currentTheme = getThemeFromBrandColor(brandColor);
          setThemeColor(currentTheme);

          if (!brandColor.primary && typeof window !== 'undefined') {
            const storedTheme = localStorage.getItem('colorScheme');
            if (storedTheme) {
              const themeDisplayMap: Record<string, string> = {
                'surge-green': 'Surge Green',
                'ocean-blue': 'Ocean Blue',
                'sunset-orange': 'Sunset Orange',
                'purple-elegance': 'Purple Elegance'
              };
              setThemeColor(themeDisplayMap[storedTheme] || 'Surge Green');
            }
          }

          let countryCode = "+234";
          if (metadata.phone) {
            if (metadata.phone.startsWith('+1')) countryCode = "+1";
            else if (metadata.phone.startsWith('+254')) countryCode = "+254";
            else if (metadata.phone.startsWith('0') || metadata.phone.startsWith('+234')) countryCode = "+234";
          }

          let formattedPhone = metadata.phone || "";
          if (formattedPhone.startsWith('+234')) formattedPhone = formattedPhone.replace('+234', '0');
          else if (formattedPhone.startsWith('234')) formattedPhone = '0' + formattedPhone.slice(3);
          else if (formattedPhone.startsWith('+1')) formattedPhone = formattedPhone.slice(2);
          else if (formattedPhone.startsWith('+254')) formattedPhone = formattedPhone.slice(4);

          const enabledModes = storeDetails.enabled_fulfillment_modes || [];
          const storeAvailability = Array.isArray(storeDetails.availability)
            ? storeDetails.availability.filter(
                (entry: unknown): entry is StoreAvailabilityEntry => {
                  if (!entry || typeof entry !== "object") return false;
                  const value = entry as Partial<StoreAvailabilityEntry>;
                  return (
                    typeof value.day === "string" &&
                    typeof value.openTime === "string" &&
                    typeof value.closeTime === "string"
                  );
                }
              )
            : [];

          setAvailability(mapStoreAvailability(storeAvailability));

          // ── Set delivery methods including relay ────────────────────────
          setDeliveryMethods({
            pickup: enabledModes.includes('pickup'),
            sendbox: enabledModes.includes('sendbox'),
            vendor: enabledModes.includes('vendor'),
            gig: enabledModes.includes('gig'),
            relay: enabledModes.includes('relay'), // ← NEW
          });

          console.log('✅ Loaded delivery methods:', enabledModes);

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

          console.log('✅ Store data loaded successfully');
          toast.success('Store data loaded successfully');
        } else {
          console.warn('⚠️ No store details found in response');
          toast.warning('No store data found');
        }
      } catch (error) {
        console.error('❌ Error fetching store data:', error);
        toast.error(error instanceof Error ? error.message : 'Failed to load store data');
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
        setStorefrontUrl(decodeURIComponent(urlFromCookie));
      } catch {
        setStorefrontUrl(urlFromCookie);
      }
    }
  }, []);

  const handleLogoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) { toast.error('Please select an image file'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('Image size must be less than 5MB'); return; }

    setIsUploadingLogo(true);
    try {
      const formData = new FormData();
      formData.append('logo', file);
      const response = await fetch('/api/store', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to upload logo');
      if (result.data?.logo) setStorefrontData(prev => ({ ...prev, logo: result.data.logo }));
      toast.success('Logo uploaded successfully!');
      if (fileInputRef.current) fileInputRef.current.value = '';
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
    if (!allowedTypes.includes(file.type)) { toast.error('Please select a JPEG, PNG, or WebP image file'); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error('Banner size must be less than 10MB'); return; }

    setIsUploadingBanner(true);
    try {
      const formData = new FormData();
      formData.append('banner', file);
      const response = await fetch('/api/store/banner', { method: 'POST', body: formData });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to upload banner');
      const newBanner = result.data?.banner || result.data?.store?.banner;
      if (newBanner) setStorefrontData(prev => ({ ...prev, banner: newBanner }));
      toast.success('Banner uploaded successfully!');
      if (bannerInputRef.current) bannerInputRef.current.value = '';
    } catch (error) {
      console.error('❌ Banner upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to upload banner');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleEditStorefront = () => setIsEditingStorefront(true);
  const handleCancelStorefront = () => setIsEditingStorefront(false);

  const handleSaveStorefront = async () => {
    try {
      toast.loading('Saving changes...');
      const rawPhone = storefrontData.whatsappNumber.replace(/\s/g, '');
      const formattedPhone = rawPhone.startsWith('0')
        ? `${storefrontData.countryCode}${rawPhone.slice(1)}`
        : `${storefrontData.countryCode}${rawPhone}`;

      const requestBody = {
        store_name: storefrontData.storeName,
        business_type: storefrontData.storeType,
        store_description: storefrontData.bio,
        metadata: {
          owner_name: storefrontData.metadata?.owner_name || "",
          address: storefrontData.metadata?.address || "",
          address_line_2: storefrontData.metadata?.address_line_2 || "",
          city: storefrontData.location,
          state: storefrontData.metadata?.state || storefrontData.location,
          post_code: storefrontData.metadata?.post_code || "",
          phone: formattedPhone,
          latitude: storefrontData.metadata?.latitude || 0,
          longitude: storefrontData.metadata?.longitude || 0,
          country: storefrontData.metadata?.country || "NG",
          brand_color: storefrontData.metadata?.brand_color || getThemeColors(themeColor),
        },
      };

      const response = await fetch('/api/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to save changes');
      setIsEditingStorefront(false);
      toast.dismiss();
      toast.success('Changes saved successfully!');
    } catch (error) {
      console.error('❌ Error saving storefront:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Failed to save changes');
    }
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
      toast.loading('Updating theme...');
      const response = await fetch('/api/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update theme');

      const themeMap: Record<string, string> = {
        'Surge Green': 'surge-green', 'Ocean Blue': 'ocean-blue',
        'Sunset Orange': 'sunset-orange', 'Purple Elegance': 'purple-elegance'
      };
      localStorage.setItem('colorScheme', themeMap[themeColor] || 'surge-green');
      setIsEditingTheme(false);
      toast.dismiss();
      toast.success('Theme updated successfully!');
      setStorefrontData(prev => ({ ...prev, metadata: { ...prev.metadata, brand_color: brandColor } }));
      window.dispatchEvent(new Event('themeChange'));
    } catch (error) {
      console.error('❌ Error updating theme:', error);
      toast.dismiss();
      toast.error(error instanceof Error ? error.message : 'Failed to update theme');
    } finally {
      setIsSavingTheme(false);
    }
  };

  const handleEditDeliveryMethod = () => setIsEditingDeliveryMethod(true);

  const handleCancelDeliveryMethod = () => {
    setIsEditingDeliveryMethod(false);
    const enabledModes = storefrontData.enabled_fulfillment_modes || [];
    setDeliveryMethods({
      pickup: enabledModes.includes('pickup'),
      sendbox: enabledModes.includes('sendbox'),
      vendor: enabledModes.includes('vendor'),
      gig: enabledModes.includes('gig'),
      relay: enabledModes.includes('relay'), // ← NEW
    });
  };

  const handleDeliveryMethodChange = (method: 'pickup' | 'sendbox' | 'vendor' | 'gig' | 'relay') => {
    setDeliveryMethods(prev => {
      const newState = { ...prev };
      if (method === 'sendbox' && !prev.sendbox) {
        newState.sendbox = true;
        newState.vendor = false;
      } else if (method === 'vendor' && !prev.vendor) {
        newState.vendor = true;
        newState.sendbox = false;
      } else {
        newState[method] = !prev[method];
      }
      return newState;
    });
  };

  const handleSaveDeliveryMethod = async () => {
    if (isSavingDeliveryMethod) return;

    // ── Validation differs by business type ────────────────────────────────
    if (isFoodVendor) {
      if (!deliveryMethods.pickup && !deliveryMethods.relay && !deliveryMethods.vendor) {
        toast.error('Please select at least one delivery method');
        return;
      }
    } else {
      if (!deliveryMethods.pickup && !deliveryMethods.sendbox && !deliveryMethods.vendor) {
        toast.error('Please select at least one delivery method');
        return;
      }
    }

    setIsSavingDeliveryMethod(true);
    try {
      const enabledModes: string[] = [];
      if (deliveryMethods.pickup) enabledModes.push('pickup');
      if (deliveryMethods.sendbox) enabledModes.push('sendbox');
      if (deliveryMethods.vendor) enabledModes.push('vendor');
      if (deliveryMethods.gig) enabledModes.push('gig');
      if (deliveryMethods.relay) enabledModes.push('relay'); // ← NEW

      toast.loading('Updating delivery methods...');
      const response = await fetch('/api/store', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled_fulfillment_modes: enabledModes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to update delivery methods');

      setIsEditingDeliveryMethod(false);
      toast.dismiss();
      toast.success('Delivery methods updated successfully!');
      setStorefrontData(prev => ({ ...prev, enabled_fulfillment_modes: enabledModes }));
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
      if (!storefrontUrl.startsWith('http')) fullUrl = `https://${storefrontUrl}`;
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

  const handleAddBank = (bankData: { bankName: string; accountNumber: string; accountHolder: string }) => {
    const getBankIcon = (bankName: string) => {
      if (bankName === 'Access Bank') return <Accessbank />;
      const colors: { [key: string]: string } = {
        'GTBank': 'bg-orange-500', 'Zenith Bank': 'bg-red-600', 'UBA': 'bg-red-700',
        'First Bank': 'bg-blue-800', 'Fidelity Bank': 'bg-purple-600', 'Sterling Bank': 'bg-blue-700',
        'Union Bank': 'bg-blue-600', 'Wema Bank': 'bg-purple-700', 'Unity Bank': 'bg-green-600',
        'Polaris Bank': 'bg-indigo-600', 'Stanbic IBTC': 'bg-blue-500', 'Ecobank': 'bg-red-500',
        'FCMB': 'bg-yellow-600', 'Keystone Bank': 'bg-teal-600',
      };
      const abbreviation = bankName.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase();
      const color = colors[bankName] || 'bg-gray-500';
      return <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center text-white text-xs font-bold`}>{abbreviation}</div>;
    };
    setBankAccounts([...bankAccounts, {
      id: `bank-${bankAccounts.length + 1}`,
      icon: getBankIcon(bankData.bankName),
      accountNumber: bankData.accountNumber,
      bankName: bankData.bankName,
      accountHolder: bankData.accountHolder
    }]);
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
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-11 w-full" /></div>
                <div className="space-y-2"><Skeleton className="h-4 w-24" /><Skeleton className="h-11 w-full" /></div>
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
            <AvatarImage src={storefrontData.logo || "/placeholder-store.jpg"} alt="Store Logo" className="object-cover" />
            <AvatarFallback>{storefrontData.storeName ? storefrontData.storeName.substring(0, 2).toUpperCase() : 'ST'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="font-medium">{storefrontData.storeName || "Store Name"}</h3>
            <span className="text-xs">{storefrontData.storeType || "Store Type"}</span>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          <Button variant={"outline"}><QrIcon /> <span className="hidden sm:inline">View QR Banner</span></Button>
          <Button variant={"outline"} onClick={handleVisitStorefront}><span className="hidden sm:inline">Visit Storefront</span> <LinkIcon /></Button>
        </div>
      </div>

      {/* Storefront Setup Card — unchanged */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium">Storefront Setup</h2>
              {!isEditingStorefront ? (
                <Button onClick={handleEditStorefront} variant="outline" size="sm" className="dark:bg-background">
                  <span className="hidden sm:inline mr-2">Edit</span><EditIcon />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelStorefront} variant="outline" size="sm">Cancel</Button>
                  <Button onClick={handleSaveStorefront} variant="default" size="sm">
                    <SaveIcon /><span className="hidden sm:inline ml-2">Save Changes</span>
                  </Button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-4">
              <div className="relative">
                <Avatar className="w-20 h-20 rounded-lg">
                  <AvatarImage src={storefrontData.logo || "/placeholder-store.jpg"} alt="Store Logo" className="object-cover" />
                  <AvatarFallback>{storefrontData.storeName ? storefrontData.storeName.substring(0, 2).toUpperCase() : 'ST'}</AvatarFallback>
                </Avatar>
                {isEditingStorefront && (
                  <>
                    <input type="file" ref={fileInputRef} onChange={handleLogoUpload} accept="image/*" className="hidden" />
                    <button
                      className="absolute bottom-0 right-0 w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white hover:bg-primary/90 transition-colors"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingLogo}
                    >
                      {isUploadingLogo ? <Loader2 className="w-3 h-3 animate-spin" /> : <Camera className="w-3 h-3" />}
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="storeName" className="text-xs">Store Name *</Label>
                <Input id="storeName" value={storefrontData.storeName} onChange={(e) => handleInputChange("storeName", e.target.value)} disabled={!isEditingStorefront} className="dark:bg-background" placeholder="Enter store name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-xs">WhatsApp Business Number *</Label>
                <div className="flex gap-2">
                  <Select value={storefrontData.countryCode} onValueChange={(value) => handleInputChange("countryCode", value)} disabled={!isEditingStorefront}>
                    <SelectTrigger className="max-w-[120px] dark:bg-background"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="+234">+234 (NG)</SelectItem>
                      <SelectItem value="+254">+254 (KE)</SelectItem>
                      <SelectItem value="+1">+1 (US)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input id="whatsapp" value={storefrontData.whatsappNumber} onChange={(e) => handleInputChange("whatsappNumber", e.target.value)} disabled={!isEditingStorefront} className="flex-1 dark:bg-background" placeholder="Enter WhatsApp number" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="storeType" className="text-xs">Store Type *</Label>
                <Select value={storefrontData.storeType} onValueChange={(value) => handleInputChange("storeType", value)} disabled={!isEditingStorefront}>
                  <SelectTrigger className="w-full dark:bg-background"><SelectValue placeholder="Select store type" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Restaurant/Food Service">Restaurant/Food Service</SelectItem>
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
                <Select value={storefrontData.location} onValueChange={(value) => handleInputChange("location", value)} disabled={!isEditingStorefront}>
                  <SelectTrigger className="w-full dark:bg-background"><SelectValue placeholder="Select location" /></SelectTrigger>
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
              <Textarea id="bio" value={storefrontData.bio} onChange={(e) => handleInputChange("bio", e.target.value)} disabled={!isEditingStorefront} className="min-h-[100px] dark:bg-background resize-none" maxLength={500} placeholder="Tell customers about your store..." />
              <div className="text-right text-xs text-muted-foreground">{storefrontData.bio.length}/500</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="banner" className="text-xs">Store Banner</Label>
              <input type="file" ref={bannerInputRef} onChange={handleBannerUpload} accept="image/jpeg,image/jpg,image/png,image/webp" className="hidden" />
              <div className="border-1 border-dashed border-primary rounded-2xl p-8 text-center cursor-pointer hover:bg-primary/5 transition-colors" onClick={() => isEditingStorefront && bannerInputRef.current?.click()}>
                {isUploadingBanner ? (
                  <div className="flex flex-col items-center gap-2"><Loader2 className="w-8 h-8 animate-spin text-primary" /><p className="text-sm font-medium">Uploading banner...</p></div>
                ) : storefrontData.banner ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="w-20 h-12 bg-cover bg-center rounded-md border" style={{ backgroundImage: `url(${storefrontData.banner})` }} />
                    <p className="text-sm font-medium">Banner uploaded</p>
                    <p className="text-xs text-muted-foreground">Click to change banner</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <ImageIcon className="w-8 h-8 text-primary" />
                    <p className="text-sm font-medium">{isEditingStorefront ? 'Upload store banner' : 'No banner uploaded'}</p>
                    <p className="text-xs text-muted-foreground">{isEditingStorefront ? 'Max 10MB, JPEG, PNG, WebP' : 'Edit to upload banner'}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customUrl" className="text-xs">Custom Storefront URL *</Label>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex items-center gap-2 flex-1 px-2 py-1.5 border rounded-md dark:bg-background overflow-auto">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{storefrontUrl || storefrontData.customUrl}</span>
                </div>
                <Button variant="outline" size="sm" onClick={copyStorefrontUrl} className="dark:bg-background">
                  <span className="hidden sm:inline">Copy Link </span><Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="botUrl" className="text-xs">Custom WhatsApp Bot URL *</Label>
              <div className="flex flex-col md:flex-row gap-2">
                <div className="flex items-center gap-2 flex-1 px-2 py-1.5 border rounded-md dark:bg-background overflow-auto">
                  <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{storefrontData.botUrl || "No bot URL available"}</span>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyToClipboard(storefrontData.botUrl)} className="dark:bg-background" disabled={!storefrontData.botUrl}>
                  <span className="hidden sm:inline">Copy Link </span><Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Delivery Method Card ─────────────────────────────────────────────── */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-6 pt-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-medium">Delivery Method</h2>
                <p className="text-xs text-muted-foreground mt-1">Choose how customers can receive their orders</p>
              </div>
              {!isEditingDeliveryMethod ? (
                <Button onClick={handleEditDeliveryMethod} variant="outline" size="sm" className="dark:bg-background">
                  <span className="hidden sm:inline mr-2">Edit</span><EditIcon />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelDeliveryMethod} variant="outline" size="sm">Cancel</Button>
                  <Button onClick={handleSaveDeliveryMethod} variant="default" size="sm" disabled={isSavingDeliveryMethod}>
                    {isSavingDeliveryMethod ? <Loader2 className="w-4 h-4 animate-spin" /> : <><SaveIcon /><span className="hidden sm:inline ml-2">Save Changes</span></>}
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* ── Pickup — always visible for both types ─────────────────── */}
              <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <input type="checkbox" id="pickup" checked={deliveryMethods.pickup} onChange={() => handleDeliveryMethodChange('pickup')} disabled={!isEditingDeliveryMethod} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed" />
                <div className="flex-1">
                  <label htmlFor="pickup" className={`text-sm font-medium ${!isEditingDeliveryMethod ? 'cursor-default' : 'cursor-pointer'}`}>Pickup</label>
                  <p className="text-xs text-muted-foreground mt-1">Customers can pick up orders from your store location</p>
                </div>
              </div>

              {/* ── Food vendor: show Relay and Vendor Delivery ───────────── */}
              {isFoodVendor && (
                <>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <input type="checkbox" id="relay" checked={deliveryMethods.relay} onChange={() => handleDeliveryMethodChange('relay')} disabled={!isEditingDeliveryMethod} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50" />
                    <div className="flex-1">
                      <label htmlFor="relay" className={`text-sm font-medium ${!isEditingDeliveryMethod ? 'cursor-default' : 'cursor-pointer'}`}>Relay by Chowdeck</label>
                      <p className="text-xs text-muted-foreground mt-1">Food delivery handled by Relay (Chowdeck)</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <input type="checkbox" id="vendor" checked={deliveryMethods.vendor} onChange={() => handleDeliveryMethodChange('vendor')} disabled={!isEditingDeliveryMethod} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50" />
                    <div className="flex-1">
                      <label htmlFor="vendor" className={`text-sm font-medium ${!isEditingDeliveryMethod ? 'cursor-default' : 'cursor-pointer'}`}>Vendor Delivery</label>
                      <p className="text-xs text-muted-foreground mt-1">You handle delivery logistics yourself</p>
                    </div>
                  </div>
                </>
              )}

              {/* ── Non-food vendors: show SendBox, Vendor, GIG ───────────── */}
              {!isFoodVendor && (
                <>
                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <input type="checkbox" id="sendbox" checked={deliveryMethods.sendbox} onChange={() => handleDeliveryMethodChange('sendbox')} disabled={!isEditingDeliveryMethod || deliveryMethods.vendor} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50" />
                    <div className="flex-1">
                      <label htmlFor="sendbox" className={`text-sm font-medium ${!isEditingDeliveryMethod || deliveryMethods.vendor ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}`}>SendBox</label>
                      <p className="text-xs text-muted-foreground mt-1">Delivery handled by SendBox</p>
                      {deliveryMethods.vendor && <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">⚠️ Cannot be selected with Vendor Delivery</p>}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <input type="checkbox" id="vendor" checked={deliveryMethods.vendor} onChange={() => handleDeliveryMethodChange('vendor')} disabled={!isEditingDeliveryMethod || deliveryMethods.sendbox} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50" />
                    <div className="flex-1">
                      <label htmlFor="vendor" className={`text-sm font-medium ${!isEditingDeliveryMethod || deliveryMethods.sendbox ? 'cursor-not-allowed text-muted-foreground' : 'cursor-pointer'}`}>Vendor Delivery</label>
                      <p className="text-xs text-muted-foreground mt-1">You handle delivery logistics yourself</p>
                      {deliveryMethods.sendbox && <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">⚠️ Cannot be selected with Sendbox</p>}
                    </div>
                  </div>

                  <div className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <input type="checkbox" id="gig" checked={deliveryMethods.gig} onChange={() => handleDeliveryMethodChange('gig')} disabled={!isEditingDeliveryMethod} className="mt-0.5 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50" />
                    <div className="flex-1">
                      <label htmlFor="gig" className={`text-sm font-medium ${!isEditingDeliveryMethod ? 'cursor-default' : 'cursor-pointer'}`}>GIG Logistics</label>
                      <p className="text-xs text-muted-foreground mt-1">Delivery handled by GIG Logistics</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Info box */}
            {(deliveryMethods.pickup || deliveryMethods.sendbox || deliveryMethods.vendor || deliveryMethods.gig || deliveryMethods.relay) && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Currently enabled:</strong>{' '}
                  {[
                    deliveryMethods.pickup && 'Pickup',
                    deliveryMethods.relay && 'Relay by Chowdeck',
                    deliveryMethods.sendbox && 'SendBox',
                    deliveryMethods.vendor && 'Vendor Delivery',
                    deliveryMethods.gig && 'GIG Logistics',
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
          <div className="space-y-5 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Availability Setup</h3>
              <Switch
                checked={availabilityEnabled}
                onCheckedChange={setAvailabilityEnabled}
                aria-label="Enable availability schedule"
              />
            </div>

            {availabilityEnabled && (
              <div className="border-t pt-5">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h4 className="text-sm font-medium">Opening and Closing time</h4>
                  <button
                    type="button"
                    onClick={resetAvailability}
                    className="text-xs font-medium text-primary hover:underline"
                  >
                    Use default
                  </button>
                </div>

                <div className="divide-y">
                  {availability.map((item, index) => (
                    <div
                      key={item.day}
                      className="grid gap-3 py-3 md:grid-cols-[112px_minmax(0,1fr)] md:items-center"
                    >
                      <div className="flex items-center gap-3">
                        <Switch
                          checked={item.enabled}
                          onCheckedChange={(checked) =>
                            updateAvailabilityDay(index, "enabled", checked)
                          }
                          aria-label={`${item.enabled ? "Disable" : "Enable"} ${item.day}`}
                          className="h-4 w-7 [&_[data-slot=switch-thumb]]:size-3.5"
                        />
                        <span className="text-xs font-medium">{item.day}</span>
                      </div>

                      <div
                        className={`flex flex-wrap items-center gap-2 transition-opacity ${
                          item.enabled ? "opacity-100" : "pointer-events-none opacity-40"
                        }`}
                      >
                        <div className="flex items-center rounded-md border bg-background">
                          <select
                            value={item.openingHour}
                            onChange={(event) =>
                              updateAvailabilityDay(index, "openingHour", event.target.value)
                            }
                            aria-label={`${item.day} opening hour`}
                            className="h-8 w-12 appearance-none bg-transparent px-2 text-center text-xs outline-none"
                          >
                            {hours.map((hour) => (
                              <option key={hour} value={hour}>{hour}</option>
                            ))}
                          </select>
                          <span className="text-xs text-muted-foreground">:</span>
                          <select
                            value={item.openingMinute}
                            onChange={(event) =>
                              updateAvailabilityDay(index, "openingMinute", event.target.value)
                            }
                            aria-label={`${item.day} opening minute`}
                            className="h-8 w-12 appearance-none bg-transparent px-2 text-center text-xs outline-none"
                          >
                            {minutes.map((minute) => (
                              <option key={minute} value={minute}>{minute}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex overflow-hidden rounded-md border bg-background">
                          {(["AM", "PM"] as const).map((period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() =>
                                updateAvailabilityDay(index, "openingPeriod", period)
                              }
                              className={`h-8 px-2 text-[11px] transition-colors ${
                                item.openingPeriod === period
                                  ? "bg-muted font-medium text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>

                        <span className="px-1 text-xs text-muted-foreground">to</span>

                        <div className="flex items-center rounded-md border bg-background">
                          <select
                            value={item.closingHour}
                            onChange={(event) =>
                              updateAvailabilityDay(index, "closingHour", event.target.value)
                            }
                            aria-label={`${item.day} closing hour`}
                            className="h-8 w-12 appearance-none bg-transparent px-2 text-center text-xs outline-none"
                          >
                            {hours.map((hour) => (
                              <option key={hour} value={hour}>{hour}</option>
                            ))}
                          </select>
                          <span className="text-xs text-muted-foreground">:</span>
                          <select
                            value={item.closingMinute}
                            onChange={(event) =>
                              updateAvailabilityDay(index, "closingMinute", event.target.value)
                            }
                            aria-label={`${item.day} closing minute`}
                            className="h-8 w-12 appearance-none bg-transparent px-2 text-center text-xs outline-none"
                          >
                            {minutes.map((minute) => (
                              <option key={minute} value={minute}>{minute}</option>
                            ))}
                          </select>
                        </div>

                        <div className="flex overflow-hidden rounded-md border bg-background">
                          {(["AM", "PM"] as const).map((period) => (
                            <button
                              key={period}
                              type="button"
                              onClick={() =>
                                updateAvailabilityDay(index, "closingPeriod", period)
                              }
                              className={`h-8 px-2 text-[11px] transition-colors ${
                                item.closingPeriod === period
                                  ? "bg-muted font-medium text-foreground"
                                  : "text-muted-foreground"
                              }`}
                            >
                              {period}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <Button
                  type="button"
                  size="sm"
                  onClick={saveAvailability}
                  disabled={isSavingAvailability}
                  className="mt-4"
                >
                  {isSavingAvailability && (
                    <Loader2 className="size-4 animate-spin" />
                  )}
                  {isSavingAvailability ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bank Account Setup — unchanged */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Bank Account Setup</h3>
              <Button variant="outline" size="sm" onClick={() => setIsAddBankModalOpen(true)}>
                <span className="hidden sm:inline">Add Bank Account</span> <PlusIcon />
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
                      <p className="text-xs text-muted-foreground">{account.bankName} . {account.accountHolder}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Theme & Customization — unchanged */}
      <Card className="shadow-none border-[#F5F5F5] dark:border-[#1F1F1F]">
        <CardContent>
          <div className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Theme & Customization</h3>
              {!isEditingTheme ? (
                <Button onClick={handleEditTheme} variant="outline" size="sm" className="dark:bg-background">
                  <span className="hidden sm:inline mr-2">Edit</span><EditIcon />
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleCancelTheme} variant="outline" size="sm">Cancel</Button>
                  <Button onClick={handleSaveTheme} variant="default" size="sm" disabled={isSavingTheme}>
                    {isSavingTheme ? <Loader2 className="w-4 h-4 animate-spin" /> : <><SaveIcon /><span className="hidden sm:inline ml-2">Save Changes</span></>}
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
                <SelectTrigger className="w-[180px] dark:bg-background"><SelectValue /></SelectTrigger>
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

      <AddBankModal isOpen={isAddBankModalOpen} onClose={() => setIsAddBankModalOpen(false)} onAddBank={handleAddBank} />
    </div>
  );
}

export default StorefrontComponent;
