"use client";

import { useEffect, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type Coupon = {
  id: string;
  code: string;
  amount: number;
  startDate: string;
  expiryDate: string;
  usageLimit: number;
  active: boolean;
};

export function CouponsDialog({ open, onOpenChange, currency = "NGN" }: { open: boolean; onOpenChange: (open: boolean) => void; currency?: string }) {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [code, setCode] = useState("");
  const [amount, setAmount] = useState("");
  const [usageLimit, setUsageLimit] = useState("1");
  const [startDate, setStartDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    const response = await fetch("/api/vendor/coupons", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || result.status !== "success") throw new Error(result.message || "Unable to load coupons");
    setCoupons(Array.isArray(result.data) ? result.data : []);
  };

  useEffect(() => {
    if (open) void load().catch((error) => toast.error(error.message));
  }, [open]);

  const create = async (event: FormEvent) => {
    event.preventDefault();
    setBusy(true);
    try {
      const response = await fetch("/api/vendor/coupons", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim().toUpperCase(), amount: Number(amount), usageLimit: Number(usageLimit), startDate: new Date(startDate).toISOString(), expiryDate: new Date(expiryDate).toISOString() }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Unable to create coupon");
      setCode(""); setAmount(""); setUsageLimit("1"); setStartDate(""); setExpiryDate("");
      await load();
      toast.success("Coupon created");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to create coupon");
    } finally {
      setBusy(false);
    }
  };

  const deactivate = async (coupon: Coupon) => {
    const response = await fetch(`/api/vendor/coupons/${encodeURIComponent(coupon.id)}`, { method: "PATCH" });
    const result = await response.json();
    if (!response.ok || result.status !== "success") return toast.error(result.message || "Unable to deactivate coupon");
    await load();
    toast.success("Coupon deactivated");
  };

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
      <DialogHeader><DialogTitle>Coupon codes</DialogTitle></DialogHeader>
      <form onSubmit={create} className="grid grid-cols-1 gap-3 border-b pb-5 sm:grid-cols-2">
        <div className="sm:col-span-2"><Label htmlFor="coupon-code">Code (optional)</Label><Input id="coupon-code" value={code} onChange={(event) => setCode(event.target.value.toUpperCase())} placeholder="Generate a code automatically" maxLength={40} /></div>
        <div><Label htmlFor="coupon-amount">Discount amount ({currency})</Label><Input id="coupon-amount" type="number" min="1" step="0.01" required value={amount} onChange={(event) => setAmount(event.target.value)} /></div>
        <div><Label htmlFor="coupon-uses">Successful uses</Label><Input id="coupon-uses" type="number" min="1" step="1" required value={usageLimit} onChange={(event) => setUsageLimit(event.target.value)} /></div>
        <div><Label htmlFor="coupon-start">Starts</Label><Input id="coupon-start" type="datetime-local" required value={startDate} onChange={(event) => setStartDate(event.target.value)} /></div>
        <div><Label htmlFor="coupon-expiry">Expires</Label><Input id="coupon-expiry" type="datetime-local" required value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} /></div>
        <p className="text-xs text-muted-foreground sm:col-span-2">Discount applies to item subtotal only. Delivery and other checkout fees remain unchanged.</p>
        <Button type="submit" disabled={busy || !startDate || !expiryDate} className="sm:col-span-2">{busy ? "Creating..." : "Create coupon"}</Button>
      </form>
      <div className="space-y-2">
        {coupons.length === 0 ? <p className="py-4 text-sm text-muted-foreground">No coupons created for this store.</p> : coupons.map((coupon) => <div key={coupon.id} className="flex items-center justify-between gap-3 border-b py-3 last:border-0">
          <div className="min-w-0"><p className="truncate text-sm font-semibold">{coupon.code}</p><p className="text-xs text-muted-foreground">{currency} {coupon.amount.toLocaleString()} · {coupon.usageLimit} use(s) · ends {new Date(coupon.expiryDate).toLocaleDateString()}</p></div>
          {coupon.active ? <Button variant="outline" size="sm" onClick={() => void deactivate(coupon)}>Deactivate</Button> : <span className="text-xs text-muted-foreground">Inactive</span>}
        </div>)}
      </div>
    </DialogContent>
  </Dialog>;
}
