"use client";

import { useEffect, useState } from "react";
import { Check, CalendarClock, CreditCard, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { BillingPreview, activeSubscription, billingPreviewDefault, effectiveModel, listingPrice, readBillingPreview, saveBillingPreview, switchToMarkup } from "@/lib/billing-preview";
import { V2BusinessType, V2BillingInterval, V2_MARKUP_TRANSACTION_FEES } from "@/lib/v2";

const intervals = { quarterly: "Quarterly", biannually: "Bi-annually", yearly: "Yearly" };
const money = (value: number) => new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 2 }).format(value);
const localDateInput = (value: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
};

export default function BillingPlanSettings() {
  const [state, setState] = useState<BillingPreview>(billingPreviewDefault);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState("");
  const [dialog, setDialog] = useState<"markup" | "subscription" | null>(null);
  const [base, setBase] = useState("5000");
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    try { setState(readBillingPreview()); } catch { setError("Unable to load saved billing preview."); }
    setReady(true);
    const timer = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(timer);
  }, []);
  const save = (next: BillingPreview) => {
    try { saveBillingPreview(next); setState(next); setError(""); setDialog(null); }
    catch { setError("Unable to save this change. Please try again."); }
  };
  const model = effectiveModel(state, now);
  const active = activeSubscription(state, now);
  const pending = state.pendingMarkup && model === "subscription";
  const expiry = state.expiresAt ? new Date(state.expiresAt).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" }) : "";
  const price = base.trim() && Number.isFinite(Number(base)) && Number(base) >= 0 ? listingPrice(Number(base), state, now) : null;
  const fee = V2_MARKUP_TRANSACTION_FEES[state.businessType];
  if (!ready) return <div className="h-64 animate-pulse rounded-lg bg-muted" aria-label="Loading billing plan" />;

  return <section className="space-y-5 border-b pb-6">
    <div><h3 className="font-semibold">Billing plan</h3><p className="mt-1 text-xs text-muted-foreground">Preview only. No subscription or payment changes are sent.</p></div>
    <details className="text-sm">
      <summary className="cursor-pointer text-muted-foreground">Preview scenario</summary>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="space-y-1">Business type<select className="block h-10 w-full rounded-md border bg-background px-3" value={state.businessType} onChange={event => {
          const businessType = event.target.value as V2BusinessType;
          save({ ...state, businessType, ...(businessType === "ticketing" ? { model: "markup", pendingMarkup: false, expiresAt: null } : {}) });
        }}><option value="retail">Retail & Wholesale</option><option value="food">Food & Restaurant</option><option value="ticketing">Ticketing</option></select></label>
        <label className="space-y-1">Subscription expiry<Input type="datetime-local" value={localDateInput(state.expiresAt)} disabled={model !== "subscription"} onChange={event => {
          const date = event.target.value ? new Date(event.target.value) : null;
          if (!date || Number.isFinite(date.getTime())) save({ ...state, expiresAt: date?.toISOString() || null, pendingMarkup: false });
        }} /></label>
      </div>
    </details>
    <div className="grid gap-3 md:grid-cols-2">
      <button type="button" disabled={state.businessType === "ticketing"} onClick={() => { if (model !== "subscription") setDialog("subscription"); }}
        aria-pressed={model === "subscription"} className={`rounded-lg border p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50 ${model === "subscription" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
        <div className="flex items-center justify-between gap-2"><CreditCard className="h-5 w-5 text-primary" />{model === "subscription" && <span className="flex items-center gap-1 text-xs text-primary"><Check className="h-4 w-4" />Selected</span>}</div>
        <h4 className="mt-3 font-semibold">Subscription</h4><p className="mt-2 text-sm">No markup added to product prices.</p>
        <p className="mt-2 text-xs text-muted-foreground">Quarterly, bi-annually or yearly. {fee}% transaction fee.</p>
        {state.businessType === "ticketing" && <p className="mt-2 text-xs">Not available for ticketing.</p>}
      </button>
      <button type="button" onClick={() => { if (model !== "markup" && !pending) setDialog("markup"); }} aria-pressed={model === "markup"}
        className={`rounded-lg border p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${model === "markup" ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
        <div className="flex items-center justify-between gap-2"><Tags className="h-5 w-5 text-primary" /><span className="text-xs text-primary">{pending ? "Scheduled" : model === "markup" ? "Selected" : ""}</span></div>
        <h4 className="mt-3 font-semibold">Markup</h4><p className="mt-2 text-sm">₦500 added to each product or ticket price.</p>
        <p className="mt-2 text-xs text-muted-foreground">₦0 upfront subscription. {fee}% transaction fee.</p>
      </button>
    </div>
    {model === "subscription" && <div className="space-y-3">
      <label className="block text-sm">Billing interval<select value={state.interval} onChange={event => save({ ...state, interval: event.target.value as V2BillingInterval })}
        className="mt-1 block h-10 w-full rounded-md border bg-background px-3 sm:w-64">
        {Object.entries(intervals).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></label>
      <p className="text-sm text-muted-foreground">{active ? `Paid period ends ${expiry}.` : "No active paid period is loaded."} Subscription pricing will be supplied by the billing service.</p>
    </div>}
    {pending && <div className="flex gap-3 border-l-2 border-primary pl-4">
      <CalendarClock className="mt-1 h-5 w-5 shrink-0 text-primary" /><div><p className="text-sm font-medium">Markup starts {expiry}</p>
        <p className="mt-1 text-sm text-muted-foreground">Your subscription will not renew. Product prices stay unchanged until then.</p>
        <Button variant="link" className="px-0" onClick={() => save({ ...state, pendingMarkup: false })}>Cancel scheduled switch</Button></div>
    </div>}
    <div className="space-y-3 border-t pt-4">
      <h4 className="text-sm font-medium">Product price preview</h4>
      <label className="block text-xs text-muted-foreground">Base price (NGN)<Input className="mt-1 max-w-64" type="number" min="0" step="0.01" value={base} onChange={event => setBase(event.target.value)} /></label>
      {price && <dl className="max-w-md space-y-2 text-sm"><div className="flex justify-between"><dt>Base price</dt><dd>{money(price.base)}</dd></div>
        {model === "markup" && <div className="flex justify-between"><dt>Swiftree markup</dt><dd>{money(price.markup)}</dd></div>}
        <div className="flex justify-between border-t pt-2 font-medium"><dt>Customer price</dt><dd>{money(price.total)}</dd></div></dl>}
    </div>
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Dialog open={!!dialog} onOpenChange={open => { if (!open) setDialog(null); }}>
      <DialogContent className="max-h-[90dvh] overflow-y-auto"><DialogHeader><DialogTitle>{dialog === "markup" ? "Switch to markup?" : "Choose subscription?"}</DialogTitle>
        <DialogDescription>{dialog === "markup" ? active
          ? `You still have an active subscription until ${expiry}. Switching to markup means your subscription will not renew. After it expires, ₦500 will be added to every product price. Until then, your subscription and current prices remain unchanged.`
          : "There is no active subscription period loaded. The preview will add ₦500 to every product price immediately."
          : "In the live flow, markup will stay active until subscription payment is confirmed. This action changes the preview only."}</DialogDescription></DialogHeader>
        <p className="text-sm">{fee}% transaction fees still apply. No base prices will be overwritten.</p>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" onClick={() => setDialog(null)}>Keep current plan</Button>
          <Button onClick={() => save(dialog === "markup" ? switchToMarkup(state, now) : { ...state, model: "subscription", pendingMarkup: false, expiresAt: null })}>
            {dialog === "markup" && active ? "Schedule markup" : "Confirm preview"}</Button></div>
      </DialogContent>
    </Dialog>
  </section>;
}
