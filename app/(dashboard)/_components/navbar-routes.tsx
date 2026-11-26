import { IoNotificationsOutline } from "react-icons/io5";
import { Button } from "@/components/ui/button";
import { HiOutlineExternalLink } from "react-icons/hi";
import { Bell, CalendarDays, ChartNoAxesCombined, ChevronDown, Globe, LayoutDashboard, Mail, Package, Search, Settings, ShoppingBag, Utensils, UsersRound } from "lucide-react";
import { AvatarImage } from "@/components/ui/avatar";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NotificationModal from "./NotificationModal";
import Link from "next/link";
import { useStoreBusiness } from "@/components/store-business-context";

export const NavbarRoutes = () => {
  const [businessName, setBusinessName] = useState<string>("My Business");
  const [storefrontUrl, setStorefrontUrl] = useState<string>("");
  const [storeLogo, setStoreLogo] = useState<string | null>(null); // Add this state
  const router = useRouter();
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [isStaff, setIsStaff] = useState(false);
  const { businessType, status: businessStatus } = useStoreBusiness();
  const isFoodStore = businessType === "food";
  const isTicketStore = businessType === "ticketing";
  const mobileRoutes = isStaff
    ? [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        ...(isTicketStore ? [] : isFoodStore
          ? [{ label: "Food items", href: "/inventory/items", icon: Utensils }]
          : [{ label: "Products", href: "/products", icon: Package }]),
        { label: isTicketStore ? "Ticket orders" : "Orders", href: isTicketStore ? "/orders/tickets" : "/orders", icon: ShoppingBag },
        { label: "Settings", href: "/settings", icon: Settings },
      ]
    : [
        { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
        ...(isTicketStore
          ? [{ label: "Events", href: "/events", icon: CalendarDays }]
          : isFoodStore
            ? [
                { label: "Food items", href: "/inventory/items", icon: Utensils },
                { label: "Categories", href: "/inventory/categories", icon: Package },
                { label: "Units", href: "/inventory/units", icon: Package },
              ]
            : [{ label: "Products", href: "/products", icon: Package }]),
        { label: isTicketStore ? "Ticket orders" : "Orders", href: isTicketStore ? "/orders/tickets" : "/orders", icon: ShoppingBag },
        { label: "Analytics", href: "/analytics", icon: ChartNoAxesCombined },
        ...(!isTicketStore ? [{ label: "Leads", href: "/leads", icon: Mail }] : []),
        { label: "Staff", href: "/staff", icon: UsersRound },
        { label: "Domains", href: "/domains", icon: Globe },
        { label: "Notifications", href: "/notifications", icon: Bell },
        { label: "Settings", href: "/settings", icon: Settings },
      ];

  const getCookieValue = (name: string): string | null => {
    if (typeof window === 'undefined') return null;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null;
    }
    return null;
  };

  // Fetch store data including logo
  const fetchStoreData = async () => {
    try {
      console.log('🔄 Navbar - Fetching store data for logo...');
      
      const response = await fetch('/api/store');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch store data');
      }
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data?.storeDetails) {
        const storeDetails = result.data.storeDetails;

        if (storeDetails.store_url) {
          setStorefrontUrl(storeDetails.store_url);
          document.cookie = `store_url=${encodeURIComponent(storeDetails.store_url)}; path=/; max-age=2592000; SameSite=Lax`;
        }

        // Set store logo if available
        if (storeDetails.logo) {
          setStoreLogo(storeDetails.logo);
          console.log('✅ Navbar - Logo fetched:', storeDetails.logo);
        }
        
        // Also update business name from API if different from cookie
        const storeName = storeDetails.store_name;
        if (storeName && storeName !== businessName) {
          setBusinessName(storeName);
        }
      }
    } catch (error) {
      console.error('❌ Navbar - Error fetching store data:', error);
      // Don't show toast error here to avoid spamming
    }
  };

  useEffect(() => {
    setIsStaff(getCookieValue("user_role") === "vendor_staff");
    const storeName = getCookieValue("store_name");
    if (storeName) {
      setBusinessName(decodeURIComponent(storeName)); 
    } else {
      setBusinessName("My Business"); 
    }

    // Get storefront URL from cookie
    const urlFromCookie = getCookieValue("store_url");
    if (urlFromCookie) {
      try {
        const decodedUrl = decodeURIComponent(urlFromCookie);
        setStorefrontUrl(decodedUrl);
      } catch {
        setStorefrontUrl(urlFromCookie);
      }
    }

    // Fetch store data including logo
    fetchStoreData();
  }, []);

  useEffect(() => {
    if (isStaff) return;
    let active = true;
    const refreshUnreadCount = async () => {
      try {
        const response = await fetch("/api/notifications?page=1&pageSize=1&unread=true", { cache: "no-store" });
        const result = await response.json();
        if (active && response.ok && result.status === "success") setUnreadNotifications(Number(result.data?.total || 0));
      } catch {
        if (active) setUnreadNotifications(0);
      }
    };
    void refreshUnreadCount();
    const interval = window.setInterval(() => void refreshUnreadCount(), 60_000);
    window.addEventListener("swiftree:notifications-changed", refreshUnreadCount);
    return () => {
      active = false;
      window.clearInterval(interval);
      window.removeEventListener("swiftree:notifications-changed", refreshUnreadCount);
    };
  }, [isStaff]);

  useEffect(() => {
    const checkForUpdatedStoreName = () => {
      const storeName = getCookieValue("store_name");
      if (storeName) {
        const decodedStoreName = decodeURIComponent(storeName);
        if (decodedStoreName !== businessName) {
          setBusinessName(decodedStoreName);
        }
      }
    };

    checkForUpdatedStoreName();
    const interval = setInterval(checkForUpdatedStoreName, 1000);

    return () => clearInterval(interval);
  }, [businessName]);

  const getInitials = (name: string) => {
    const words = name.split(" ").filter(Boolean);
    if (words.length === 0) return "MB";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  const handleVisitStorefront = () => {
    if (storefrontUrl) {
      // Ensure the URL has the proper protocol and is not encoded
      let fullUrl = storefrontUrl;
      if (!storefrontUrl.startsWith('http')) {
        fullUrl = `https://${storefrontUrl}`;
      }
      // Clean the URL - remove any encoding
      fullUrl = fullUrl.replace(/%3A/g, ':').replace(/%2F/g, '/');
      window.open(fullUrl, '_blank', 'noopener,noreferrer');
    } else {
      // Fallback if no URL is available
      console.log('No storefront URL available');
    }
  };

  return (
    <div className="flex min-w-0 flex-1 items-center justify-between gap-2">
      <div className="hidden md:block max-w-md pl-4 relative w-full">
        <Search className="absolute right-2 top-3 h-4 w-4 text-muted-foreground" />
        <input
          placeholder="Search ..."
          className=" p-2 border border-[#F5F5F5] w-full rounded-lg dark:bg-background dark:border-0"
        />
      </div>

      <div className="md:hidden min-w-0 flex-1">
        <DropdownMenu>
          <DropdownMenuTrigger aria-label={`Open ${businessName} workspace menu`} className="w-full min-w-0 max-w-[calc(100vw-120px)] md:max-w-[200px]">
            <div className="flex min-w-0 items-center gap-2">
              <Avatar className="w-8 h-8 border rounded-full text-center">
                {/* Display logo if available, otherwise fallback to initials */}
                <AvatarImage 
                  src={storeLogo || ""} 
                  alt={businessName} 
                  className="object-cover rounded-full"
                />
                <AvatarFallback className="bg-gray-200 dark:bg-gray-700 flex items-center justify-center w-full h-full text-xs font-medium">
                  {getInitials(businessName)}
                </AvatarFallback>
              </Avatar>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {businessName}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="max-h-[70dvh] w-64">
            <DropdownMenuLabel className="truncate">{businessName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {businessStatus === "ready" && mobileRoutes.map(({ label, href, icon: Icon }) => (
              <DropdownMenuItem key={href} asChild>
                <Link href={href}><Icon className="h-4 w-4" />{label}</Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {!isStaff && <div className="flex shrink-0 items-center gap-1 sm:gap-3">
        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Notifications" onClick={() => setIsNotificationModalOpen(true)}>
          <IoNotificationsOutline className="w-5 h-5" />
          {unreadNotifications > 0 && <span className="ml-1 min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-semibold leading-none text-primary-foreground">{unreadNotifications > 99 ? "99+" : unreadNotifications}</span>}
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" aria-label="Settings" onClick={() => router.push("/settings")}>
          <Settings className="md:hidden w-4 h-4 cursor-pointer hover:text-gray-600 dark:hover:text-gray-300 transition-colors" />
        </Button>

        <Button
          variant={"outline"}
          className="rounded-full dark:bg-background hidden md:flex"
          onClick={handleVisitStorefront}
        >
          Visit Your StoreFront <HiOutlineExternalLink />
        </Button>
      </div>}
      
      {!isStaff && <NotificationModal
        isOpen={isNotificationModalOpen} 
        onClose={() => setIsNotificationModalOpen(false)} 
        onUnreadCountChange={setUnreadNotifications}
      />}
    </div>
  );
};
