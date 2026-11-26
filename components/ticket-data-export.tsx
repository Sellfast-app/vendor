"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type Dataset = "events" | "orders" | "attendees" | "check-ins";

export function TicketDataExport({
  dataset,
  eventId,
  label = "Export",
}: {
  dataset: Dataset;
  eventId?: string;
  label?: string;
}) {
  const [format, setFormat] = useState("csv");
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const query = new URLSearchParams({ dataset, format });
      if (eventId) query.set("event_id", eventId);
      const response = await fetch(`/api/vendor/ticket-orders/export?${query}`, { cache: "no-store" });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || "Ticket data export failed");
      }
      const blob = await response.blob();
      const filename = response.headers.get("content-disposition")?.match(/filename="?([^";]+)"?/)?.[1]
        || `${dataset.replaceAll("-", "_")}.${format === "excel" ? "xlsx" : format}`;
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success(`${label} downloaded`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Ticket data export failed");
    } finally {
      setBusy(false);
    }
  };

  return <div className="flex items-center gap-2">
    <select aria-label={`${label} format`} value={format} onChange={event => setFormat(event.target.value)} disabled={busy}
      className="h-9 rounded-md border bg-background px-2 text-sm">
      <option value="csv">CSV</option>
      <option value="pdf">PDF</option>
      <option value="excel">Excel (.xlsx)</option>
    </select>
    <Button variant="outline" size="sm" onClick={() => void download()} disabled={busy}>
      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      {busy ? "Preparing" : label}
    </Button>
  </div>;
}
