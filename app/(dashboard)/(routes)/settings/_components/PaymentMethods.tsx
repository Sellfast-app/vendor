"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { CheckCircle2, CircleAlert, CreditCard, LoaderCircle, ShieldCheck } from "lucide-react";
import AddBankModal from "@/app/(dashboard)/(routes)/payouts/_components/AddBankModal";

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
  const [paystackBankModalOpen, setPaystackBankModalOpen] = useState(false);
  const [seerbitBankModalOpen, setSeerbitBankModalOpen] = useState(false);

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
              {provider.id === "paystack" && !provider.settlement_account_configured && <Button className="mt-3" size="sm" variant="outline" onClick={() => setPaystackBankModalOpen(true)}>Add Paystack bank account</Button>}
              {provider.id === "seerbit" && !provider.settlement_account_configured && <Button className="mt-3" size="sm" variant="outline" onClick={() => setSeerbitBankModalOpen(true)}>Add SeerBit bank account</Button>}
            </div>;
          })}</div>
        </>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>

    {providers.some((provider) => provider.id === "seerbit") && <Card className="shadow-none">
      <CardHeader className="border-b"><h3 className="text-sm font-semibold">SeerBit settlement account</h3><p className="text-xs text-muted-foreground">A verified vendor settlement account is required before SeerBit can accept customer payments.</p></CardHeader>
      <CardContent className="space-y-4 p-5">
        {account?.status === "active" ? <div className="flex items-start gap-3 rounded-md border border-emerald-200 bg-emerald-50 p-4"><CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-700" /><div><p className="text-sm font-medium text-emerald-900">Account connected</p><p className="mt-1 text-xs text-emerald-800">{account.account_name} · {account.bank_name} · ending {account.account_last4}</p></div></div> : <p className="text-sm text-muted-foreground">Add and verify the bank account where SeerBit settlements should be sent.</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>}
    <AddBankModal isOpen={paystackBankModalOpen} onClose={() => setPaystackBankModalOpen(false)} onAddBank={() => { setPaystackBankModalOpen(false); void load(); }} />
    <AddBankModal provider="seerbit" isOpen={seerbitBankModalOpen} onClose={() => setSeerbitBankModalOpen(false)} onAddBank={() => { setSeerbitBankModalOpen(false); void load(); }} />
  </div>;
}
