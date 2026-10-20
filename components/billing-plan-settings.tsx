"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, Check, CreditCard, Tags } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

type Interval = "quarterly" | "biannually" | "yearly";
type Billing = {
  business_type: "retail" | "food" | "ticketing" | null;
  plan_model: "subscription" | "markup";
  plan_status: string;
  currency: string | null;
  billing_interval: Interval | null;
  subscription_amount: number | null;
  subscription_status: string | null;
  next_payment_date: string | null;
  pending_plan_model: string | null;
  scheduled_switch_at: string | null;
  markup_amount: number | null;
  markup_fallback_reason: string | null;
  pending_subscription_checkout: {
    reference: string;
    authorization_url: string | null;
    amount: number;
    currency: string;
    billing_interval: Interval;
  } | null;
};
type Pricing = { intervals: Record<Interval, { amount: number }> };

const intervalLabels: Record<Interval, string> = { quarterly: "Every 3 months", biannually: "Every 6 months", yearly: "Every 12 months" };
const dateLabel = (value: string | null) => value
  ? new Date(value).toLocaleDateString(undefined, { dateStyle: "long" })
  : "not available";
const money = (value: number, currency: string) => new Intl.NumberFormat(undefined, {
  style: "currency", currency, maximumFractionDigits: 2,
}).format(value);

