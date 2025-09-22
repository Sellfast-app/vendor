"use client";

import { AvatarImage } from "@/components/ui/avatar";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { LayoutDashboardIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SVGProps, useEffect, useState } from "react";
import { toast } from "sonner";
import { SidebarItem } from "../app/(dashboard)/_components/sidebar-item";
import Products from "./svgIcons/Products";
import Orders from "./svgIcons/Orders";
import Analytics from "./svgIcons/Analytics";
import Payouts from "./svgIcons/Payouts";
import Settings from "./svgIcons/Settings";
import Logout from "./svgIcons/Logout";

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
  { icon: Payouts, label: "Payouts", href: "/payouts" },
];

const actionRoutes: Route[] = [
  { icon: Settings, label: "Settings", href: "/settings" },
  { icon: Logout, label: "Logout", href: "/" },
];

export const SidebarRoutes = () => {
  const [businessName, setBusinessName] = useState<string>("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  // Retrieve business name from localStorage on mount
  useEffect(() => {
    const storedBusinessName = localStorage.getItem("store_name");
    if (storedBusinessName) {
      setBusinessName(storedBusinessName);
    } else {
      setBusinessName("My Business"); // Fallback
    }
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Retrieve accessToken from cookies
      const accessToken = document.cookie
        .split("; ")
        .find((row) => row.startsWith("accessToken="))
        ?.split("=")[1];

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
    <div className="flex flex-col w-full">
      {adminRoutes.map((route) => (
        <SidebarItem
          key={route.href!}
          icon={route.icon}
          label={route.label}
          href={route.href}
        />
      ))}
      <div className="mt-[340px] w-full">
        <div className="w-full border-b border-[#F5F5F5] dark:border-background">
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
        <div className="flex items-center space-x-3 ml-6 mt-5">
          <Avatar className="w-10 h-10 border rounded-full text-center">
            <AvatarImage alt={businessName} />
            <AvatarFallback>{getInitials(businessName)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {businessName}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};