"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import type { V2BusinessType } from "@/lib/v2";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useStoreBusiness } from "@/components/store-business-context";

export function BusinessTypeGuard({
  allow,
  redirectTo,
  children,
}: {
  allow: V2BusinessType[];
  redirectTo: string;
  children: React.ReactNode;
}) {
  const { businessType, status, error, retry } = useStoreBusiness();
  const router = useRouter();
  const allowed = status === "ready" && businessType !== null && allow.includes(businessType);

  useEffect(() => {
    if (status === "ready" && businessType && !allowed) {
      router.replace(redirectTo);
    }
  }, [allowed, businessType, redirectTo, router, status]);

  if (status === "loading") {
    return <main className="mx-auto max-w-5xl space-y-4 px-4 py-8 sm:px-6"><Skeleton className="h-8 w-56" /><Skeleton className="h-32 w-full" /></main>;
  }

  if (status === "error") {
    return <main className="mx-auto max-w-xl px-4 py-12 text-center"><h1 className="text-lg font-semibold">Workspace unavailable</h1><p className="mt-2 text-sm text-muted-foreground">{error}</p><Button variant="outline" className="mt-4" onClick={retry}>Retry</Button></main>;
  }

  if (!allowed) return <main className="px-4 py-12 text-center text-sm text-muted-foreground">Opening the correct workspace…</main>;
  return children;
}
