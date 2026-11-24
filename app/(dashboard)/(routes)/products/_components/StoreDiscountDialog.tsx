"use client";

import { useEffect, useState } from "react";
import { Percent, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type ProductChoice = { id: string; product_name: string; product_price: number; product_type: string };
type Campaign = { discount_type: "fixed" | "percentage"; discount_value: number; applies_to_all: boolean; product_ids: string[] };

export function StoreDiscountDialog({ open, onOpenChange, onSaved, currency = "NGN" }: { open: boolean; onOpenChange: (open: boolean) => void; onSaved?: () => void; currency?: string }) {
  const [products, setProducts] = useState<ProductChoice[]>([]);
  const [scope, setScope] = useState<"all" | "selected">("all");
  const [discountType, setDiscountType] = useState<"fixed" | "percentage">("fixed");
  const [value, setValue] = useState("");
  const [selected, setSelected] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [loadingDiscount, setLoadingDiscount] = useState(false);
  const [productsError, setProductsError] = useState("");
  const [discountError, setDiscountError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoadingProducts(true);
      setLoadingDiscount(true);
      setProductsError("");
      setDiscountError("");
      try {
        const fetchProductPage = async (page: number) => {
          const response = await fetch(`/api/products?page=${page}&pageSize=100&_t=${Date.now()}`, { cache: "no-store" });
          const result = await response.json();
          if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not load the store product list.");
          return result.data as { items?: ProductChoice[]; totalPages?: number };
        };

        const firstPage = await fetchProductPage(1);
        let allItems: ProductChoice[] = Array.isArray(firstPage.items) ? firstPage.items : [];
        const pages = Math.max(1, Number(firstPage.totalPages) || 1);
        for (let page = 2; page <= pages; page += 1) {
          const result = await fetchProductPage(page);
          if (Array.isArray(result.items)) allItems = allItems.concat(result.items);
        }
        if (cancelled) return;
        setProducts(allItems);
      } catch (error) {
        if (!cancelled) setProductsError(error instanceof Error ? error.message : "Could not load the store product list.");
      } finally {
        if (!cancelled) setLoadingProducts(false);
      }

      try {
        const response = await fetch("/api/products/discount", { cache: "no-store" });
        const result = await response.json();
        if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not load current discount settings.");
        if (cancelled) return;
        const current: Campaign | null = result.data || null;
        setScope(current?.applies_to_all === false ? "selected" : "all");
        setDiscountType(current?.discount_type || "fixed");
        setValue(current ? String(current.discount_value) : "");
        setSelected(current?.product_ids || []);
      } catch (error) {
        if (!cancelled) setDiscountError(error instanceof Error ? error.message : "Could not load current discount settings.");
      } finally {
        if (!cancelled) setLoadingDiscount(false);
      }
    };
    void load();
    return () => { cancelled = true; };
  }, [open]);

  const save = async () => {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue) || numericValue <= 0 || (discountType === "percentage" && numericValue > 100)) {
      toast.error(discountType === "percentage" ? "Enter a percentage from 0 to 100." : "Enter a discount greater than zero.");
      return;
    }
    if (scope === "selected" && selected.length === 0) return toast.error("Select at least one product.");
    setSaving(true);
    try {
      const response = await fetch("/api/products/discount", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discount_type: discountType, discount_value: numericValue, applies_to_all: scope === "all", product_ids: scope === "all" ? [] : selected }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not save discount.");
      toast.success("Store discount updated.");
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save discount.");
    } finally {
      setSaving(false);
    }
  };

  const visibleProducts = products.filter(product =>
    product.product_name.toLowerCase().includes(search.trim().toLowerCase()),
  );

  const clear = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/products/discount", { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not remove discount.");
      setValue("");
      setSelected([]);
      toast.success("Store discount removed.");
      onSaved?.();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove discount.");
    } finally {
      setSaving(false);
    }
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
      <DialogHeader>
        <DialogTitle>Discounts</DialogTitle>
        <DialogDescription>Use the same discount rules for product prices and store-wide offers. Each item receives one discount only: a product discount takes precedence over the store-wide rule. Coupon codes apply separately at checkout.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Discount type</Label><Select value={discountType} onValueChange={(next: "fixed" | "percentage") => setDiscountType(next)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fixed">Amount off ({currency})</SelectItem><SelectItem value="percentage">Percentage off</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>{discountType === "fixed" ? `Amount off (${currency})` : "Discount percent"}</Label><Input type="number" min="0.01" max={discountType === "percentage" ? 100 : undefined} value={value} onChange={event => setValue(event.target.value)} placeholder={discountType === "fixed" ? "e.g. 1000" : "e.g. 10"} /></div>
        </div>
        <div className="space-y-1.5"><Label>Applies to</Label><Select value={scope} onValueChange={(next: "all" | "selected") => setScope(next)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All products</SelectItem><SelectItem value="selected">Selected products</SelectItem></SelectContent></Select></div>
        {scope === "selected" && <div className="space-y-2 rounded-md border p-3">
          <div className="flex items-center justify-between gap-3">
            <Label htmlFor="discount-product-search">Select products ({selected.length} selected)</Label>
            <Button type="button" variant="ghost" size="sm" onClick={() => setSelected(current => {
              const visibleIds = new Set(visibleProducts.map(product => product.id));
              const allVisibleSelected = visibleProducts.every(product => current.includes(product.id));
              return allVisibleSelected
                ? current.filter(id => !visibleIds.has(id))
                : [...new Set([...current, ...visibleIds])];
            })} disabled={loadingProducts || visibleProducts.length === 0}>
              {visibleProducts.length > 0 && visibleProducts.every(product => selected.includes(product.id)) ? "Clear visible" : "Select visible"}
            </Button>
          </div>
          <Input id="discount-product-search" value={search} onChange={event => setSearch(event.target.value)} placeholder="Search this store's products" />
          <div className="max-h-64 space-y-1 overflow-y-auto">
            {loadingProducts ? <p className="p-2 text-sm text-muted-foreground">Loading products...</p>
              : productsError ? <p className="p-2 text-sm text-destructive">{productsError}</p>
              : visibleProducts.length ? visibleProducts.map(product => <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-muted">
                <Checkbox checked={selected.includes(product.id)} onCheckedChange={checked => setSelected(current => checked ? [...new Set([...current, product.id])] : current.filter(id => id !== product.id))} />
                <span className="min-w-0 flex-1 truncate text-sm">{product.product_name}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{currency} {Number(product.product_price || 0).toLocaleString()}</span>
              </label>)
              : products.length ? <p className="p-2 text-sm text-muted-foreground">No products match your search.</p>
              : <p className="p-2 text-sm text-muted-foreground">This store has no products yet.</p>}
          </div>
        </div>}
        {discountError && <p className="text-xs text-destructive">Could not load the saved discount: {discountError}. Retry by closing and reopening this dialog before saving.</p>}
        <div className="flex justify-between border-t pt-3">
          <Button type="button" variant="ghost" onClick={clear} disabled={saving || loadingProducts || loadingDiscount || Boolean(discountError)}><Trash2 className="mr-2 h-4 w-4" />Remove discount</Button>
          <Button type="button" onClick={save} disabled={saving || loadingProducts || loadingDiscount || Boolean(discountError)}><Percent className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save discount"}</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
