"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Branch = { id: string; name: string; currency: string };
type CatalogType = "retail" | "food";
type CatalogRow = { catalog_type: "retail" | "food"; product_ref: string; option_ref: string; label: string; base_price: number; unit_price: string; is_available: boolean; stock_quantity: string };
type RecordValue = Record<string, unknown>;
type ExistingOverride = { catalog_type: string; product_ref: string; option_ref: string; unit_price: number | string | null; is_available: boolean; stock_quantity: number | null };

const valueString = (value: unknown) => typeof value === "string" || typeof value === "number" ? String(value) : "";
const retailOptionRef = (variant: RecordValue) => {
  const sku = typeof variant.sku === "string" ? variant.sku.trim().toLowerCase() : "";
  return sku ? `sku:${sku}` : `variant:${String(variant.size || variant.name || "").trim().toLowerCase()}|${String(variant.color || "").trim().toLowerCase()}`;
};
const foodRef = (kind: string, uid: string) => `${kind}:${uid.trim().toLowerCase()}`;

export default function BranchCatalogSettings({ branches, catalogType }: { branches: Branch[]; catalogType: CatalogType | null }) {
  const [branchId, setBranchId] = useState("");
  const [rows, setRows] = useState<CatalogRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const branch = branches.find(item => item.id === branchId);

  useEffect(() => { if (!branchId && branches[0]) setBranchId(branches[0].id); }, [branches, branchId]);

  useEffect(() => {
    if (!branchId || !catalogType) { setRows([]); return; }
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      try {
        const [catalogResponse, overrideResponse] = await Promise.all([
          fetch(catalogType === "retail" ? "/api/products?pageSize=100&_t=" + Date.now() : "/api/products/food?pageSize=100&_t=" + Date.now(), { cache: "no-store" }),
          fetch(`/api/branches/${encodeURIComponent(branchId)}/overrides`, { cache: "no-store" }),
        ]);
        const [catalogDataRaw, overrideDataRaw] = await Promise.all([catalogResponse.json(), overrideResponse.json()]);
        const catalogData = catalogDataRaw as { status?: string; message?: string; data?: { items?: RecordValue[] } | RecordValue[] };
        const overrideData = overrideDataRaw as { message?: string; data?: ExistingOverride[] };
        if (!catalogResponse.ok) throw new Error(catalogData.message || "Unable to load catalog");
        if (!overrideResponse.ok) throw new Error(overrideData.message || "Unable to load branch prices");
        const overrides = new Map<string, ExistingOverride>((overrideData.data || []).map((entry) => [`${entry.catalog_type}:${entry.product_ref}:${entry.option_ref}`, entry]));
        const products: RecordValue[] = catalogType === "retail"
          ? (catalogData.data && !Array.isArray(catalogData.data) ? catalogData.data.items || [] : [])
          : (Array.isArray(catalogData.data) ? catalogData.data : []);
        const next: CatalogRow[] = [];
        const add = (productRef: string, optionRef: string, label: string, basePrice: number) => {
          const override = overrides.get(`${catalogType}:${productRef}:${optionRef}`);
          next.push({ catalog_type: catalogType, product_ref: productRef, option_ref: optionRef, label, base_price: Number(basePrice || 0), unit_price: override?.unit_price == null ? "" : String(override.unit_price), is_available: override?.is_available ?? true, stock_quantity: override?.stock_quantity == null ? "" : String(override.stock_quantity) });
        };
        for (const product of products) {
          const id = valueString(catalogType === "retail" ? product.id : product.uid);
          const title = valueString(catalogType === "retail" ? product.product_name : product.name);
          if (catalogType === "retail") {
            add(id, "", title, Number(product.product_price || 0));
            const variants: RecordValue[] = Array.isArray(product.variants) ? product.variants as RecordValue[] : typeof product.variants === "string" ? JSON.parse(product.variants || "[]") as RecordValue[] : [];
            for (const variant of variants) add(id, retailOptionRef(variant), `${title} · ${[variant.size, variant.color].map(valueString).filter(Boolean).join(" / ") || valueString(variant.sku) || "Variant"}`, Number(variant.price ?? product.product_price ?? 0));
          } else {
            const portions = Array.isArray(product.portion) ? product.portion as RecordValue[] : [];
            const bundles = Array.isArray(product.bundleConfig) ? product.bundleConfig as RecordValue[] : [];
            const servings = Array.isArray(product.servingTypePricing) ? product.servingTypePricing as RecordValue[] : [];
            const groups = Array.isArray(product.addOnGroup) ? product.addOnGroup as RecordValue[] : [];
            for (const option of portions) add(id, foodRef("portion", valueString(option.uid)), `${title} · ${valueString(option.name)}`, Number(option.price || 0));
            for (const option of bundles) add(id, foodRef("bundle", valueString(option.uid)), `${title} · ${valueString(option.name)} bundle`, Number(option.price || 0));
            for (const option of servings) add(id, foodRef("serving", valueString(option.servingType)), `${title} · ${valueString(option.servingType)}`, Number(option.price || 0));
            for (const group of groups) for (const option of Array.isArray(group.addOnOptions) ? group.addOnOptions as RecordValue[] : []) add(id, foodRef("addon", valueString(option.uid)), `${title} · ${valueString(group.name) || "Add-on"} · ${valueString(option.name)}`, Number(option.price || 0));
          }
        }
        if (!cancelled) setRows(next);
      } catch (error) {
        if (!cancelled) { setRows([]); toast.error(error instanceof Error ? error.message : "Unable to load branch catalog"); }
      } finally { if (!cancelled) setLoading(false); }
    };
    void load();
    return () => { cancelled = true; };
  }, [branchId, catalogType]);

  const update = (index: number, change: Partial<CatalogRow>) => setRows(current => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...change } : row));
  const save = async () => {
    setSaving(true);
    try {
      const response = await fetch(`/api/branches/${encodeURIComponent(branchId)}/overrides`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ overrides: rows.map(({ catalog_type, product_ref, option_ref, unit_price, is_available, stock_quantity }) => ({ catalog_type, product_ref, option_ref, unit_price: unit_price === "" ? null : Number(unit_price), is_available, stock_quantity: stock_quantity === "" ? null : Number(stock_quantity) })) }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Unable to save branch catalog");
      toast.success("Branch catalog updated");
    } catch (error) { toast.error(error instanceof Error ? error.message : "Unable to save branch catalog"); }
    finally { setSaving(false); }
  };

  if (!branches.length || !catalogType) return null;
  return <section className="space-y-4 rounded-lg border p-5">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div><h3 className="text-sm font-semibold">Branch catalog</h3><p className="text-xs text-muted-foreground">Set this branch&apos;s {catalogType} prices, availability and stock. Blank values use the product defaults.</p></div>
      <div className="flex flex-wrap gap-2">
        <select aria-label="Branch" className="h-9 rounded-md border bg-background px-3 text-sm" value={branchId} onChange={event => setBranchId(event.target.value)}>{branches.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>
        <Button size="sm" disabled={saving || loading || !branch} onClick={save}>{saving ? "Saving..." : "Save catalog"}</Button>
      </div>
    </div>
    {branch && <p className="text-xs text-muted-foreground">Prices use this branch&apos;s {branch.currency} currency. Leave a price blank to use the product&apos;s standard price.</p>}
    {loading ? <div className="h-24 animate-pulse rounded bg-muted" /> : !rows.length ? <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">No products found for this catalog.</p> : <div className="max-h-[480px] overflow-auto rounded-md border"><table className="w-full min-w-[650px] text-left text-sm"><thead className="sticky top-0 bg-muted"><tr><th className="p-3">Product option</th><th className="p-3">Base price</th><th className="p-3">Branch price</th><th className="p-3">Stock</th><th className="p-3">Available</th></tr></thead><tbody className="divide-y">{rows.map((row, index) => <tr key={`${row.product_ref}:${row.option_ref}`}><td className="p-3 font-medium">{row.label}</td><td className="p-3">{row.base_price.toLocaleString()}</td><td className="p-3"><input aria-label={`${row.label} branch price`} type="number" min="0" step="0.01" className="h-8 w-28 rounded border bg-background px-2" value={row.unit_price} onChange={event => update(index, { unit_price: event.target.value })} placeholder="Default" /></td><td className="p-3"><input aria-label={`${row.label} branch stock`} type="number" min="0" step="1" className="h-8 w-24 rounded border bg-background px-2" value={row.stock_quantity} onChange={event => update(index, { stock_quantity: event.target.value })} placeholder="Default" /></td><td className="p-3"><input aria-label={`${row.label} available`} type="checkbox" checked={row.is_available} onChange={event => update(index, { is_available: event.target.checked })} className="h-4 w-4 accent-primary" /></td></tr>)}</tbody></table></div>}
  </section>;
}