export default function BillingPlanSettings() {
  const [billing, setBilling] = useState<Billing | null>(null);
  const [pricing, setPricing] = useState<Pricing | null>(null);
  const [interval, setInterval] = useState<Interval>("quarterly");
  const [dialog, setDialog] = useState<"markup" | "subscription" | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadBilling = useCallback(async () => {
    const response = await fetch("/api/billing", { cache: "no-store" });
    const result = await response.json();
    if (!response.ok || result.status !== "success" || !result.data) throw new Error(result.message || "Unable to load billing status.");
    const next = result.data as Billing;
    setBilling(next);
    if (next.pending_subscription_checkout) setInterval(next.pending_subscription_checkout.billing_interval);
    if (next.currency) {
      const pricingResponse = await fetch(`/api/onboarding/pricing?currency=${encodeURIComponent(next.currency)}`, { cache: "no-store" });
      const pricingResult = await pricingResponse.json();
      if (pricingResponse.ok && pricingResult.status === "success" && pricingResult.data?.intervals) setPricing(pricingResult.data);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const initialize = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams(window.location.search);
        const reference = params.get("reference") || params.get("trxref");
        let verificationError = "";
        if (params.get("subscription_payment") === "return" && reference) {
          setBusy(true);
          try {
            const verify = await fetch("/api/billing/subscription/verify", {
              method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ reference }),
            });
            const result = await verify.json();
            if (!verify.ok || result.status !== "success") throw new Error(result.message || "Payment verification failed.");
            setNotice("Subscription activated. Your store is now on the Subscription plan.");
            window.history.replaceState({}, "", window.location.pathname);
          } catch (cause) {
            verificationError = cause instanceof Error ? cause.message : "Payment verification failed.";
          }
        }
        await loadBilling();
        if (verificationError) setError(`${verificationError} Your payment is being checked; refresh this page shortly.`);
      } catch (cause) {
        if (active) setError(cause instanceof Error ? cause.message : "Unable to load billing status.");
      } finally {
        if (active) { setLoading(false); setBusy(false); }
      }
    };
    void initialize();
    return () => { active = false; };
  }, [loadBilling]);

  const submit = async () => {
    if (!dialog) return;
    setBusy(true); setError(""); setNotice("");
    try {
      const isMarkupSwitch = dialog === "markup";
      const response = await fetch(isMarkupSwitch ? "/api/billing/markup/schedule" : "/api/billing/subscription/initialize", {
        method: "POST",
        ...(isMarkupSwitch ? {} : { headers: { "Content-Type": "application/json" }, body: JSON.stringify({ billing_interval: interval }) }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Unable to update your billing plan.");
      if (!isMarkupSwitch) {
        const url = result.data?.authorization_url;
        if (!url) throw new Error("Subscription checkout URL was not returned.");
        window.location.assign(url);
        return;
      }
      setNotice(`Markup will begin on ${dateLabel(result.data?.scheduled_switch_at || null)}. Your current subscription remains active until then.`);
      setDialog(null);
      await loadBilling();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to update your billing plan.");
    } finally { setBusy(false); }
  };

  const cancelScheduled = async () => {
    setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/billing/markup/schedule", { method: "DELETE" });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Unable to cancel the scheduled change.");
      setNotice("Scheduled switch cancelled. Your subscription will renew as usual.");
      await loadBilling();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to cancel the scheduled change.");
    } finally { setBusy(false); }
  };

  if (loading) return <div className="h-64 animate-pulse rounded-md bg-muted" aria-label="Loading billing plan" />;
  if (!billing) return <section className="space-y-3 border-b pb-6"><h3 className="font-semibold">Billing plan</h3><p className="text-sm text-destructive">{error || "Billing status is unavailable."}</p><Button variant="outline" onClick={() => { setError(""); setLoading(true); void loadBilling().then(() => setLoading(false)).catch(e => { setError(e.message); setLoading(false); }); }}>Try again</Button></section>;

  const currency = billing.currency || "NGN";
  const isSubscription = billing.plan_model === "subscription";
  const subscriptionAvailable = billing.business_type !== "ticketing" && !!pricing;
  const scheduledMarkup = billing.pending_plan_model === "markup" && billing.scheduled_switch_at;

  return <section className="space-y-5 border-b pb-6">
    <div><h3 className="font-semibold">Billing plan</h3><p className="mt-1 text-xs text-muted-foreground">Your plan and payment state are managed by Swiftree billing.</p></div>
    {notice && <p role="status" className="rounded-md border border-emerald-600/30 bg-emerald-600/5 p-3 text-sm">{notice}</p>}
    {billing.pending_subscription_checkout && <div className="flex flex-col gap-3 rounded-md border p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm">A {intervalLabels[billing.pending_subscription_checkout.billing_interval].toLowerCase()} Subscription payment is pending. Markup stays active until payment is verified.</p>
      {billing.pending_subscription_checkout.authorization_url && <Button onClick={() => window.location.assign(billing.pending_subscription_checkout!.authorization_url!)}>Resume payment</Button>}
    </div>}
    <div className="grid gap-3 md:grid-cols-2">
      <button type="button" disabled={isSubscription || busy || !subscriptionAvailable} onClick={() => setDialog("subscription")} aria-pressed={isSubscription}
        className={`rounded-md border p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-70 ${isSubscription ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
        <div className="flex items-center justify-between gap-2"><CreditCard className="h-5 w-5 text-primary" />{isSubscription && <span className="flex items-center gap-1 text-xs text-primary"><Check className="h-4 w-4" />Current plan</span>}</div>
        <h4 className="mt-3 font-semibold">Subscription</h4><p className="mt-2 text-sm">No product markup is added to your listed prices.</p>
        <p className="mt-2 text-xs text-muted-foreground">{billing.subscription_amount ? `${money(billing.subscription_amount, currency)} ${intervalLabels[billing.billing_interval || "quarterly"].toLowerCase()}.` : "Paid upfront; renews automatically."}</p>
        {isSubscription && <p className="mt-2 text-xs text-muted-foreground">{billing.subscription_status === "non-renewing" || scheduledMarkup ? `Paid through ${dateLabel(billing.next_payment_date)}.` : `Next renewal: ${dateLabel(billing.next_payment_date)}.`}</p>}
      </button>
      <button type="button" disabled={!isSubscription || !!scheduledMarkup || busy || billing.markup_amount == null} onClick={() => setDialog("markup")} aria-pressed={!isSubscription}
        className={`rounded-md border p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-70 ${!isSubscription ? "border-primary bg-primary/5" : "hover:border-primary/50"}`}>
        <div className="flex items-center justify-between gap-2"><Tags className="h-5 w-5 text-primary" />{!isSubscription && <span className="text-xs text-primary">Current plan</span>}</div>
        <h4 className="mt-3 font-semibold">Markup</h4><p className="mt-2 text-sm">A platform-set amount is added to each eligible product or ticket price.</p>
        <p className="mt-2 text-xs text-muted-foreground">{billing.markup_amount == null ? "Markup pricing is not configured." : `${money(billing.markup_amount, currency)} per item. No subscription payment.`}</p>
      </button>
    </div>
    {isSubscription && <div className="flex gap-3 border-l-2 border-primary pl-4"><CalendarClock className="mt-1 h-5 w-5 shrink-0 text-primary" /><div>
      <p className="text-sm font-medium">Subscription {scheduledMarkup ? "will not renew" : "renews automatically"}</p>
      <p className="mt-1 text-sm text-muted-foreground">{scheduledMarkup
        ? `Your current paid access remains active through ${dateLabel(billing.scheduled_switch_at)}. Markup pricing starts after that date.`
        : `If renewal payment fails, the store moves to Markup and the account owner is notified by email.`}</p>
      {scheduledMarkup && <Button variant="link" disabled={busy} className="px-0" onClick={() => void cancelScheduled()}>Cancel scheduled switch</Button>}
    </div></div>}
    {!isSubscription && <div className="space-y-2"><label className="block text-sm">Subscription term<select value={interval} onChange={event => setInterval(event.target.value as Interval)}
      className="mt-1 block h-10 w-full rounded-md border bg-background px-3 sm:w-72">
      {(Object.keys(intervalLabels) as Interval[]).map(key => <option value={key} key={key}>{intervalLabels[key]}{pricing?.intervals?.[key]?.amount ? ` · ${money(pricing.intervals[key].amount, currency)}` : ""}</option>)}
    </select></label><p className="text-xs text-muted-foreground">{pricing ? "Subscription starts only after Paystack confirms payment." : "Subscription pricing is unavailable for this currency. Markup remains active."}</p></div>}
    {billing.business_type === "ticketing" && <p className="text-sm text-muted-foreground">Ticketing stores use the Markup plan.</p>}
    {billing.markup_fallback_reason === "subscription_renewal_failed" && <p className="rounded-md border border-amber-600/30 bg-amber-600/5 p-3 text-sm">Your last subscription renewal failed, so this store is using Markup. Choose Subscription and complete payment to restore your paid plan.</p>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <Dialog open={!!dialog} onOpenChange={open => { if (!open && !busy) setDialog(null); }}>
      <DialogContent><DialogHeader><DialogTitle>{dialog === "markup" ? "Schedule switch to Markup?" : "Switch to Subscription?"}</DialogTitle>
        <DialogDescription>{dialog === "markup"
          ? `Your subscription remains active until ${dateLabel(billing.next_payment_date)}. Paystack renewal will be stopped, and the ${billing.markup_amount == null ? "configured platform markup" : `${money(billing.markup_amount, currency)} markup`} will apply after your paid period ends. Your base prices will not be changed.`
          : `You will pay ${pricing?.intervals?.[interval]?.amount ? money(pricing.intervals[interval].amount, currency) : "the selected term price"} now through Paystack. Subscription activates only after payment is verified; Markup remains active until then.`}</DialogDescription></DialogHeader>
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="outline" disabled={busy} onClick={() => setDialog(null)}>Keep current plan</Button>
          <Button disabled={busy} onClick={() => void submit()}>{busy ? "Processing..." : dialog === "markup" ? "Schedule Markup" : "Continue to payment"}</Button></div>
      </DialogContent>
    </Dialog>
  </section>;
}
