"use client";

import { useCallback, useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Wallet } from "lucide-react";
import { toast } from "sonner";

type WalletSummary = {
  currency: string;
  available_minor: number;
  pending_minor: number;
  withdrawal_hold_minor: number;
  fraud_hold_minor: number;
  unwithdrawn_minor: number;
  withdrawn_minor: number;
  providers: Record<string, {
    available_minor: number;
    pending_minor: number;
    withdrawal_hold_minor: number;
    fraud_hold_minor: number;
    withdrawn_minor: number;
    unwithdrawn_minor: number;
  }>;
};

type WalletPosting = { account: string; provider: string | null; direction: "debit" | "credit"; amount_minor: number };
type WalletEntry = {
  id: string;
  event_type: string;
  provider: string | null;
  provider_reference: string | null;
  order_id: string | null;
  store_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  vendor_postings: WalletPosting[];
};

const providerName = (provider: string | null) => {
  if (provider === "paystack") return "Paystack";
  if (provider === "seerbit") return "SeerBit";
  return "Unattributed";
};

const formatMoney = (minor: number | undefined, currency: string) => {
  const amount = (minor || 0) / 100;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
};

const eventName = (event: string) => ({
  sale_captured: "Order earnings pending",
  sale_settled: "Order earnings settled",
  withdrawal_reserved: "Withdrawal requested",
  withdrawal_paid: "Withdrawal completed",
  withdrawal_released: "Withdrawal released",
  fraud_hold_placed: "Fraud review hold placed",
  fraud_hold_released: "Fraud review hold released",
  refund: "Refund adjustment",
  chargeback: "Chargeback adjustment",
  manual_adjustment: "Wallet adjustment",
}[event] || event.replaceAll("_", " "));

