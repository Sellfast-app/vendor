'use client';

import { LayoutDashboard, BarChart3, Bell, CalendarDays, ChevronUp, Globe, Mail, MoreHorizontal, Package, Settings, ShoppingBag, Ticket, UsersRound, Utensils } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useStoreBusiness } from "@/components/store-business-context";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

type MobileRoute = { icon: typeof LayoutDashboard; label: string; href: string };

export const MobileSidebar = () => {
  const pathname = usePathname();
  const [isStaff, setIsStaff] = useState(false);
  useEffect(() => {
    setIsStaff(document.cookie.split("; ").some((cookie) => cookie === "user_role=vendor_staff"));
  }, []);
  const { businessType, status, error, retry } = useStoreBusiness();
  const isTicketStore = businessType === "ticketing";
  const catalogRoute: MobileRoute = isTicketStore
    ? { label: "Events", href: "/events", icon: CalendarDays }
    : businessType === "food"
      ? { label: "Food items", href: "/inventory/items", icon: Utensils }
      : { label: "Products", href: "/products", icon: Package };
  const primaryRoutes: MobileRoute[] = status === "ready" ? [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    catalogRoute,
    { label: isTicketStore ? "Ticket orders" : "Orders", href: isTicketStore ? "/orders/tickets" : "/orders", icon: isTicketStore ? Ticket : ShoppingBag },
  ] : [];
  const moreRoutes: MobileRoute[] = status === "ready"
    ? isStaff
      ? [{ label: "Settings", href: "/settings", icon: Settings }]
      : [
          ...(!isTicketStore ? [
            ...(businessType === "food" ? [
              { label: "Categories", href: "/inventory/categories", icon: Package },
              { label: "Units", href: "/inventory/units", icon: Package },
            ] : []),
            { label: "Leads", href: "/leads", icon: Mail },
          ] : [{ label: "Attendee check-in", href: "/events/attendees", icon: Ticket }]),
          { label: "Analytics", href: "/analytics", icon: BarChart3 },
          { label: "Staff", href: "/staff", icon: UsersRound },
          { label: "Domains", href: "/domains", icon: Globe },
          { label: "Notifications", href: "/notifications", icon: Bell },
          { label: "Settings", href: "/settings", icon: Settings },
        ]
    : [];
  const isRouteActive = (href: string) => pathname === href || pathname.startsWith(`${href}/`);
  const moreIsActive = moreRoutes.some(route => isRouteActive(route.href));

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white pb-[env(safe-area-inset-bottom)] dark:border-gray-700 dark:bg-background md:hidden">
      {status === "error" ? (
        <div className="flex min-h-16 items-center justify-center gap-2 px-4 text-xs" role="alert">
          <span className="max-w-[70vw] truncate text-muted-foreground">{error}</span>
          <button className="shrink-0 font-medium text-primary" onClick={retry}>Retry</button>
        </div>
      ) : status === "loading" ? (
        <div className="grid min-h-16 grid-cols-4 items-center gap-2 px-3" aria-label="Loading workspace navigation">
          {[0, 1, 2, 3].map(item => <div key={item} className="mx-auto h-9 w-14 animate-pulse rounded-md bg-muted" />)}
        </div>
      ) : (
        <nav aria-label="Mobile dashboard navigation" className="grid min-h-16 grid-cols-4 items-center gap-1 px-2 py-1">
          {primaryRoutes.map(route => {
            const Icon = route.icon;
            const active = isRouteActive(route.href);
            return <Link key={route.href} href={route.href} aria-current={active ? "page" : undefined}
              className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[10px] font-medium leading-none ${active ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
              <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
              <span className="max-w-full truncate">{route.label}</span>
            </Link>;
          })}
          <DropdownMenu>
            <DropdownMenuTrigger aria-label="More dashboard sections" className={`flex min-w-0 flex-col items-center justify-center gap-1 rounded-md px-1 py-1.5 text-[10px] font-medium leading-none ${moreIsActive ? "bg-primary/10 text-primary" : "text-muted-foreground"}`}>
              <span className="relative"><MoreHorizontal className="h-5 w-5" aria-hidden="true" />{moreIsActive && <ChevronUp className="absolute -right-2 -top-1 h-3 w-3" aria-hidden="true" />}</span>
              <span>More</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent side="top" align="end" className="mb-2 max-h-[70dvh] w-56 overflow-y-auto">
              {moreRoutes.map(route => {
                const Icon = route.icon;
                return <DropdownMenuItem key={route.href} asChild>
                  <Link href={route.href} aria-current={isRouteActive(route.href) ? "page" : undefined} className="flex items-center gap-2">
                    <Icon className="h-4 w-4" aria-hidden="true" />{route.label}
                  </Link>
                </DropdownMenuItem>;
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>
      )}
    </div>
  );
};
