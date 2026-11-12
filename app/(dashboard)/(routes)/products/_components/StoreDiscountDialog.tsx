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
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [campaignResponse, firstProductsResponse] = await Promise.all([
          fetch("/api/products/discount", { cache: "no-store" }),
          fetch("/api/products?page=1&pageSize=100", { cache: "no-store" }),
        ]);
        const [campaignResult, firstProducts] = await Promise.all([campaignResponse.json(), firstProductsResponse.json()]);
        if (!campaignResponse.ok || !firstProductsResponse.ok) throw new Error(campaignResult.message || firstProducts.message || "Could not load discounts.");
        let allItems: ProductChoice[] = firstProducts.data?.items || [];
        const pages = Number(firstProducts.data?.totalPages || 1);
        if (pages > 1) {
          const remaining = await Promise.all(Array.from({ length: pages - 1 }, (_, index) =>
            fetch(`/api/products?page=${index + 2}&pageSize=100`, { cache: "no-store" }).then(response => response.json()),
          ));
          allItems = allItems.concat(...remaining.map(result => result.data?.items || []));
        }
        if (cancelled) return;
        setProducts(allItems);
        const current: Campaign | null = campaignResult.data || null;
        setScope(current?.applies_to_all === false ? "selected" : "all");
        setDiscountType(current?.discount_type || "fixed");
        setValue(current ? String(current.discount_value) : "");
        setSelected(current?.product_ids || []);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Could not load discount settings.");
      } finally {
        if (!cancelled) setLoading(false);
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
        <DialogTitle>Store discount</DialogTitle>
        <DialogDescription>Apply one discount to all products or selected products. A product-specific discount takes precedence.</DialogDescription>
      </DialogHeader>
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5"><Label>Discount type</Label><Select value={discountType} onValueChange={(next: "fixed" | "percentage") => setDiscountType(next)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="fixed">Amount off ({currency})</SelectItem><SelectItem value="percentage">Percentage off</SelectItem></SelectContent></Select></div>
          <div className="space-y-1.5"><Label>{discountType === "fixed" ? `Amount off (${currency})` : "Discount percent"}</Label><Input type="number" min="0.01" max={discountType === "percentage" ? 100 : undefined} value={value} onChange={event => setValue(event.target.value)} placeholder={discountType === "fixed" ? "e.g. 1000" : "e.g. 10"} /></div>
        </div>
        <div className="space-y-1.5"><Label>Applies to</Label><Select value={scope} onValueChange={(next: "all" | "selected") => setScope(next)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All products</SelectItem><SelectItem value="selected">Selected products</SelectItem></SelectContent></Select></div>
        {scope === "selected" && <div className="max-h-64 space-y-2 overflow-y-auto rounded-md border p-2">
          {loading ? <p className="p-2 text-sm text-muted-foreground">Loading products...</p> : products.length ? products.map(product => <label key={product.id} className="flex cursor-pointer items-center gap-3 rounded px-2 py-2 hover:bg-muted">
            <Checkbox checked={selected.includes(product.id)} onCheckedChange={checked => setSelected(current => checked ? [...new Set([...current, product.id])] : current.filter(id => id !== product.id))} />
            <span className="min-w-0 flex-1 truncate text-sm">{product.product_name}</span>
            <span className="text-xs text-muted-foreground">{Number(product.product_price || 0).toLocaleString()}</span>
          </label>) : <p className="p-2 text-sm text-muted-foreground">No products found.</p>}
        </div>}
        <div className="flex justify-between border-t pt-3">
          <Button type="button" variant="ghost" onClick={clear} disabled={saving || loading}><Trash2 className="mr-2 h-4 w-4" />Remove discount</Button>
          <Button type="button" onClick={save} disabled={saving || loading}><Percent className="mr-2 h-4 w-4" />{saving ? "Saving..." : "Save discount"}</Button>
        </div>
      </div>
    </DialogContent>
  </Dialog>;
}
