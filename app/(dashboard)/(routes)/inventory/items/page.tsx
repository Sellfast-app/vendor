"use client";

import { useEffect, useState } from "react";
import FoodTable from "@/app/(dashboard)/(routes)/products/_components/FoodTable";
import { getStoreCurrency } from "@/lib/v2-currency";
import { Skeleton } from "@/components/ui/skeleton";

export default function Page() {
  const [currency, setCurrency] = useState("NGN");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetch("/api/store", { cache: "no-store" }).then(async response => {
      const result = await response.json();
      if (!response.ok || result.status !== "success" || !result.data?.storeDetails) throw new Error("Store settings unavailable");
      setCurrency(getStoreCurrency(result.data.storeDetails));
    }).catch(() => undefined).finally(() => setLoading(false));
  }, []);
  if (loading) return <div className="space-y-4 p-6"><Skeleton className="h-8 w-40" /><Skeleton className="h-72 w-full" /></div>;
  return <main className="space-y-5 px-4 py-6 sm:px-6 lg:px-8"><h1 className="text-xl font-semibold">Food menu items</h1><FoodTable currency={currency} /></main>;
}
