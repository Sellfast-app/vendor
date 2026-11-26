"use client";

import { useEffect, useState } from "react";
import { LoaderCircle, Store } from "lucide-react";
import { Button } from "@/components/ui/button";

type StoreSettingsData = {
  store_name?: string;
  business_type?: string;
  store_description?: string;
  store_url?: string;
  logo?: string | null;
  banner?: string | null;
  banner_style?: string | null;
  vendor_email?: string;
  vendor_whatsapp_number?: string;
  metadata?: Record<string, unknown>;
  enabled_fulfillment_modes?: string[];
  availability?: Array<{ day?: string; openTime?: string; closeTime?: string; isOpen?: boolean }>;
};

function display(value: unknown) {
  return typeof value === "string" && value.trim() ? value : "Not provided";
}

export default function StaffStoreSettings() {
  const [store, setStore] = useState<StoreSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadSettings() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/staff/store-settings", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || result.status !== "success" || !result.data) {
        throw new Error(result.message || "Could not load this store's settings.");
      }
      setStore(result.data);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load this store's settings.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { void loadSettings(); }, []);

  if (loading) {
    return <div className="flex min-h-40 items-center justify-center text-sm text-muted-foreground"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Loading store settings</div>;
  }
  if (error || !store) {
    return <div className="rounded-md border border-dashed p-6 text-sm"><p role="alert" className="text-destructive">{error || "Store settings are unavailable."}</p><Button variant="outline" className="mt-3" onClick={() => void loadSettings()}>Retry</Button></div>;
  }

  const metadata = store.metadata || {};
  const brandColors = metadata.brand_color && typeof metadata.brand_color === "object" ? metadata.brand_color as Record<string, unknown> : {};
  const announcement = metadata.storefront_announcement && typeof metadata.storefront_announcement === "object" ? metadata.storefront_announcement as Record<string, unknown> : {};
  const carousel = Array.isArray(metadata.storefront_carousel_slides) ? metadata.storefront_carousel_slides as Array<Record<string, unknown>> : [];
  const address = [metadata.address, metadata.city, metadata.state, metadata.country].filter(value => typeof value === "string" && value.trim()).join(", ");
  const hours = Array.isArray(store.availability) ? store.availability.filter(entry => entry.isOpen !== false) : [];
  const items: Array<[string, string]> = [
    ["Store name", display(store.store_name)],
    ["Business type", display(store.business_type)],
    ["About the store", display(store.store_description)],
    ["Store email", display(store.vendor_email)],
    ["WhatsApp number", display(store.vendor_whatsapp_number)],
    ["Store address", address || "Not provided"],
    ["Storefront URL", display(store.store_url)],
    ["Delivery methods", store.enabled_fulfillment_modes?.length ? store.enabled_fulfillment_modes.join(", ") : "Not configured"],
  ];

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-1 py-4">
      <header className="flex items-center gap-3 border-b pb-4">
        <Store className="h-5 w-5 text-primary" />
        <div><h2 className="text-base font-semibold">Store settings</h2><p className="text-sm text-muted-foreground">Settings for the store you have access to.</p></div>
      </header>
      <dl className="grid gap-x-8 sm:grid-cols-2">
        {items.map(([label, value]) => <div key={label} className="border-b py-4"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium">{value}</dd></div>)}
      </dl>
      <section>
        <h3 className="text-sm font-semibold">Storefront appearance</h3>
        <dl className="mt-2 grid gap-x-8 sm:grid-cols-2">
          {[["Logo", store.logo], ["Banner", store.banner], ["Footer image", metadata.storefront_footer_image], ["Banner layout", store.banner_style || metadata.storefront_banner_style]].map(([label, value]) => <div key={String(label)} className="border-b py-3"><dt className="text-xs text-muted-foreground">{String(label)}</dt><dd className="mt-1 break-all text-sm">{display(value)}</dd></div>)}
          {[["Primary", brandColors.primary], ["Secondary", brandColors.secondary], ["Accent", brandColors.accent], ["Text", brandColors.text]].map(([label, value]) => <div key={`color-${String(label)}`} className="flex items-center gap-2 border-b py-3"><span className="h-5 w-5 shrink-0 rounded border" style={typeof value === "string" ? { backgroundColor: value } : undefined} /><div><dt className="text-xs text-muted-foreground">{String(label)} color</dt><dd className="text-sm">{display(value)}</dd></div></div>)}
        </dl>
        <div className="mt-4 border-b py-3"><h4 className="text-xs text-muted-foreground">Announcement strip</h4><p className="mt-1 text-sm">{announcement.enabled ? display(announcement.message) : "Disabled"}</p></div>
        <div className="mt-4">
          <h4 className="text-xs text-muted-foreground">Carousel slides</h4>
          {carousel.length ? <ul className="mt-2 divide-y border-y">{carousel.map((slide, index) => <li key={`${String(slide.id || "slide")}-${index}`} className="py-3"><p className="text-sm font-medium">{display(slide.title)}</p><p className="mt-1 text-sm text-muted-foreground">{display(slide.description)}</p><p className="mt-1 break-all text-xs text-muted-foreground">{display(slide.image || slide.image_url)}</p></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No carousel slides configured.</p>}
        </div>
      </section>
      <section>
        <h3 className="text-sm font-semibold">Opening hours</h3>
        {hours.length ? <ul className="mt-2 divide-y border-y">{hours.map((entry, index) => <li key={`${entry.day || "day"}-${index}`} className="flex justify-between gap-4 py-3 text-sm"><span>{display(entry.day)}</span><span className="text-muted-foreground">{display(entry.openTime)} - {display(entry.closeTime)}</span></li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No opening hours configured.</p>}
      </section>
    </section>
  );
}
