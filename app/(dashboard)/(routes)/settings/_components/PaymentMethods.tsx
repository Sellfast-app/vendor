"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CheckCircle2, CircleAlert, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";

type Provider = {
  id: "paystack" | "seerbit";
  name: string;
  enabled: boolean;
  required: boolean;
  currency: string;
  configured: boolean;
  settlement_account_configured: boolean;
  available: boolean;
};

type SettlementAccount = { account_name?: string; account_last4?: string; bank_name?: string; status?: string };

export default function PaymentMethods() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [country, setCountry] = useState("");
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [account, setAccount] = useState<SettlementAccount | null>(null);
  const [accountBusy, setAccountBusy] = useState(false);
  const [accountName, setAccountName] = useState("");
  const [accountVerified, setAccountVerified] = useState(false);
  const [accountForm, setAccountForm] = useState({ bank_code: "", name_enquiry_bank_code: "", bank_name: "", account_number: "" });

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [methodsResponse, accountResponse] = await Promise.all([
        fetch("/api/v2/payment-methods", { cache: "no-store" }),
        fetch("/api/v2/payment-methods/seerbit/sub-account", { cache: "no-store" }),
      ]);
      const methodsResult = await methodsResponse.json();
      if (!methodsResponse.ok || methodsResult.status !== "success" || !methodsResult.data) {
        throw new Error(methodsResult.message || "Could not load available payment methods");
      }
      const methodsData = methodsResult.data as { country?: string; currency?: string; methods?: Provider[] };
      const nextProviders = Array.isArray(methodsData.methods) ? methodsData.methods : [];
      setProviders(nextProviders);
      setSelected(nextProviders.filter((item) => item.enabled).map((item) => item.id));
      setCountry(methodsData.country || "");
      setCurrency(methodsData.currency || "");
      if (accountResponse.ok) {
        const accountResult = await accountResponse.json();
        setAccount(accountResult.data?.account || null);
      } else {
        setAccount(null);
      }
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load payment methods");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const toggle = (provider: Provider, enabled: boolean) => {
    if (provider.required) return;
    setSelected((current) => enabled
      ? [...new Set([...current, provider.id])]
      : current.filter((id) => id !== provider.id));
  };

  const save = async () => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/v2/payment-methods", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ providers: selected }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not save payment methods");
      toast.success("Payment methods saved");
      await load();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not save payment methods";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const resolveAccount = async () => {
    setAccountBusy(true);
    setError("");
    try {
      const response = await fetch("/api/v2/payment-methods/seerbit/resolve-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name_enquiry_bank_code: accountForm.name_enquiry_bank_code, account_number: accountForm.account_number }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success" || !result.data?.account_name) throw new Error(result.message || "Could not verify this account");
      setAccountName(result.data.account_name);
      setAccountVerified(true);
      toast.success("Bank account verified");
    } catch (cause) {
      setAccountVerified(false);
      setAccountName("");
      const message = cause instanceof Error ? cause.message : "Could not verify this account";
      setError(message);
      toast.error(message);
    } finally {
      setAccountBusy(false);
    }
  };

  const saveSettlementAccount = async () => {
    if (!accountVerified) return;
    setAccountBusy(true);
    setError("");
    try {
      const response = await fetch("/api/v2/payment-methods/seerbit/sub-account", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(accountForm),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not add SeerBit settlement account");
      setAccount(result.data?.account || null);
      setAccountName("");
      setAccountVerified(false);
      setAccountForm({ bank_code: "", name_enquiry_bank_code: "", bank_name: "", account_number: "" });
      toast.success("SeerBit settlement account added");
      await load();
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not add SeerBit settlement account";
      setError(message);
      toast.error(message);
    } finally {
      setAccountBusy(false);
    }
  };

  return <div className="space-y-6">
    <Card className="shadow-none">
      <CardHeader className="flex flex-col gap-3 border-b sm:flex-row sm:items-center sm:justify-between">
        <div><p className="text-xs font-medium uppercase text-primary">Checkout routing</p><h2 className="mt-2 text-lg font-semibold">Payment methods</h2><p className="mt-1 text-sm text-muted-foreground">Choose the providers customers can use for online checkout.</p></div>
        <Button onClick={save} disabled={loading || saving || providers.length === 0}>{saving ? <><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Saving</> : "Save payment setup"}</Button>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {loading ? <div className="h-24 animate-pulse rounded-md bg-muted" /> : providers.length === 0 ? <p className="text-sm text-muted-foreground">No online payment providers are supported for this store&apos;s market.</p> : <>
          <p className="text-xs text-muted-foreground">Market: {country} · {currency}</p>
          <div className="grid gap-3 md:grid-cols-2">{providers.map((provider) => {
            const chosen = selected.includes(provider.id);
            return <div key={provider.id} className="rounded-md border p-4">
              <div className="flex items-start justify-between gap-4"><div className="flex gap-3"><div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary"><CreditCard className="h-4 w-4" /></div><div><div className="flex flex-wrap items-center gap-2"><p className="text-sm font-medium">{provider.name}</p>{provider.required && <Badge variant="outline">Required in {country}</Badge>}</div><p className="mt-1 text-xs text-muted-foreground">Customer checkout currency: {provider.currency}</p></div></div><Switch checked={chosen} disabled={provider.required || loading} onCheckedChange={(value) => toggle(provider, value)} aria-label={`${provider.name} enabled`} /></div>
              <div className="mt-4 flex items-center gap-2 text-xs">{provider.available ? <><ShieldCheck className="h-4 w-4 text-emerald-600" /><span className="text-emerald-700">Ready for checkout</span></> : <><CircleAlert className="h-4 w-4 text-amber-600" /><span className="text-amber-700">Settlement setup required before checkout</span></>}</div>
            </div>;
          })}</div>
        </>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>

    {providers.some((provider) => provider.id === "seerbit") && <Card className="shadow-none">
      <CardHeader className="border-b"><h3 className="text-sm font-semibold">SeerBit settlement account</h3><p className="text-xs text-muted-foreground">A verified vendor settlement account is required before SeerBit can accept customer payments.</p></CardHeader>
      <CardContent className="space-y-4 p-5">
        {account?.status === "active" ? <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" /><div><p className="text-sm font-medium text-emerald-900">Account connected</p><p className="mt-1 text-xs text-emerald-800">{account.account_name} · {account.bank_name} · ending {account.account_last4}</p></div></div> : <>
          <p className="text-xs text-amber-800">Enter the SeerBit bank code and name-enquiry bank code supplied for your market. Do not substitute Paystack bank codes.</p>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="seerbit-bank-name">Bank name</Label><Input id="seerbit-bank-name" value={accountForm.bank_name} onChange={(event) => setAccountForm((current) => ({ ...current, bank_name: event.target.value }))} /></div>
            <div className="space-y-2"><Label htmlFor="seerbit-bank-code">SeerBit bank code</Label><Input id="seerbit-bank-code" value={accountForm.bank_code} onChange={(event) => { setAccountVerified(false); setAccountForm((current) => ({ ...current, bank_code: event.target.value })); }} /></div>
            <div className="space-y-2"><Label htmlFor="seerbit-enquiry-code">Name-enquiry bank code</Label><Input id="seerbit-enquiry-code" value={accountForm.name_enquiry_bank_code} onChange={(event) => { setAccountVerified(false); setAccountForm((current) => ({ ...current, name_enquiry_bank_code: event.target.value })); }} /></div>
            <div className="space-y-2"><Label htmlFor="seerbit-account-number">Account number</Label><Input id="seerbit-account-number" inputMode="numeric" value={accountForm.account_number} onChange={(event) => { setAccountVerified(false); setAccountForm((current) => ({ ...current, account_number: event.target.value.replace(/\D/g, "") })); }} /></div>
          </div>
          {accountName && <p className="rounded-md bg-muted p-3 text-sm">Verified account name: <strong>{accountName}</strong></p>}
          <div className="flex flex-wrap gap-2"><Button variant="outline" onClick={resolveAccount} disabled={accountBusy || !accountForm.name_enquiry_bank_code || !accountForm.account_number}>{accountBusy ? "Verifying..." : "Verify account"}</Button>{accountVerified && <Button onClick={saveSettlementAccount} disabled={accountBusy || !accountForm.bank_code || !accountForm.bank_name}>{accountBusy ? "Adding..." : "Add settlement account"}</Button>}</div>
        </>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>}
  </div>;
}
