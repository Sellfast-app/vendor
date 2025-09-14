"use client";


import { AvatarImage } from "@/components/ui/avatar";
import { Avatar, AvatarFallback } from "@radix-ui/react-avatar";
import { LayoutDashboardIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { SVGProps, useState } from "react";
import { toast } from "sonner";
import { SidebarItem } from "../app/(dashboard)/_components/sidebar-item";
import Products from "./svgIcons/Products";
import Orders from "./svgIcons/Orders";
import Analytics from "./svgIcons/Analytics";
import Payouts from "./svgIcons/Payouts";
import Settings from "./svgIcons/Settings";
import Logout from "./svgIcons/Logout";

// Define route type
interface RouteLink {
  label: string;
  href: string;
}

interface Route {
  icon: React.FC<SVGProps<SVGSVGElement> & { color?: string }>;
  label: string;
  href?: string;
  onClick?: () => Promise<void> | void;
  links?: RouteLink[]; // 👈 Fix is here
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
    const [businessName, ] = useState<string>("Cassie's Kitchen");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/logout");

      if (!res.ok) throw new Error("Failed to clear session");
      localStorage.clear();
      sessionStorage.clear();

      router.push("/login");
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
        <div className="flex items-center space-x-3 ml-6 mt-5 ">
          <Avatar className="w-10 h-10 border rounded-full text-center">
          <AvatarImage  alt={businessName} />
            <AvatarFallback>CK</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
             Cassie&apos;s Kitchen
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
