"use client";

import { AvatarImage } from "@/components/ui/avatar";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { LayoutDashboardIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SVGProps, useEffect, useState } from "react";
import { toast } from "sonner";
import { SidebarItem } from "../app/(dashboard)/_components/sidebar-item";
import Products from "./svgIcons/Products";
import InventoryNavigation from "./inventory-navigation";
import { isFoodBusinessType } from "@/lib/store";
import Orders from "./svgIcons/Orders";
import Analytics from "./svgIcons/Analytics";
import Settings from "./svgIcons/Settings";
import EventIcon from "./svgIcons/EventIcon";
import Logout from "./svgIcons/Logout";
import WalletIcon from "./svgIcons/WalletIcon";
import StaffIcon from "./svgIcons/StaffIcon";
import Emailcon from "./svgIcons/Emailcon";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

interface RouteLink {
  label: string;
  href: string;
}

interface Route {
  icon: React.FC<SVGProps<SVGSVGElement> & { color?: string }>;
  label: string;
  href?: string;
  onClick?: () => Promise<void> | void;
  links?: RouteLink[];
}

const adminRoutes: Route[] = [
  { icon: LayoutDashboardIcon, label: "Overview", href: "/dashboard" },
  { icon: Products, label: "Products", href: "/products" },
  { icon: Orders, label: "Orders", href: "/orders" },
  { icon: Analytics, label: "Analytics", href: "/analytics" },
  { icon: WalletIcon, label: "Wallet", href: "/wallet" },
  { icon: EventIcon, label: "Events", href: "/events" },
  { icon: Emailcon, label: "Leads", href: "/leads" },
  { icon: StaffIcon, label: "Staff", href: "/staff" },
];

const actionRoutes: Route[] = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Logout, label: "Logout", href: "/" },
];

export const SidebarRoutes = () => {
  const [businessName, setBusinessName] = useState<string>("My Business");
  const [storeLogo, setStoreLogo] = useState<string | null>(null); // Add this state
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isFoodStore, setIsFoodStore] = useState(false);

  // Helper function to get cookie value
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
      const response = await fetch('/api/store');
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch store data');
      }
      
      const result = await response.json();
      
      if (result.status === 'success' && result.data?.storeDetails) {
        const storeDetails = result.data.storeDetails;
        setIsFoodStore(isFoodBusinessType(storeDetails.business_type));
        
        // Set store logo if available
        if (storeDetails.logo) {
          setStoreLogo(storeDetails.logo);
        }
        
        // Also update business name from API if different from cookie
        const storeName = storeDetails.store_name;
        if (storeName && storeName !== businessName) {
          setBusinessName(storeName);
        }
      }
    } catch {
      // Keep sidebar rendering stable if store branding is temporarily unavailable.
    }
  };

  // Retrieve business name from cookies and fetch store data on mount
  useEffect(() => {
    const storeName = getCookieValue("store_name");
    if (storeName) {
      setBusinessName(decodeURIComponent(storeName));
    }
    
    // Fetch store data including logo
    fetchStoreData();
  }, []);

  // Also listen for cookie changes (e.g., after login)
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

    // Check immediately and then periodically
    checkForUpdatedStoreName();
    const interval = setInterval(checkForUpdatedStoreName, 1000);

    return () => clearInterval(interval);
  }, [businessName]);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Retrieve accessToken from cookies
      const accessToken = getCookieValue("accessToken");

      const res = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to clear session");
      }

      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();

      // Clear cookies manually (since logout API should handle this, but as backup)
      document.cookie = "accessToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "store_name=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Redirect to login
      router.push("/login");
      toast.success("Logged out successfully");
      window.location.reload(); // Critical for state cleanup
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed - please try again");
    } finally {
      setIsLoading(false);
    }
  };

  const updatedActionRoutes = actionRoutes.map((route) =>
    route.label === "Logout"
      ? { ...route, onClick: handleLogout, href: undefined }
      : route
  );

  // Generate AvatarFallback initials from business name
  const getInitials = (name: string) => {
    const words = name.split(" ").filter(Boolean);
    if (words.length === 0) return "MB";
    if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
    return (words[0][0] + words[1][0]).toUpperCase();
  };

  return (
    <div className="flex min-h-full w-full flex-col">
      <div className="space-y-1">
        {adminRoutes.map((route, index) => (
          <div key={route.label}>
          {!(route.label === "Products" && isFoodStore) && <SidebarItem
            key={route.href!}
            icon={route.icon}
            label={route.label}
            href={route.href}
            data-tour={index === 0 ? "sidebar-nav" : undefined}
          />}
          {route.label === "Products" && <InventoryNavigation />}
          </div>
        ))}
      </div>
      <div className="mt-auto w-full pt-6">
        <div className="w-full border-b border-[#F5F5F5] dark:border-[#1F1F1F]">
          {updatedActionRoutes.map((route) => (
            <SidebarItem
              key={route.label}
              icon={route.icon}
              label={route.label}
              href={route.href}
              onClick={route.onClick}
              disabled={route.label === "Logout" && isLoading}
            />
          ))}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger className="w-full">
            <div className="mx-4 mt-4 flex items-center gap-3 rounded-lg px-2 py-2 text-left transition-colors hover:bg-muted">
              <Avatar className="h-10 w-10 rounded-full border text-center">
                <AvatarImage
                  src={storeLogo || ""}
                  alt={businessName}
                  className="rounded-full object-cover"
                />
                <AvatarFallback>{getInitials(businessName)}</AvatarFallback>
              </Avatar>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                  {businessName}
                </p>
                <p className="text-xs text-muted-foreground">Store workspace</p>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuItem>Other Stores</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
