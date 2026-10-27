"use client";

import { useEffect, useMemo, useState, type ChangeEvent } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Archive, Box, Check, ImagePlus, Loader2, PackagePlus, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ProductMarkupPreview from "@/components/product-markup-preview";
import { getCurrencySymbol } from "@/lib/v2-currency";

type ProductKind = "regular" | "variants" | "bundle";
type RetailProduct = {
  id: string;
  productName: string;
  sku: string;
  stock: number;
  sales: number;
  thumbnail: string | string[];
  productType?: string;
};
type RetailProductVariant = {
  id: string;
  size: string | number;
  color: string;
  price: number;
  quantity: number;
};
type CreatedRetailProduct = {
  id: string;
  sku: string;
  productName: string;
  description: string;
  stock: number;
  remanent: number;
  sales: number;
  status: string;
  createdAt: string;
  thumbnail: string;
  variants: RetailProductVariant[];
  weight: number;
  productType?: string;
};
type VariantDraft = {
  id: string;
  name: string;
  size: string;
  color: string;
  sku: string;
  price: string;
  quantity: string;
};
type BundleEntry = { productId: string; quantity: string };

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddProduct: (product: CreatedRetailProduct) => void;
  availableProducts?: RetailProduct[];
  currency?: string;
}

const PRODUCT_TYPES: { id: ProductKind; title: string; description: string; icon: typeof Archive }[] = [
  { id: "regular", title: "Regular product", description: "A product without variations.", icon: Archive },
  { id: "variants", title: "Product with variants", description: "Different sizes, colours, or options.", icon: Box },
  { id: "bundle", title: "Product bundle", description: "A group of products sold together.", icon: PackagePlus },
];

const UNIT_OPTIONS = ["pc", "pair", "set", "pack", "box", "kg", "g", "litre", "ml"];
const statusFromApi: Record<string, string> = {
  ready: "Ready Stock",
  "made-to-order": "Made-to-order",
  "out-of-stock": "Out of Stock",
};

const newVariant = (): VariantDraft => ({
  id: crypto.randomUUID(), name: "", size: "", color: "", sku: "", price: "", quantity: "",
});

