"use client";

import { useCallback, useEffect, useState } from "react";
import { MonitorSmartphone, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import RequestPosModal from "@/components/RequestPosModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BusinessTypeGuard } from "@/components/business-type-guard";

type Terminal = { id: string; posid: string; serial_number: string; branch_name: string; branch_address: string; assigned_at: string };
type PosTransaction = {
  id: string; order_id: string; transaction_ref: string; status: string; transaction_value: string;
  amount_paid?: string | null; currency: string; payment_type?: string | null; masked_card_number?: string | null;
  response?: string | null; session_id?: string | null; completed_at?: string | null; created_at: string;
  posid: string; serial_number: string; branch_name: string;
};
type PosRequest = { status: string; submitted_at: string; review_note?: string | null };

function money(value: string | number | null | undefined, currency: string) {
  const amount = Number(value || 0);
  return new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 2 }).format(amount);
}

export default function PosPage() {
  const [terminals, setTerminals] = useState<Terminal[]>([]);
  const [transactions, setTransactions] = useState<PosTransaction[]>([]);
  const [latestRequest, setLatestRequest] = useState<PosRequest | null>(null);
  const [status, setStatus] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [requestOpen, setRequestOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [isStaff, setIsStaff] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const query = new URLSearchParams({ page: String(page), pageSize: "25" });
      if (status !== "all") query.set("status", status);
      const [terminalResponse, transactionResponse, requestResponse] = await Promise.all([
        fetch("/api/vendor/pos/terminals", { cache: "no-store" }),
        fetch(`/api/vendor/pos/transactions?${query}`, { cache: "no-store" }),
        fetch("/api/vendor/pos-requests", { cache: "no-store" }),
      ]);
      const [terminalResult, transactionResult, requestResult] = await Promise.all([
        terminalResponse.json(), transactionResponse.json(), requestResponse.json(),
      ]);
      if (!terminalResponse.ok || terminalResult.status !== "success") throw new Error(terminalResult.message || "Could not load assigned POS terminals");
      if (!transactionResponse.ok || transactionResult.status !== "success") throw new Error(transactionResult.message || "Could not load POS transactions");
      if (!requestResponse.ok || requestResult.status !== "success") throw new Error(requestResult.message || "Could not load POS request status");
      setTerminals(Array.isArray(terminalResult.data) ? terminalResult.data : []);
      const data = transactionResult.data || {};
      setTransactions(Array.isArray(data.items) ? data.items : []);
      setTotal(Number(data.total || 0));
      setTotalPages(Math.max(1, Number(data.totalPages || 1)));
      setLatestRequest(Array.isArray(requestResult.data) ? requestResult.data[0] || null : null);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : "Could not load POS data";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  }, [page, status]);

  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    setIsStaff(document.cookie.split(";").some(cookie => cookie.trim() === "user_role=vendor_staff"));
  }, []);

  const requestStatus = latestRequest?.status;
  const requestMessage = requestStatus === "pending"
    ? "Your request is being reviewed. We’ll show your terminals here once they are assigned."
    : requestStatus === "approved"
      ? "Your request was approved. Terminal assignment is still being completed."
      : requestStatus === "declined"
        ? latestRequest?.review_note || "Your previous request was declined. You can submit a new request."
        : "No Swiftree POS terminal has been assigned to this store yet.";

  return <BusinessTypeGuard allow={["retail", "food", "ticketing"]} redirectTo="/dashboard">
    <main className="mx-auto min-h-screen space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div><p className="text-xs font-medium uppercase tracking-[0.16em] text-primary">Sales</p><h1 className="mt-2 text-xl font-semibold">POS transactions</h1><p className="mt-1 text-sm text-muted-foreground">Transactions from SeerBit terminals assigned to this store.</p></div>
        <div className="flex gap-2">
          <Button type="button" variant="outline" onClick={() => void load()} disabled={loading}><RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</Button>
          {!terminals.length && !isStaff && <Button type="button" onClick={() => setRequestOpen(true)}>Request POS</Button>}
        </div>
      </header>

      {!terminals.length ? <Card className="shadow-none"><CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary"><MonitorSmartphone className="h-6 w-6" /></div>
        <h2 className="mt-4 text-base font-semibold">No POS terminal assigned</h2>
        <p className="mt-2 max-w-lg text-sm text-muted-foreground">{requestMessage}</p>
        {!isStaff && requestStatus !== "pending" && requestStatus !== "approved" && <Button className="mt-4" onClick={() => setRequestOpen(true)}>Request POS</Button>}
      </CardContent></Card> : <>
        <section className="rounded-md border bg-background p-4">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Assigned terminals</h2><p className="mt-1 text-xs text-muted-foreground">{terminals.length} terminal{terminals.length === 1 ? "" : "s"} across your branches</p></div></div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{terminals.map(terminal => <div className="min-w-0 rounded-md border p-3" key={terminal.id}><p className="truncate text-sm font-medium">{terminal.branch_name}</p><p className="mt-1 break-words text-xs text-muted-foreground">{terminal.branch_address}</p><dl className="mt-3 grid grid-cols-2 gap-2 text-xs"><div><dt className="text-muted-foreground">SeerBit POS ID</dt><dd className="mt-0.5 font-mono">{terminal.posid}</dd></div><div><dt className="text-muted-foreground">Serial number</dt><dd className="mt-0.5 font-mono">{terminal.serial_number}</dd></div></dl></div>)}</div>
        </section>

        <section className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-sm font-semibold">Transaction history</h2><p className="mt-1 text-xs text-muted-foreground">{total} recorded transaction{total === 1 ? "" : "s"}</p></div><select aria-label="Filter POS transactions by status" value={status} onChange={event => { setStatus(event.target.value); setPage(1); }} className="h-9 rounded-md border bg-background px-3 text-sm"><option value="all">All statuses</option><option value="completed">Completed</option><option value="pending">Pending</option><option value="failed">Failed</option><option value="canceled">Canceled</option></select></div>
          {error ? <Card className="shadow-none"><CardContent className="p-5 text-sm text-destructive">{error}</CardContent></Card> : loading ? <div className="h-40 animate-pulse rounded-md bg-muted" /> : transactions.length ? <div className="overflow-x-auto rounded-md border bg-background"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr>{["Status", "Amount", "Branch / terminal", "Payment", "Reference", "Date"].map(label => <th key={label} className="px-3 py-2.5 font-medium">{label}</th>)}</tr></thead><tbody>{transactions.map(transaction => <tr key={transaction.id} className="border-t"><td className="px-3 py-3"><span className={`inline-flex rounded-full px-2 py-1 text-xs capitalize ${transaction.status === "completed" ? "bg-emerald-50 text-emerald-700" : transaction.status === "failed" || transaction.status === "canceled" ? "bg-red-50 text-red-700" : "bg-amber-50 text-amber-700"}`}>{transaction.status}</span></td><td className="px-3 py-3 font-medium tabular-nums">{money(transaction.amount_paid ?? transaction.transaction_value, transaction.currency)}</td><td className="px-3 py-3"><p>{transaction.branch_name}</p><p className="mt-0.5 text-xs text-muted-foreground">{transaction.posid}</p></td><td className="px-3 py-3"><p>{transaction.payment_type || "—"}</p><p className="mt-0.5 text-xs text-muted-foreground">{transaction.masked_card_number || ""}</p></td><td className="px-3 py-3"><p className="font-mono text-xs">{transaction.transaction_ref}</p><p className="mt-0.5 text-xs text-muted-foreground">Order {transaction.order_id}</p></td><td className="px-3 py-3 text-xs text-muted-foreground">{new Date(transaction.completed_at || transaction.created_at).toLocaleString()}</td></tr>)}</tbody></table></div> : <div className="rounded-md border border-dashed p-8 text-center text-sm text-muted-foreground">No POS transactions yet. Completed and failed terminal attempts will appear here.</div>}
          {totalPages > 1 && <div className="flex items-center justify-end gap-3 text-sm"><span>Page {page} of {totalPages}</span><Button variant="outline" size="sm" disabled={loading || page <= 1} onClick={() => setPage(value => Math.max(1, value - 1))}>Previous</Button><Button variant="outline" size="sm" disabled={loading || page >= totalPages} onClick={() => setPage(value => Math.min(totalPages, value + 1))}>Next</Button></div>}
        </section>
      </>}
      {!isStaff && <RequestPosModal open={requestOpen} onOpenChange={value => { setRequestOpen(value); if (!value) void load(); }} />}
    </main>
  </BusinessTypeGuard>;
}
