'use client';

import Analytics from "@/components/svgIcons/Analytics";
import Orders from "@/components/svgIcons/Orders";
import Products from "@/components/svgIcons/Products";
import { LayoutDashboardIcon, Bell } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { isV2TicketingBusiness } from "@/lib/v2";

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
  const [isTicketStore, setIsTicketStore] = useState(false);

  useEffect(() => {
    let active = true;
    fetch("/api/store", { cache: "no-store" })
      .then((response) => response.json())
      .then((result) => {
        const store = result.data?.storeDetails;
        const type = store?.metadata?.v2?.business_type || store?.business_type;
        if (active) setIsTicketStore(isV2TicketingBusiness(type));
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, []);

  const visibleRoutes = routes.map((route) => route.label === "Orders" && isTicketStore
    ? { ...route, label: "Ticket orders", href: "/orders/tickets" }
    : route);

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-background">
      <div className="flex justify-around items-center py-2">
        {visibleRoutes.map((route) => {
          const Icon = route.icon;
          const isActive = pathname === route.href || (route.href === "/orders/tickets" && pathname.startsWith("/orders/tickets"));
          return (
            <Link
              key={route.href}
              href={route.href}
              className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                isActive 
                  ? 'text-primary bg-primary/10' 
                  : 'text-[#737373] hover:text-primary'
              }`}
            >
              <Icon 
                color={isActive ? 'var(--primary)' : '#737373'}
                className="h-5 w-5" 
              />
              <span className="text-xs mt-1">{route.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
