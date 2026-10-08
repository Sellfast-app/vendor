"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Download, Package, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import FoodInventoryImages from "@/components/food-inventory-images";
import ProductMarkupPreview from "@/components/product-markup-preview";
import { FoodInventory, InventoryCategory, InventoryItem, InventoryUnit, PLATFORM_UNITS, emptyInventory, inventoryKey, inventoryStatus, uniqueName, validateItem, parseInventory } from "@/lib/food-inventory";

type View = "items" | "categories" | "units";
type Draft = { id: string; name: string; description: string; quantity: string; unitId: string; price: string;
  secondPrice: string; hasSecondPrice: boolean; categoryId: string; images: string[];
  lowStock: boolean; threshold: string; allBranches: boolean; abbreviation: string };
const blank = (): Draft => ({ id: "", name: "", description: "", quantity: "0", unitId: "", price: "0",
  secondPrice: "", hasSecondPrice: false, categoryId: "", images: [], lowStock: false,
  threshold: "4", allBranches: false, abbreviation: "" });
const money = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(value);
const selectStyle = "h-10 w-full min-w-0 rounded-md border bg-background px-3 text-sm";
const singular = { items: "item", categories: "category", units: "unit" };

export default function FoodInventoryPage({ view }: { view: View }) {
  const [data, setData] = useState<FoodInventory>(emptyInventory);
  const [loaded, setLoaded] = useState(false);
  const [storageError, setStorageError] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState(25);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Draft>(blank);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(inventoryKey());
      if (raw) {
        setData(parseInventory(raw));
      }
    } catch { setStorageError(true); setError("Saved inventory could not be loaded. Existing records have not been overwritten."); }
    setLoaded(true);
    if (new URLSearchParams(window.location.search).get("create") === "1") {
      setOpen(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  const persist = (next: FoodInventory) => {
    if (storageError) throw new Error("Resolve the saved inventory error before making changes.");
    localStorage.setItem(inventoryKey(), JSON.stringify(next));
    setData(next);
  };
  const units = [...PLATFORM_UNITS, ...data.units];
  const entries: (InventoryItem | InventoryCategory | InventoryUnit)[] = view === "units" ? units : data[view];
  const filtered = entries.filter(entry => entry.name.toLowerCase().includes(search.toLowerCase()) &&
    (view !== "items" || ((!category || (entry as InventoryItem).categoryId === category) &&
      (!status || inventoryStatus(entry as InventoryItem) === status))));
  const pages = Math.max(1, Math.ceil(filtered.length / rows));
  const currentPage = Math.min(page, pages);
  const visible = filtered.slice((currentPage - 1) * rows, currentPage * rows);
  const change = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft(current => ({ ...current, [key]: value }));
  const close = () => { if (!busy) { setOpen(false); setError(""); } };
  const edit = (entry: InventoryItem | InventoryCategory | InventoryUnit) => {
    const item = entry as InventoryItem;
    setDraft({ ...blank(), ...entry, quantity: String(item.quantity ?? 0), price: String(item.price ?? 0),
      threshold: String(item.threshold ?? 4), secondPrice: String(item.secondPrice ?? ""), hasSecondPrice: item.secondPrice != null });
    setError(""); setOpen(true);
  };
  const save = () => {
    try {
      if (!uniqueName(draft.name, entries, draft.id)) throw new Error("A " + singular[view] + " with this name already exists.");
      const id = draft.id || crypto.randomUUID();
      const common = { id, name: draft.name.trim(), description: draft.description.trim(), allBranches: draft.allBranches };
      let record: InventoryItem | InventoryCategory | InventoryUnit;
      if (view === "items") {
        if (!draft.quantity.trim() || !draft.price.trim() || (draft.hasSecondPrice && !draft.secondPrice.trim()) || (draft.lowStock && !draft.threshold.trim())) throw new Error("Complete the required numeric fields.");
        record = { id, name: common.name, description: common.description, quantity: Number(draft.quantity),
          unitId: draft.unitId, price: Number(draft.price), secondPrice: draft.hasSecondPrice ? Number(draft.secondPrice) : null,
          categoryId: draft.categoryId, images: draft.images, lowStock: draft.lowStock, threshold: Number(draft.threshold) };
        validateItem(record, data);
      } else if (view === "units") {
        if (draft.abbreviation.length > 10) throw new Error("Abbreviation must not exceed 10 characters.");
        if (draft.abbreviation.trim() && units.some(unit => unit.id !== id && unit.abbreviation.toLowerCase() === draft.abbreviation.trim().toLowerCase())) throw new Error("This unit abbreviation already exists.");
        record = { ...common, abbreviation: draft.abbreviation.trim() };
      } else record = common;
      const next = { ...data, [view]: draft.id ? data[view].map(entry => entry.id === id ? record : entry) : [...data[view], record] };
      persist(next as FoodInventory); setOpen(false); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Could not save. Browser storage may be full; remove an image and retry."); }
  };
  const remove = () => {
    try {
      if (view !== "items" && data.items.some(item => view === "units" ? item.unitId === deleting : item.categoryId === deleting)) throw new Error("This " + singular[view] + " is used by an item. Update the item first.");
      persist({ ...data, [view]: data[view].filter(entry => entry.id !== deleting) });
      setDeleting(null); setError("");
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to delete."); }
  };
  const exportRecords = () => {
    const url = URL.createObjectURL(new Blob([JSON.stringify({ version: 1, mode: "preview", ...data }, null, 2)], { type: "application/json" }));
    const link = document.createElement("a"); link.href = url; link.download = "food-inventory-preview.json"; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return <main className="min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
    <header className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-xl font-semibold">{view === "items" ? "Inventory items" : view === "categories" ? "Categories" : "Units"}</h1>
      <div className="flex gap-2">
        <Button variant="outline" className="gap-2" disabled={!loaded || storageError} onClick={exportRecords}><Download className="h-4 w-4" />Export</Button>
        <Button className="gap-2" disabled={!loaded || storageError} onClick={() => { setDraft(blank()); setError(""); setOpen(true); }}><Plus className="h-4 w-4" />Add {singular[view]}</Button>
      </div>
    </header>
    {view === "items" && <div className="grid gap-3 sm:grid-cols-3">
      {[["Total value", money(data.items.reduce((sum, item) => sum + item.quantity * item.price, 0))], ["Total items", data.items.length], ["Total quantity", data.items.reduce((sum, item) => sum + item.quantity, 0)]].map(([label, value]) =>
        <div key={label} className="border-b py-4"><p className="text-sm text-muted-foreground">{label}</p><p className="mt-2 text-lg font-semibold">{value}</p></div>)}
    </div>}
    <div className="flex flex-col gap-3 sm:flex-row">
      <div className="relative sm:w-80"><Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input aria-label={"Search " + view} placeholder={"Search " + view + "..."} value={search} onChange={event => { setSearch(event.target.value); setPage(1); }} className="pl-9" /></div>
      {view === "items" && <>
        <select aria-label="Filter category" className={selectStyle + " sm:max-w-52"} value={category} onChange={event => { setCategory(event.target.value); setPage(1); }}><option value="">All categories</option>{data.categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        <select aria-label="Filter status" className={selectStyle + " sm:ml-auto sm:max-w-40"} value={status} onChange={event => { setStatus(event.target.value); setPage(1); }}><option value="">All statuses</option>{["In stock", "Low stock", "Out of stock"].map(status => <option key={status}>{status}</option>)}</select>
      </>}
    </div>
    {error && !open && !deleting && <p role="alert" className="text-sm text-destructive">{error}</p>}
    {!loaded ? <div className="h-72 animate-pulse rounded-lg bg-muted" aria-label="Loading inventory" /> :
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-xs uppercase text-muted-foreground"><tr>
            {(view === "items" ? ["Item", "Quantity", "Category", "Total price", "Status", ""] : view === "categories" ? ["Name", "Description", "Branches", ""] : ["Name", "Abbreviation", "Description", "Source", ""]).map((title, i) => <th key={i} className="whitespace-nowrap px-4 py-4 font-medium">{title}</th>)}
          </tr></thead>
          <tbody>{visible.map(entry => {
            const item = entry as InventoryItem; const unit = entry as InventoryUnit;
            return <tr key={entry.id} className="border-b">
              <td className="px-4 py-4"><div className="flex min-w-36 items-center gap-3">
                {view === "items" && (item.images[0] ?
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={item.images[0]} alt="" className="h-10 w-10 rounded-md object-cover" /> : <Package className="h-8 w-8 text-muted-foreground" />)}
                <span className="max-w-60 break-words font-medium">{entry.name}</span></div></td>
              {view === "items" ? <>
                <td className="whitespace-nowrap px-4 py-4">{item.quantity} {units.find(unit => unit.id === item.unitId)?.abbreviation || units.find(unit => unit.id === item.unitId)?.name}</td>
                <td className="px-4 py-4">{data.categories.find(category => category.id === item.categoryId)?.name || "No category"}</td>
                <td className="whitespace-nowrap px-4 py-4">{money(item.quantity * item.price)}</td>
                <td className="whitespace-nowrap px-4 py-4"><span className={inventoryStatus(item) === "In stock" ? "text-primary" : "text-amber-700"}>{inventoryStatus(item)}</span></td>
              </> : <>{view === "units" && <td className="px-4 py-4">{unit.abbreviation || "-"}</td>}
                <td className="max-w-72 break-words px-4 py-4 text-muted-foreground">{entry.description || "-"}</td>
                <td className="whitespace-nowrap px-4 py-4">{view === "units" ? unit.platform ? "Platform" : "Custom" : (entry as InventoryCategory).allBranches ? "All branches" : "Current branch"}</td></>}
              <td className="px-4 py-4">{!unit.platform && <div className="flex gap-1">
                <Button variant="ghost" size="icon" title="Edit" aria-label={"Edit " + entry.name} onClick={() => edit(entry)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" title="Delete" aria-label={"Delete " + entry.name} onClick={() => { setError(""); setDeleting(entry.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div>}</td>
            </tr>;
          })}</tbody>
        </table>
        {!visible.length && <div className="flex min-h-72 flex-col items-center justify-center gap-3"><Package className="h-6 w-6 text-muted-foreground" /><p className="font-medium">No {view === "items" ? "items here" : view + " found"}</p><Button variant="outline" onClick={() => { setSearch(""); setCategory(""); setStatus(""); }}>Clear filters</Button></div>}
      </div>}
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t pt-4 text-sm text-muted-foreground">
      <span>{filtered.length} {view}</span><div className="flex items-center gap-2">
        <label className="flex items-center gap-2">Rows<select className="rounded border bg-background p-2" value={rows} onChange={event => { setRows(Number(event.target.value)); setPage(1); }}>{[10, 25, 50].map(value => <option key={value}>{value}</option>)}</select></label>
        <Button variant="outline" size="icon" disabled={currentPage === 1} aria-label="Previous page" onClick={() => setPage(currentPage - 1)}><ChevronLeft className="h-4 w-4" /></Button>
        <span>{currentPage} of {pages}</span><Button variant="outline" size="icon" disabled={currentPage === pages} aria-label="Next page" onClick={() => setPage(currentPage + 1)}><ChevronRight className="h-4 w-4" /></Button>
      </div>
    </footer>
    <Sheet open={open} onOpenChange={value => { if (!value) close(); }}>
      <SheetContent className="w-full gap-0 sm:inset-y-4 sm:right-4 sm:h-[calc(100dvh-2rem)] sm:w-[min(580px,calc(100vw-2rem))] sm:max-w-none sm:rounded-lg">
        <SheetHeader className="shrink-0 border-b bg-muted/20 p-5 sm:p-6"><SheetTitle>{draft.id ? "Edit" : view === "items" ? "Add" : "Create"} {singular[view]}</SheetTitle><SheetDescription className="sr-only">{singular[view]} details</SheetDescription></SheetHeader>
        <form className="flex min-h-0 flex-1 flex-col" onSubmit={event => { event.preventDefault(); if (!busy) save(); }}>
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {view === "items" && <FoodInventoryImages images={draft.images} onChange={images => change("images", images)} onBusy={setBusy} />}
            <label className="block space-y-2 text-sm text-muted-foreground">Name <span className="text-destructive">*</span><Input required maxLength={120} value={draft.name} onChange={event => change("name", event.target.value)} placeholder={view === "items" ? "e.g. Jasmine rice" : view === "categories" ? "e.g. Grains, Spices, Beverages" : "e.g. Bag, Crate, Basket"} /></label>
            {view === "units" && <label className="block space-y-2 text-sm text-muted-foreground">Abbreviation<Input maxLength={10} value={draft.abbreviation} onChange={event => change("abbreviation", event.target.value)} placeholder="e.g. kg, L, pcs (max 10 chars)" /></label>}
            <label className="block space-y-2 text-sm text-muted-foreground"><span className="flex justify-between">Description{view === "items" && <span>{draft.description.length}/200</span>}</span><Textarea className="min-h-24 resize-none" maxLength={200} value={draft.description} onChange={event => change("description", event.target.value)} placeholder="Optional short description..." /></label>
            {view === "items" ? <>
              <div className="grid grid-cols-2 gap-4">
                <label className="space-y-2 text-sm text-muted-foreground">Quantity <span className="text-destructive">*</span><Input required type="number" min="0" step="any" value={draft.quantity} onChange={event => change("quantity", event.target.value)} /></label>
                <label className="space-y-2 text-sm text-muted-foreground">Unit <span className="text-destructive">*</span><select required className={selectStyle} value={draft.unitId} onChange={event => change("unitId", event.target.value)}><option value="">Select unit</option>
                  <optgroup label="Platform units">{PLATFORM_UNITS.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</optgroup>
                  {data.units.length > 0 && <optgroup label="Custom units">{data.units.map(unit => <option key={unit.id} value={unit.id}>{unit.name}</option>)}</optgroup>}</select></label>
                <label className="space-y-2 text-sm text-muted-foreground">Price 1 (₦) <span className="text-destructive">*</span><Input required type="number" min="0" step="0.01" value={draft.price} onChange={event => change("price", event.target.value)} /></label>
                <label className="space-y-2 text-sm text-muted-foreground">Total price<Input readOnly value={money((Number(draft.price) || 0) * (Number(draft.quantity) || 0))} className="bg-muted/30" /></label>
              </div>
              <ProductMarkupPreview basePrice={draft.price} />
              {draft.hasSecondPrice && <label className="block space-y-2 text-sm text-muted-foreground">Price 2 (₦)<Input required type="number" min="0" step="0.01" value={draft.secondPrice} onChange={event => change("secondPrice", event.target.value)} /></label>}
              <Button type="button" variant="link" className="h-auto p-0" onClick={() => change("hasSecondPrice", !draft.hasSecondPrice)}>{draft.hasSecondPrice ? "Remove second price" : "Add second price"}</Button>
              <label className="block space-y-2 text-sm text-muted-foreground">Category<select className={selectStyle} value={draft.categoryId} onChange={event => change("categoryId", event.target.value)}><option value="">No category</option>{data.categories.map(category => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
              <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
                <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.lowStock} onChange={event => change("lowStock", event.target.checked)} className="h-4 w-4 accent-primary" />Enable low-stock alert</label>
                {draft.lowStock && <label className="block space-y-2 text-sm text-muted-foreground">Low-stock level<Input type="number" required min="0" step="any" value={draft.threshold} onChange={event => change("threshold", event.target.value)} /></label>}
              </div>
            </> : <div className="rounded-lg border bg-muted/20 p-4"><label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={draft.allBranches} onChange={event => change("allBranches", event.target.checked)} className="h-4 w-4 accent-primary" />Apply to all branches</label></div>}
            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
          </div>
          <div className="flex shrink-0 justify-end gap-2 border-t p-4"><Button type="button" variant="outline" disabled={busy} onClick={close}>Cancel</Button><Button type="submit" disabled={busy || storageError}>{draft.id ? "Save changes" : view === "items" ? "Create item" : "Create"}</Button></div>
        </form>
      </SheetContent>
    </Sheet>
    <Dialog open={!!deleting} onOpenChange={value => { if (!value) { setDeleting(null); setError(""); } }}>
      <DialogContent><DialogHeader><DialogTitle>Delete {singular[view]}?</DialogTitle><DialogDescription>This removes the record from this inventory preview. Referenced units and categories cannot be deleted.</DialogDescription></DialogHeader>
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setDeleting(null); setError(""); }}>Cancel</Button><Button variant="destructive" onClick={remove}>Delete</Button></div>
      </DialogContent>
    </Dialog>
  </main>;
}