export default function AddProductModal({ isOpen, onClose, onAddProduct, availableProducts = [], currency = "NGN" }: AddProductModalProps) {
  const currencySymbol = getCurrencySymbol(currency);
  const [kind, setKind] = useState<ProductKind>("regular");
  const [name, setName] = useState("");
  const [location, setLocation] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [collection, setCollection] = useState("");
  const [sizeChartEnabled, setSizeChartEnabled] = useState(false);
  const [sizeChartUrl, setSizeChartUrl] = useState("");
  const [price, setPrice] = useState("");
  const [costPrice, setCostPrice] = useState("");
  const [compareAtPrice, setCompareAtPrice] = useState("");
  const [stock, setStock] = useState("");
  const [status, setStatus] = useState("ready");
  const [unit, setUnit] = useState("pc");
  const [barcode, setBarcode] = useState("");
  const [weight, setWeight] = useState("1");
  const [productionFrom, setProductionFrom] = useState("2");
  const [productionTo, setProductionTo] = useState("5");
  const [orderQuantityEnabled, setOrderQuantityEnabled] = useState(false);
  const [minimumOrder, setMinimumOrder] = useState("1");
  const [maximumOrder, setMaximumOrder] = useState("");
  const [variants, setVariants] = useState<VariantDraft[]>([newVariant()]);
  const [bundleEntries, setBundleEntries] = useState<BundleEntry[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const previews = useMemo(() => images.map(file => URL.createObjectURL(file)), [images]);
  useEffect(() => () => previews.forEach(URL.revokeObjectURL), [previews]);

  const bundleCandidates = availableProducts.filter(product => product.productType !== "bundle");
  const selectedProducts = bundleCandidates.filter(product => bundleEntries.some(entry => entry.productId === product.id));
  const bundleStockLimit = selectedProducts.length
    ? Math.min(...selectedProducts.map(product => {
        const entry = bundleEntries.find(item => item.productId === product.id);
        return Math.floor(product.stock / Math.max(1, Number(entry?.quantity || 1)));
      }))
    : 0;

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isSaving) onClose();
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSaving, onClose]);

  const reset = () => {
    setKind("regular"); setName(""); setLocation(""); setShortDescription(""); setDescription("");
    setCollection(""); setSizeChartEnabled(false); setSizeChartUrl(""); setPrice(""); setCostPrice("");
    setCompareAtPrice(""); setStock(""); setStatus("ready"); setUnit("pc"); setBarcode("");
    setWeight("1"); setProductionFrom("2"); setProductionTo("5"); setOrderQuantityEnabled(false);
    setMinimumOrder("1"); setMaximumOrder(""); setVariants([newVariant()]); setBundleEntries([]); setImages([]);
  };

  const handleImages = (event: ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(event.target.files || []);
    const valid = incoming.filter(file => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);
    if (valid.length !== incoming.length) toast.error("Use image files up to 5 MB each.");
    setImages(current => [...current, ...valid].slice(0, 5));
    event.target.value = "";
  };

  const updateVariant = (id: string, key: keyof VariantDraft, value: string) => {
    setVariants(current => current.map(variant => variant.id === id ? { ...variant, [key]: value } : variant));
  };

  const updateBundleEntry = (productId: string, quantity: string) => {
    setBundleEntries(current => current.map(entry => entry.productId === productId ? { ...entry, quantity } : entry));
  };

  const addBundleProduct = (productId: string) => {
    if (bundleEntries.some(entry => entry.productId === productId)) return;
    if (bundleEntries.length >= 20) return toast.error("A bundle can include up to 20 products.");
    setBundleEntries(current => [...current, { productId, quantity: "1" }]);
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Product name is required.");
    if (!price || Number(price) < 0) return toast.error("Enter a valid selling price.");
    if (kind !== "bundle" && (!weight || Number(weight) <= 0)) return toast.error("Enter a valid product weight.");
    if (!stock || Number(stock) < 0) return toast.error("Enter a valid stock quantity.");
    if (kind === "bundle" && bundleEntries.length === 0) return toast.error("Select at least one product for this bundle.");
    if (kind === "bundle" && Number(stock) > bundleStockLimit) return toast.error(`Bundle stock cannot exceed ${bundleStockLimit} based on selected product quantities.`);
    if (kind === "variants" && variants.some(variant => !variant.name.trim() || !variant.quantity || Number(variant.quantity) < 0)) {
      return toast.error("Add a name and stock quantity for every variant.");
    }

    setIsSaving(true);
    try {
      const storeId = document.cookie.split(";").map(value => value.trim()).find(value => value.startsWith("store_id="))?.split("=")[1];
      if (!storeId) throw new Error("Store ID not found. Please sign in again.");

      const formData = new FormData();
      formData.append("name", name.trim());
      formData.append("description", description);
      formData.append("short_description", shortDescription);
      formData.append("price", price);
      formData.append("type", kind === "regular" ? "single" : kind === "variants" ? "variant" : "bundle");
      formData.append("status", status);
      formData.append("weight", kind === "bundle" ? "1" : weight);
      formData.append("quantity", kind === "variants" ? variants.reduce((sum, variant) => sum + Number(variant.quantity || 0), 0).toString() : stock);
      formData.append("est_prod_days_from", productionFrom);
      formData.append("est_prod_days_to", productionTo);
      formData.append("store_id", storeId);
      formData.append("cost_price", costPrice);
      formData.append("compare_at_price", compareAtPrice);
      formData.append("unit", unit);
      formData.append("barcode", barcode);
      formData.append("collection", collection);
      formData.append("size_chart_url", sizeChartEnabled ? sizeChartUrl : "");
      formData.append("min_order_quantity", orderQuantityEnabled ? minimumOrder : "");
      formData.append("max_order_quantity", orderQuantityEnabled ? maximumOrder : "");
      formData.append("location", location);
      formData.append("variants", JSON.stringify(kind === "variants" ? variants.map(variant => ({
        size: variant.size || variant.name,
        name: variant.name,
        color: variant.color,
        sku: variant.sku,
        quantity: Number(variant.quantity),
        ...(variant.price ? { price: Number(variant.price) } : {}),
      })) : []));
      formData.append("bundle_items", JSON.stringify(kind === "bundle" ? bundleEntries.map(entry => ({
        product_id: entry.productId,
        quantity: Number(entry.quantity),
      })) : []));
      images.forEach((file, index) => formData.append("files", file, `product-image-${index}.${file.name.split(".").pop() || "jpg"}`));

      const response = await fetch("/api/products", { method: "POST", body: formData });
      const result = await response.json();
      if (!response.ok || result?.status !== "success" || !result.data) {
        throw new Error(result?.message || "Unable to create product.");
      }

      const product = result.data;
      const returnedVariants = Array.isArray(product.variants) ? product.variants : [];
      onAddProduct({
        id: String(product.id),
        sku: String(product.product_sku || ""),
        productName: String(product.product_name || name),
        description: String(product.product_description || description || shortDescription),
        stock: Number(product.product_quantity || 0),
        remanent: Number(product.product_quantity || 0),
        sales: Number(product.product_price ?? product.price ?? price),
        status: statusFromApi[product.product_status] || product.product_status || "Ready Stock",
        createdAt: product.created_at || new Date().toISOString(),
        thumbnail: product.product_images?.[0] || "",
        variants: returnedVariants.map((variant: Record<string, unknown>, index: number) => ({
          id: String(variant.id || variant.uid || `${product.id}-variant-${index}`),
          size: String(variant.size || variant.name || ""),
          color: String(variant.color || ""),
          price: Number(variant.price || product.product_price || price),
          quantity: Number(variant.quantity || 0),
        })),
        weight: Number(product.product_weight || weight),
        productType: String(product.product_type || (kind === "bundle" ? "bundle" : kind === "variants" ? "variant" : "single")),
      });
      toast.success("Product created.");
      reset();
      onClose();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create product.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const section = (title: string, children: React.ReactNode) => (
    <section className="border-b last:border-b-0">
      <h3 className="bg-muted/60 px-4 py-3 text-sm font-semibold text-foreground">{title}</h3>
      <div className="grid gap-4 p-4 sm:grid-cols-2">{children}</div>
    </section>
  );

  const field = (label: string, child: React.ReactNode, optional = false) => (
    <div className="min-w-0 space-y-1.5">
      <Label className="text-xs text-muted-foreground">{label}{optional ? " (Optional)" : <span className="text-destructive"> *</span>}</Label>
      {child}
    </div>
  );

  const imagePicker = (
    <div className="sm:col-span-2">
      <div className="mb-2 flex items-center justify-between gap-3">
        <div>
          <Label className="text-xs font-medium">Product images <span className="text-muted-foreground">(Optional)</span></Label>
          <p className="mt-1 text-xs text-muted-foreground">Recommended 930 x 1163 px. Up to 5 images, 5 MB each.</p>
        </div>
        <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-xs font-medium hover:bg-muted">
          <ImagePlus className="h-4 w-4" /> Add images
          <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImages} />
        </label>
      </div>
      <div className="grid min-h-28 grid-cols-3 gap-2 rounded-md border border-dashed bg-muted/30 p-3 sm:grid-cols-5">
        {previews.map((src, index) => (
          <div key={`${src}-${index}`} className="relative aspect-square overflow-hidden rounded border bg-background">
            <Image src={src} alt={`Product image ${index + 1}`} fill unoptimized className="object-cover" />
            <button type="button" aria-label="Remove image" className="absolute right-1 top-1 rounded-full bg-background p-1 shadow" onClick={() => setImages(current => current.filter((_, imageIndex) => imageIndex !== index))}>
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        {images.length === 0 && (
          <label className="col-span-3 flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1 text-xs text-muted-foreground sm:col-span-5">
            <ImagePlus className="h-5 w-5" /> Drop images here or browse
            <input type="file" accept="image/*" multiple className="sr-only" onChange={handleImages} />
          </label>
        )}
      </div>
    </div>
  );

  const productDetails = section(kind === "bundle" ? "Bundle details" : "Product details", <>
    {field(kind === "bundle" ? "Bundle name" : "Product name", <Input value={name} onChange={event => setName(event.target.value)} placeholder="Enter name" />)}
    {field("Store location", <Input value={location} onChange={event => setLocation(event.target.value)} placeholder="All locations" />, true)}
    {imagePicker}
    {field("Short description", <Input value={shortDescription} onChange={event => setShortDescription(event.target.value)} maxLength={180} placeholder="A short summary" />, true)}
    {field("Long description", <Textarea value={description} onChange={event => setDescription(event.target.value)} rows={4} placeholder="Describe this product" className="sm:col-span-2" />, true)}
    {field("Collection", <Input value={collection} onChange={event => setCollection(event.target.value)} placeholder="Enter collection name" />, true)}
    <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
      <div><p className="text-sm font-medium">Size chart</p><p className="text-xs text-muted-foreground">Attach sizing information to this product.</p></div>
      <Switch checked={sizeChartEnabled} onCheckedChange={setSizeChartEnabled} />
    </div>
    {sizeChartEnabled && field("Size chart link", <Input value={sizeChartUrl} onChange={event => setSizeChartUrl(event.target.value)} placeholder="https://" />, true)}
  </>);

  const pricing = section(kind === "bundle" ? "Bundle pricing" : "Product pricing", <>
    {field(`Selling price (${currency})`, <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currencySymbol}</span><Input className="pl-8" type="number" min="0" value={price} onChange={event => setPrice(event.target.value)} placeholder="Enter amount" /></div>)}
    {field(`Cost price (${currency})`, <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currencySymbol}</span><Input className="pl-8" type="number" min="0" value={costPrice} onChange={event => setCostPrice(event.target.value)} placeholder="Enter cost" /></div>, true)}
    {field(`Compare at price (${currency})`, <div className="relative"><span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">{currencySymbol}</span><Input className="pl-8" type="number" min="0" value={compareAtPrice} onChange={event => setCompareAtPrice(event.target.value)} placeholder="Enter reference price" /></div>, true)}
    <div className="sm:col-span-2"><ProductMarkupPreview basePrice={price} /></div>
  </>);

  const inventory = section(kind === "bundle" ? "Bundle inventory" : "Product inventory", <>
    {kind === "bundle" && <p className="text-xs text-muted-foreground sm:col-span-2">Bundle quantity cannot exceed available component stock. Current maximum: {bundleStockLimit}.</p>}
    {field("Stock quantity", <Input type="number" min="0" value={stock} onChange={event => setStock(event.target.value)} placeholder="Enter quantity" />)}
    {field("Status", <Select value={status} onValueChange={setStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ready">Ready stock</SelectItem><SelectItem value="made-to-order">Made to order</SelectItem><SelectItem value="out-of-stock">Out of stock</SelectItem></SelectContent></Select>, true)}
    {field("Unit", <Select value={unit} onValueChange={setUnit}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{UNIT_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent></Select>, true)}
    {field("Barcode", <Input value={barcode} onChange={event => setBarcode(event.target.value)} placeholder="Scan or enter barcode" />, true)}
    {kind !== "bundle" && field("Weight (kg)", <Input type="number" min="0.1" step="0.1" value={weight} onChange={event => setWeight(event.target.value)} />)}
    {kind !== "bundle" && <>
      {field("Production days (from)", <Input type="number" min="0" value={productionFrom} onChange={event => setProductionFrom(event.target.value)} />)}
      {field("Production days (to)", <Input type="number" min="0" value={productionTo} onChange={event => setProductionTo(event.target.value)} />)}
    </>}
    <div className="flex items-center justify-between rounded-md border px-3 py-2 sm:col-span-2">
      <div><p className="text-sm font-medium">Order quantity limits</p><p className="text-xs text-muted-foreground">Set minimum and maximum quantities per order.</p></div>
      <Switch checked={orderQuantityEnabled} onCheckedChange={setOrderQuantityEnabled} />
    </div>
    {orderQuantityEnabled && <>
      {field("Minimum quantity", <Input type="number" min="1" value={minimumOrder} onChange={event => setMinimumOrder(event.target.value)} />)}
      {field("Maximum quantity", <Input type="number" min={minimumOrder} value={maximumOrder} onChange={event => setMaximumOrder(event.target.value)} placeholder="No maximum" />, true)}
    </>}
  </>);

  const variantEditor = kind === "variants" && (
    <section className="border-b">
      <h3 className="bg-muted/60 px-4 py-3 text-sm font-semibold">Product variations</h3>
      <div className="space-y-3 p-4">
        <p className="text-xs text-muted-foreground">Add a row for each sellable combination. Stock and price can vary by option.</p>
        {variants.map((variant, index) => (
          <div key={variant.id} className="rounded-md border p-3">
            <div className="mb-3 flex items-center justify-between"><p className="text-sm font-medium">Variant {index + 1}</p>{variants.length > 1 && <Button type="button" variant="ghost" size="icon" aria-label="Remove variant" onClick={() => setVariants(current => current.filter(item => item.id !== variant.id))}><X className="h-4 w-4" /></Button>}</div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {field("Variant name", <Input value={variant.name} onChange={event => updateVariant(variant.id, "name", event.target.value)} placeholder="e.g. Black / Medium" />)}
              {field("Size", <Input value={variant.size} onChange={event => updateVariant(variant.id, "size", event.target.value)} placeholder="Optional" />, true)}
              {field("Colour", <Input value={variant.color} onChange={event => updateVariant(variant.id, "color", event.target.value)} placeholder="e.g. Black" />, true)}
              {field("SKU", <Input value={variant.sku} onChange={event => updateVariant(variant.id, "sku", event.target.value)} placeholder="Variant SKU" />, true)}
              {field("Selling price", <Input type="number" min="0" value={variant.price} onChange={event => updateVariant(variant.id, "price", event.target.value)} placeholder={price || "Use product price"} />)}
              {field("Stock quantity", <Input type="number" min="0" value={variant.quantity} onChange={event => updateVariant(variant.id, "quantity", event.target.value)} placeholder="0" />)}
            </div>
          </div>
        ))}
        <Button type="button" variant="outline" onClick={() => setVariants(current => [...current, newVariant()])}><Plus className="mr-2 h-4 w-4" />Add variation</Button>
      </div>
    </section>
  );

  const bundlePicker = kind === "bundle" && (
    <section className="border-b">
      <h3 className="bg-muted/60 px-4 py-3 text-sm font-semibold">Select products</h3>
      <div className="space-y-3 p-4">
        {availableProducts.length === 0 ? <p className="rounded-md border border-dashed p-5 text-sm text-muted-foreground">No products are available to add to this bundle.</p> : (
          <div className="max-h-64 space-y-2 overflow-y-auto">
            {bundleCandidates.map(product => {
              const selected = bundleEntries.find(entry => entry.productId === product.id);
              return <div key={product.id} className="flex items-center gap-3 rounded-md border p-3">
                <input aria-label={`Select ${product.productName}`} type="checkbox" checked={!!selected} onChange={event => event.target.checked ? addBundleProduct(product.id) : setBundleEntries(current => current.filter(entry => entry.productId !== product.id))} />
                <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded border bg-muted">{typeof product.thumbnail === "string" && product.thumbnail && <Image src={product.thumbnail} alt="" fill unoptimized className="object-cover" />}</div>
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{product.productName}</p><p className="text-xs text-muted-foreground">{product.sku} · {product.stock} in stock</p></div>
                {selected && <Input aria-label={`Quantity of ${product.productName}`} className="w-20" type="number" min="1" max={product.stock} value={selected.quantity} onChange={event => updateBundleEntry(product.id, event.target.value)} />}
              </div>;
            })}
          </div>
        )}
        <p className="text-xs text-muted-foreground">Select up to 20 products. Bundle products cannot contain other bundles.</p>
      </div>
    </section>
  );

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/45 p-2 sm:p-4" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget && !isSaving) onClose(); }}>
      <div role="dialog" aria-modal="true" aria-labelledby="retail-product-title" className="flex max-h-[96vh] w-full max-w-4xl flex-col overflow-hidden rounded-lg border bg-background shadow-xl">
        <header className="flex items-center justify-between border-b px-4 py-3 sm:px-6">
          <div><p className="text-xs text-muted-foreground">Products</p><h2 id="retail-product-title" className="text-lg font-semibold">Create product</h2></div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close" onClick={onClose} disabled={isSaving}><X className="h-5 w-5" /></Button>
        </header>
        <main className="min-h-0 flex-1 overflow-y-auto">
          <div className="border-b p-4 sm:p-6">
            <p className="text-sm font-semibold">Select product type</p>
            <p className="mt-1 text-xs text-muted-foreground">Choose how customers can buy this product.</p>
            <div className="mt-3 grid gap-2 md:grid-cols-3">
              {PRODUCT_TYPES.map(option => {
                const Icon = option.icon;
                const active = kind === option.id;
                return <button key={option.id} type="button" onClick={() => setKind(option.id)} className={`relative flex min-h-20 items-start gap-3 rounded-md border p-3 text-left transition-colors ${active ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                  <span className={`mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-md ${active ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}><Icon className="h-4 w-4" /></span>
                  <span><span className="block text-sm font-semibold">{option.title}</span><span className="mt-1 block text-xs text-muted-foreground">{option.description}</span></span>
                  {active && <Check className="absolute right-2 top-2 h-4 w-4 text-primary" />}
                </button>;
              })}
            </div>
          </div>
          {productDetails}
          {kind === "bundle" ? bundlePicker : variantEditor}
          {pricing}
          {inventory}
        </main>
        <footer className="flex items-center justify-between gap-3 border-t bg-background px-4 py-3 sm:px-6">
          <Button type="button" variant="ghost" onClick={reset} disabled={isSaving}>Clear fields</Button>
          <div className="flex gap-2"><Button type="button" variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button><Button type="button" onClick={handleSave} disabled={isSaving}>{isSaving ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving</> : kind === "bundle" ? "Save bundle" : "Add product"}</Button></div>
        </footer>
      </div>
    </div>
  );
}