export default function WalletPage() {
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [entries, setEntries] = useState<WalletEntry[]>([]);
  const [currencies, setCurrencies] = useState<string[]>([]);
  const [currency, setCurrency] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadWallet = useCallback(async (quiet = false) => {
    if (quiet) setRefreshing(true);
    else setLoading(true);
    setError("");
    const query = currency ? `?currency=${encodeURIComponent(currency)}` : "";
    try {
      const [summaryResponse, historyResponse] = await Promise.all([
        fetch(`/api/wallet${query}`, { cache: "no-store" }),
        fetch(`/api/wallet/transactions${query}&limit=50&offset=0`.replace("?&", "?"), { cache: "no-store" }),
      ]);
      const [summaryBody, historyBody] = await Promise.all([summaryResponse.json(), historyResponse.json()]);
      const currencyOptions = summaryBody?.data?.currencies || historyBody?.data?.currencies || [];
      if (currencyOptions.length) setCurrencies(currencyOptions);
      if (!summaryResponse.ok || summaryBody?.status !== "success") {
        if (summaryBody?.message === "Select a wallet currency") {
          setSummary(null);
          setEntries([]);
          return;
        }
        throw new Error(summaryBody?.message || "Unable to load wallet");
      }
      if (!historyResponse.ok || historyBody?.status !== "success") {
        throw new Error(historyBody?.message || "Unable to load wallet history");
      }
      setSummary(summaryBody.data as WalletSummary);
      setEntries((historyBody.data?.entries || []) as WalletEntry[]);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Unable to load wallet";
      setError(message);
      if (quiet) toast.error(message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currency]);

  useEffect(() => { void loadWallet(); }, [loadWallet]);

  const activeCurrency = summary?.currency || currency || "NGN";
  const providers = Object.entries(summary?.providers || {}).filter(([key]) => key !== "unattributed");

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Wallet</h1>
          <p className="mt-1 text-sm text-muted-foreground">Track earnings, settlement status and withdrawals by payment provider.</p>
        </div>
        <div className="flex items-center gap-2">
          {currencies.length > 1 && (
            <select aria-label="Wallet currency" className="h-10 rounded-md border bg-background px-3 text-sm" value={currency} onChange={(event) => setCurrency(event.target.value)}>
              <option value="">Select currency</option>
              {currencies.map((item) => <option key={item} value={item}>{item}</option>)}
            </select>
          )}
          <Button variant="outline" onClick={() => void loadWallet(true)} disabled={refreshing || loading}>
            <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
            <span className="ml-2">Refresh</span>
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
          {[0, 1].map((item) => <div key={item} className="h-56 animate-pulse rounded-lg border bg-muted/40" />)}
          <div className="h-72 animate-pulse rounded-lg border bg-muted/40 xl:col-span-2" />
        </div>
      ) : error ? (
        <Card><CardContent className="flex flex-col items-start gap-3 p-6"><p className="text-sm text-destructive">{error}</p><Button variant="outline" onClick={() => void loadWallet()}>Try again</Button></CardContent></Card>
      ) : !summary ? (
        <Card><CardContent className="space-y-4 p-6"><h2 className="font-semibold">Choose wallet currency</h2><p className="text-sm text-muted-foreground">This vendor has wallets in more than one currency.</p><div className="flex flex-wrap gap-2">{currencies.map((item) => <Button key={item} variant="outline" onClick={() => setCurrency(item)}>{item}</Button>)}</div></CardContent></Card>
      ) : (
        <>
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <Card className="overflow-hidden border-primary/20 bg-[#061400] text-white shadow-none">
              <CardContent className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-white/65">Total unwithdrawn earnings</p>
                    <p className="mt-3 text-3xl font-semibold tabular-nums sm:text-4xl">{formatMoney(summary.unwithdrawn_minor, activeCurrency)}</p>
                  <p className="mt-2 text-sm text-white/60">Includes available, pending settlement and funds under review.</p>
                  </div>
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-[#061400]"><Wallet className="h-6 w-6" /></div>
                </div>
                <div className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {[
                    ["Available", summary.available_minor],
                    ["Pending settlement", summary.pending_minor],
                    ["Withdrawal hold", summary.withdrawal_hold_minor],
                    ["Fraud review hold", summary.fraud_hold_minor],
                  ].map(([label, value]) => <div key={label} className="rounded-md bg-white/10 p-3"><p className="text-xs text-white/60">{label}</p><p className="mt-1 text-lg font-semibold tabular-nums">{formatMoney(Number(value), activeCurrency)}</p></div>)}
                </div>
                {summary.fraud_hold_minor > 0 && <p className="mt-4 text-xs text-white/70">Some funds are temporarily unavailable while Swiftree reviews an account or transaction.</p>}
              </CardContent>
            </Card>

            <Card className="shadow-none">
              <CardHeader className="border-b"><h2 className="text-sm font-semibold">Provider breakdown</h2><p className="text-xs text-muted-foreground">Unwithdrawn earnings attributed to each checkout provider.</p></CardHeader>
              <CardContent className="divide-y p-0">
                {providers.length ? providers.map(([provider, balance]) => <div key={provider} className="flex items-center justify-between gap-4 px-5 py-4"><div><p className="text-sm font-medium">{providerName(provider)}</p><p className="mt-1 text-xs text-muted-foreground">Available {formatMoney(balance.available_minor, activeCurrency)} · Pending {formatMoney(balance.pending_minor, activeCurrency)} · Under review {formatMoney(balance.fraud_hold_minor, activeCurrency)}</p></div><p className="text-sm font-semibold tabular-nums">{formatMoney(balance.unwithdrawn_minor, activeCurrency)}</p></div>) : <p className="p-5 text-sm text-muted-foreground">No provider-attributed earnings yet.</p>}
                {summary.providers?.unattributed && summary.providers.unattributed.unwithdrawn_minor > 0 && <div className="px-5 py-4 text-xs text-muted-foreground">{formatMoney(summary.providers.unattributed.unwithdrawn_minor, activeCurrency)} from older records has no provider attribution.</div>}
              </CardContent>
            </Card>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Card className="shadow-none"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Withdrawn to date</p><p className="mt-2 text-2xl font-semibold tabular-nums">{formatMoney(summary.withdrawn_minor, activeCurrency)}</p></CardContent></Card>
            <Card className="shadow-none"><CardContent className="p-5"><p className="text-sm text-muted-foreground">Currency</p><p className="mt-2 text-2xl font-semibold">{activeCurrency}</p></CardContent></Card>
          </div>

          <Card className="mt-6 shadow-none">
            <CardHeader className="border-b"><h2 className="text-sm font-semibold">Wallet activity</h2><p className="text-xs text-muted-foreground">Sales, settlement releases, adjustments and withdrawal history recorded in the ledger.</p></CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Activity</TableHead><TableHead>Provider</TableHead><TableHead>Reference</TableHead><TableHead>Date</TableHead><TableHead className="text-right">Amount</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {entries.map((entry) => {
                      const ownPosting = (entry.vendor_postings || []).find((posting) => ["vendor_pending", "vendor_available", "vendor_withdrawal_hold", "vendor_fraud_hold"].includes(posting.account));
                      const amount = ownPosting?.amount_minor || 0;
                      const positive = ownPosting?.direction === "credit";
                      return <TableRow key={entry.id}><TableCell className="font-medium">{eventName(entry.event_type)}</TableCell><TableCell><Badge variant="outline">{providerName(entry.provider)}</Badge></TableCell><TableCell className="max-w-40 truncate">{entry.provider_reference || entry.order_id || entry.id}</TableCell><TableCell>{new Date(entry.created_at).toLocaleDateString()}</TableCell><TableCell className={`text-right font-medium tabular-nums ${positive ? "text-primary" : "text-foreground"}`}>{positive ? "+" : "−"}{formatMoney(amount, activeCurrency)}</TableCell></TableRow>;
                    })}
                    {!entries.length && <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No wallet activity recorded yet.</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
