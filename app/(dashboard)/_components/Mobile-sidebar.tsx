'use client';

import Analytics from "@/components/svgIcons/Analytics";
import Orders from "@/components/svgIcons/Orders";
import Products from "@/components/svgIcons/Products";
import { LayoutDashboardIcon, Bell, Ticket } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStoreBusiness } from "@/components/store-business-context";

const routes = [
  {
    icon: LayoutDashboardIcon,
    label: "Overview",
    href: "/dashboard",
  },
  {
    icon: Products,
    label: "Products",
    href: "/products",
  },
  {
    icon: Orders,
    label: "Orders",
    href: "/orders",
  },
  {
    icon: Ticket,
    label: "Events",
    href: "/events",
  },
  {
    icon: Analytics,
    label: "Analytics",
    href: "/analytics",
  },
  {
    icon: Bell,
    label: "Notifications",
    href: "/notifications",
  },
];

export const MobileSidebar = () => {
  const pathname = usePathname();
  const [isStaff, setIsStaff] = useState(false);
  useEffect(() => {
    setIsStaff(document.cookie.split("; ").some((cookie) => cookie === "user_role=vendor_staff"));
  }, []);
  const { businessType, status, error, retry } = useStoreBusiness();
  const isTicketStore = businessType === "ticketing";
  const visibleRoutes = status === "ready"
    ? routes
      .filter(route => !isStaff || ["Overview", "Orders"].includes(route.label))
      .filter(route => route.label !== "Events" || isTicketStore)
      .filter(route => route.label !== "Products" || !isTicketStore)
      .map((route) => route.label === "Orders" && isTicketStore
        ? { ...route, label: "Ticket orders", href: "/orders/tickets" }
        : route)
    : [];

  return (
    <div className="md:hidden fixed inset-x-0 bottom-0 z-50 overflow-x-auto border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-gray-700 dark:bg-background">
      <div className="flex w-max min-w-full items-center justify-around py-2">
        {status === "loading" && <div className="h-9 w-40 animate-pulse rounded-md bg-muted" aria-label="Loading workspace navigation" />}
        {status === "error" && <div className="flex items-center gap-2 text-xs" role="alert"><span className="max-w-48 truncate text-muted-foreground">{error}</span><button className="font-medium text-primary" onClick={retry}>Retry</button></div>}
        {visibleRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href || (route.href === "/orders/tickets" && pathname.startsWith("/orders/tickets"));
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex min-w-[72px] shrink-0 flex-col items-center rounded-lg px-2 py-2 transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-[#737373] hover:text-primary'
              }`}
            >
              <Icon 
                color={isActive ? 'var(--primary)' : '#737373'}
                className="h-5 w-5" 
              />
              <span className="mt-1 max-w-[76px] truncate text-[11px] leading-tight">{route.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
