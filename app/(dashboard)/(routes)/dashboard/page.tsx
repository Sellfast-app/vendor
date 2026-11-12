"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { JSX, useEffect, useMemo, useState } from "react";
import { RiShare2Fill } from "react-icons/ri";
import {
  ArrowRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  ChevronRight,
  Download,
  Globe2,
  MessageCircle,
  MonitorSmartphone,
  PackagePlus,
  PlusIcon,
  RadioTower,
  ReceiptText,
  Settings,
  ShoppingBag,
  Store,
  CalendarDays,
  Ticket,
  Truck,
  Users,
  CreditCard,
} from "lucide-react";
import SalesRevenueChart from "./_components/SalesRevenueChart";
import BestSellingProducts from "./_components/BestSellingProducts";
import { ExportModal } from "@/components/ExportModal";
import AddProductModal from "../products/_components/AddProductModal";
import RecentOrdersTable from "./_components/RecentOrdersTable";
import { useStoreBusiness } from "@/components/store-business-context";
import OnboardingTour, { type TourStep } from "./_components/OnboardingTour";

interface Product {
  sku: string;
  productName: string;
  description?: string;
  stock: number;
  remanent: number;
  sales: number;
  status: string;
  createdAt: string;
  thumbnail: string;
  variants?: { id: string; size: string | number; color: string; price: number; quantity: number }[];
}

interface StoreOverviewData {
  total_products?: number;
  total_orders?: number;
  total_revenue?: string | number;
  total_sales?: number;
  pending_orders?: number;
  completed_orders?: number;
}

const formatCurrency = (value: string | number | undefined) => {
  const amount = typeof value === "string" ? Number(value) : value ?? 0;
  return `₦${Number.isFinite(amount) ? amount.toLocaleString("en-NG") : "0"}`;
};

function SnapshotCard({
  title,
  value,
  icon,
  tone,
}: {
  title: string;
  value: string | number;
  icon: JSX.Element;
  tone: string;
}) {
  return (
    <div className={`${tone} flex min-h-20 items-center justify-between rounded-lg px-4 py-3`}>
      <div>
        <p className="text-xl font-semibold leading-none text-foreground">{value}</p>
        <p className="mt-2 text-xs font-medium text-muted-foreground">{title}</p>
      </div>
      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/80 text-primary shadow-sm dark:bg-background">
        {icon}
      </div>
    </div>
  );
}

function OverviewValue({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: JSX.Element;
}) {
  return (
    <div>
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
        {icon}
      </div>
      <p className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-lg font-semibold text-foreground">{value}</p>
    </div>
  );
}

const tourSteps: TourStep[] = [
  {
    target: "launch-banner",
    title: "Your launch setup",
    description:
      "Track how ready your store is and continue setup anytime from this banner.",
  },
  {
    target: "add-product",
    title: "Add your first item",
    description:
      "Use this button to create products or food items — they go live on every sales channel.",
  },
  {
    target: "business-overview",
    title: "Business overview",
    description:
      "Orders, sales, catalog size and revenue at a glance — refreshed as your store grows.",
  },
  {
    target: "todo-list",
    title: "To-do list",
    description:
      "A guided checklist of everything left to launch. Tick items off as you go.",
  },
  {
    target: "quick-actions",
    title: "Quick actions",
    description:
      "One-tap shortcuts to the things you do most: add items and manage settings.",
  },
  {
    target: "sidebar-nav",
    title: "Navigate anywhere",
    description:
      "Products, orders, analytics and more live here. You're all set — welcome aboard!",
  },
];

