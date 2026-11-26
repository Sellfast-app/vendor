"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, Package } from "lucide-react";

export default function InventoryNavigation() {
  const pathname = usePathname();
  return <details key={pathname} open={pathname.startsWith("/inventory")} className="group px-5 py-1">
    <summary className={`flex cursor-pointer list-none items-center gap-2 rounded-md px-4 py-3 text-sm font-medium [&::-webkit-details-marker]:hidden ${pathname.startsWith("/inventory") ? "bg-primary-tertiary text-primary" : "text-[#737373]"}`}>
      <Package className="h-5 w-5" />Inventory<ChevronDown className="ml-auto h-4 w-4 transition-transform group-open:rotate-180" />
    </summary>
    <div className="ml-6 mt-1 space-y-1 border-l pl-3">
      {["items", "categories", "units"].map(view => <Link key={view} href={"/inventory/" + view} aria-current={pathname === "/inventory/" + view ? "page" : undefined}
        className={`block rounded-md px-3 py-2 text-sm capitalize ${pathname === "/inventory/" + view ? "bg-primary-tertiary font-medium text-primary" : "text-muted-foreground hover:bg-muted"}`}>{view}</Link>)}
    </div>
  </details>;
}
