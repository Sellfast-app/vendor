"use client";

import { useEffect, useState } from "react";
import { BillingPreview, effectiveModel, listingPrice, readBillingPreview } from "@/lib/billing-preview";

export default function ProductMarkupPreview({ basePrice }: { basePrice: string }) {
  const [state, setState] = useState<BillingPreview | null>(null);
  useEffect(() => {
    const load = () => { try { setState(readBillingPreview()); } catch { setState(null); } };
    load();
    window.addEventListener("swiftree-billing-preview", load);
    window.addEventListener("storage", load);
    const timer = setInterval(load, 30000);
    return () => {
      window.removeEventListener("swiftree-billing-preview", load);
      window.removeEventListener("storage", load);
      clearInterval(timer);
    };
  }, []);
  if (!state || effectiveModel(state) !== "markup" || !basePrice.trim() || !Number.isFinite(Number(basePrice)) || Number(basePrice) < 0) return null;
  const price = listingPrice(Number(basePrice), state);
  return <p className="mt-2 text-xs text-muted-foreground">Preview: ₦{price.base.toLocaleString()} base + ₦{price.markup.toLocaleString()} markup = <span className="font-medium text-foreground">₦{price.total.toLocaleString()}</span> customer price.</p>;
}