function DashboardPage() {
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const router = useRouter();
  const { businessType, storeName, status: storeTypeStatus, error: storeTypeError, retry: retryStoreType } = useStoreBusiness();
  const [overview, setOverview] = useState<StoreOverviewData | null>(null);
  const [isOverviewLoading, setIsOverviewLoading] = useState(true);

  useEffect(() => {
    setIsStaff(document.cookie.split("; ").some((cookie) => cookie === "user_role=vendor_staff"));
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const fetchOverview = async () => {
      try {
        setIsOverviewLoading(true);
        const response = await fetch("/api/store/overview", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error("Failed to fetch overview");
        const result = await response.json();
        if (result.status !== "success") throw new Error(result.message || "Overview request failed");
        setOverview(result.data || {});
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error("Error fetching overview:", error);
        setOverview(null);
      } finally {
        if (!controller.signal.aborted) setIsOverviewLoading(false);
      }
    };

    if (storeTypeStatus === "ready" && businessType !== "ticketing") void fetchOverview();

    return () => controller.abort();
  }, [businessType, storeTypeStatus]);

  const isRestaurant = businessType === "food";
  const isTicketStore = businessType === "ticketing";

  useEffect(() => {
    if (storeTypeStatus !== "ready") return;

    if (isRestaurant && isProductModalOpen) {
      setIsProductModalOpen(false);
      router.push("/inventory/items?create=1");
    }
  }, [isProductModalOpen, isRestaurant, storeTypeStatus, router]);

  const snapshotMetrics = useMemo(
    () => [
      {
        title: "Orders",
        value: overview?.total_orders ?? 0,
        icon: <ReceiptText className="h-5 w-5" />,
        tone: "bg-emerald-50 dark:bg-emerald-950/20",
      },
      {
        title: isRestaurant ? "Food items sold" : "Products sold",
        value: overview?.total_sales ?? 0,
        icon: <ShoppingBag className="h-5 w-5" />,
        tone: "bg-blue-50 dark:bg-blue-950/20",
      },
      {
        title: "Active catalog",
        value: overview?.total_products ?? 0,
        icon: <Store className="h-5 w-5" />,
        tone: "bg-amber-50 dark:bg-amber-950/20",
      },
      {
        title: "Revenue",
        value: formatCurrency(overview?.total_revenue),
        icon: <Banknote className="h-5 w-5" />,
        tone: "bg-rose-50 dark:bg-rose-950/20",
      },
    ],
    [isRestaurant, overview]
  );

  const fieldOptions = [
    { label: "Orders", value: "total-orders" },
    { label: isRestaurant ? "Food Items Sold" : "Products Sold", value: "total-sales" },
    { label: "Active Catalog", value: "total-products" },
    { label: "Revenue", value: "total-revenue" },
    { label: "Sales Count vs Revenue Growth", value: "Sales Count vs Revenue Growth" },
    { label: "Best Selling Products", value: "Best Selling Products" },
    { label: "Recent Orders", value: "Recent Orders" },
  ];

  const setupTasks = [
    {
      title: "Configure payment methods",
      description: "Choose which providers process payments on your storefront.",
      href: "/settings",
      icon: CreditCard,
      complete: true,
    },
    {
      title: "Complete store information",
      description: "Add logo, banner, currency, country and storefront details.",
      href: "/settings",
      icon: Store,
      complete: false,
    },
    {
      title: "Configure delivery and pickup",
      description: "Enable vendor delivery, branch pickup or automated shipping.",
      href: "/settings",
      icon: Truck,
      complete: false,
    },
    {
      title: isRestaurant ? "Add food items to your menu" : "Add products to your catalog",
      description: "Publish items customers can buy on website, WhatsApp and web chat.",
      href: "/products",
      icon: PackagePlus,
      complete: Boolean((overview?.total_products ?? 0) > 0),
    },
    {
      title: "Set up team access",
      description: "Create staff roles and permissions for daily operations.",
      href: "/staff",
      icon: Users,
      complete: false,
    },
  ];

  const completedTasks = setupTasks.filter((task) => task.complete).length;
  const setupProgress = Math.round((completedTasks / setupTasks.length) * 100);

  const channelCards = [
    {
      label: "Website Storefront",
      revenue: formatCurrency(overview?.total_revenue),
      orders: `${overview?.total_orders ?? 0} orders`,
      icon: MonitorSmartphone,
      progress: 48,
    },
    {
      label: "WhatsApp AI",
      revenue: "₦0",
      orders: "0 orders",
      icon: MessageCircle,
      progress: 22,
    },
    {
      label: "Web Chat Widget",
      revenue: "₦0",
      orders: "0 orders",
      icon: RadioTower,
      progress: 14,
    },
  ];

  const quickActions = [
    {
      label: isRestaurant ? "Add food item" : "Add product",
      icon: PackagePlus,
      action: handleOpenAddModal,
      disabled: storeTypeStatus !== "ready",
    },
    { label: "Payment methods", icon: CreditCard, href: "/settings" },
    { label: "Payment methods", icon: BadgeCheck, href: "/settings" },
    { label: "Store settings", icon: Settings, href: "/settings" },
  ];

  function handleAddProduct(newProduct: Product) {
    window.dispatchEvent(new CustomEvent("productAdded", { detail: newProduct }));
    setIsProductModalOpen(false);
  }

  function handleOpenAddModal() {
    if (storeTypeStatus !== "ready") return;

    if (isRestaurant) {
      router.push("/inventory/items?create=1");
      return;
    }

    setIsProductModalOpen(true);
  }

  if (storeTypeStatus === "loading") {
    return <main className="mx-auto max-w-6xl space-y-5 px-4 py-8 sm:px-6" aria-label="Loading business dashboard">
      <Skeleton className="h-12 w-full" /><Skeleton className="h-32 w-full" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{[0, 1, 2, 3].map(item => <Skeleton key={item} className="h-24" />)}</div>
    </main>;
  }

  if (storeTypeStatus === "error") {
    return <main className="mx-auto max-w-xl px-4 py-12 text-center"><h1 className="text-lg font-semibold">Workspace unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{storeTypeError}</p><Button variant="outline" className="mt-4" onClick={retryStoreType}>Retry</Button></main>;
  }

  if (isStaff) {
    const ordersHref = isTicketStore ? "/orders/tickets" : "/orders";
    return <main className="mx-auto min-h-screen max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header><p className="text-xs font-medium uppercase text-primary">Store operations</p><h1 className="mt-2 text-2xl font-semibold">Dashboard</h1><p className="mt-1 text-sm text-muted-foreground">Monitor incoming orders and continue fulfillment from the orders page.</p></header>
      <section className="grid gap-4 sm:grid-cols-2" aria-label="Order overview">
        <Card className="shadow-none"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Total orders</p><p className="mt-2 text-2xl font-semibold">{isOverviewLoading ? "—" : overview?.total_orders ?? 0}</p></CardContent></Card>
        <Card className="shadow-none"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Pending orders</p><p className="mt-2 text-2xl font-semibold">{isOverviewLoading ? "—" : overview?.pending_orders ?? 0}</p></CardContent></Card>
      </section>
      <Button asChild><Link href={ordersHref}>View orders <ArrowRight className="h-4 w-4" /></Link></Button>
    </main>;
  }

  if (isTicketStore) {
    const ticketActions = [
      { label: "Manage events", description: "Create and update events and ticket types.", href: "/events", icon: CalendarDays },
      { label: "Ticket orders", description: "Review purchases, payment status and attendees.", href: "/orders/tickets", icon: Ticket },
      { label: "Attendee check-in", description: "Scan or enter ticket codes at the door.", href: "/events/attendees", icon: CheckCircle2 },
    ];

    return <main className="mx-auto min-h-screen max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <header><p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Ticketing</p><h1 className="mt-2 text-2xl font-semibold">Hello {storeName || "there"}</h1><p className="mt-1 text-sm text-muted-foreground">Manage events, ticket sales and attendee admission.</p></header>
      <section className="grid gap-4 md:grid-cols-3" aria-label="Ticketing workspace">
        {ticketActions.map(action => {
          const Icon = action.icon;
          return <Link key={action.href} href={action.href} className="flex min-h-36 flex-col justify-between border bg-card p-5 transition-colors hover:border-primary/40">
            <Icon className="h-5 w-5 text-primary" />
            <span><span className="block font-medium">{action.label}</span><span className="mt-1 block text-sm text-muted-foreground">{action.description}</span></span>
          </Link>;
        })}
      </section>
    </main>;
  }

  return (
    <div className="min-h-screen bg-[#FAFBFA] px-4 py-6 sm:px-6 lg:px-8 dark:bg-background">
      <div className="mb-5 rounded-lg bg-[#101820] px-4 py-3 text-white shadow-sm" data-tour="launch-banner">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <p className="text-sm font-medium">
            Your Swiftree launch setup is {setupProgress}% complete. Finish the next steps to unlock every sales channel.
          </p>
          <Link href="/settings">
            <Button size="sm" variant="secondary" className="w-full bg-white text-[#101820] hover:bg-white/90 lg:w-auto">
              Continue setup
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <Card className="mb-6 shadow-none">
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold">Complete your onboarding</h2>
                  <p className="text-xs text-muted-foreground">
                    Complete the next steps to launch your website and sales channels.
                  </p>
                </div>
                <span className="shrink-0 text-xs font-semibold text-primary">{setupProgress}%</span>
              </div>
              <Progress value={setupProgress} className="h-2" />
            </div>
            <Link href="/settings">
              <Button className="w-full lg:w-auto">Next Step: Payment methods</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="mb-5 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Hello {storeName || "there"}</h1>
          <Link href="/analytics" className="mt-1 inline-flex items-center gap-1 text-sm font-medium text-primary">
            View channel performance today
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={() => setIsExportModalOpen(true)}
            className="border-[#E7ECE7] bg-white dark:border-[#1F1F1F] dark:bg-background"
          >
            <RiShare2Fill />
            <span className="ml-2">Export report</span>
          </Button>
          <Button
            onClick={handleOpenAddModal}
            data-tour="add-product"
          >
            <PlusIcon className="h-4 w-4" />
            <span className="ml-2">
              {isRestaurant ? "Add Food" : "Add Product"}
            </span>
          </Button>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          <Card className="shadow-none" data-tour="business-overview">
            <CardHeader className="pb-3">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <CardTitle className="text-base">Business Overview</CardTitle>
                  <p className="text-xs text-muted-foreground">Here is how your business is doing today.</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-lg bg-muted px-3 py-2 text-xs font-medium">
                    Business report is ready.
                  </span>
                  <Button size="icon" className="h-9 w-9" aria-label="Download business report">
                    <Download className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {isOverviewLoading
                  ? Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-20 rounded-lg" />)
                  : snapshotMetrics.map((metric) => <SnapshotCard key={metric.title} {...metric} />)}
              </div>

              <div className="grid gap-5 border-t pt-5 lg:grid-cols-3">
                <OverviewValue
                  label="Total sales"
                  value={formatCurrency(overview?.total_revenue)}
                  icon={<Banknote className="h-5 w-5" />}
                />
                <OverviewValue
                  label="Pending orders"
                  value={`${overview?.pending_orders ?? 0}`}
                  icon={<ReceiptText className="h-5 w-5" />}
                />
                <OverviewValue
                  label="Completed orders"
                  value={`${overview?.completed_orders ?? 0}`}
                  icon={<CheckCircle2 className="h-5 w-5" />}
                />
              </div>
            </CardContent>
          </Card>

          <SalesRevenueChart />

          <Card className="shadow-none">
            <CardContent className="p-0">
              <RecentOrdersTable />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card className="border-primary/10 bg-primary/5 shadow-none" data-tour="todo-list">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between gap-3">
                <CardTitle className="text-base">To-do List</CardTitle>
                <Link href="/settings" className="text-xs font-semibold text-primary">
                  View All
                </Link>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              {setupTasks.slice(0, 4).map((task) => {
                const Icon = task.icon;
                return (
                  <Link
                    key={task.title}
                    href={task.href}
                    className="flex items-center justify-between gap-3 rounded-lg bg-white p-3 text-sm shadow-sm transition hover:border-primary/30 dark:bg-background"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{task.title}</span>
                        <span className="block truncate text-xs text-muted-foreground">{task.description}</span>
                      </span>
                    </span>
                    {task.complete ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                  </Link>
                );
              })}
            </CardContent>
          </Card>

          <Card className="shadow-none">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Top 5 Sales Channel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {channelCards.map((channel) => {
                const Icon = channel.icon;
                return (
                  <div key={channel.label} className="space-y-2">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted text-foreground">
                          <Icon className="h-4 w-4" />
                        </span>
                        <div>
                          <p className="text-sm font-medium">{channel.label}</p>
                          <p className="text-xs text-muted-foreground">{channel.orders}</p>
                        </div>
                      </div>
                      <p className="text-sm font-semibold">{channel.revenue}</p>
                    </div>
                    <Progress value={channel.progress} className="h-2" />
                  </div>
                );
              })}
              <Link href="/analytics">
                <Button variant="outline" className="mt-1 w-full">
                  Open analytics
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-none" data-tour="quick-actions">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
              {quickActions.map((action) => {
                const Icon = action.icon;
                const content = (
                  <span className="flex h-24 flex-col items-center justify-center gap-2 rounded-lg border bg-white text-center text-xs font-medium transition hover:border-primary/40 dark:bg-background">
                    <Icon className="h-5 w-5 text-primary" />
                    {action.label}
                  </span>
                );

                if ("href" in action && action.href) {
                  return (
                    <Link key={action.label} href={action.href}>
                      {content}
                    </Link>
                  );
                }

                return (
                  <button key={action.label} type="button" onClick={action.action} disabled={action.disabled}>
                    {content}
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <BestSellingProducts />

          <Card className="shadow-none">
            <CardContent className="flex items-start gap-3 p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Globe2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold">Routing hub</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Website, WhatsApp AI and web chat links will be grouped into your Swiftree routing hub.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AddProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onAddProduct={handleAddProduct}
      />
      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        endpointPrefix={isRestaurant ? "FoodItems" : "Products"}
        fieldOptions={fieldOptions}
        dataName={isRestaurant ? "Food Items" : "Products"}
      />
      <OnboardingTour storageKey="swiftree-dashboard-tour-v1" steps={tourSteps} />
    </div>
  );
}

export default DashboardPage;
