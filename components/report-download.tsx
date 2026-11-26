"use client";

import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type ReportFormat = "csv" | "excel" | "pdf";

function todayLocal() {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export function ReportDownload({
  endpoint,
  filename,
  startDate,
  endDate,
  compact = false,
}: {
  endpoint: "/api/exports/orders" | "/api/analytics/export";
  filename: string;
  startDate?: string;
  endDate?: string;
  compact?: boolean;
}) {
  const [format, setFormat] = useState<ReportFormat>("excel");
  const [from, setFrom] = useState(() => startDate || `${new Date(Date.now() - 29 * 86400000).toISOString().slice(0, 10)}`);
  const [to, setTo] = useState(() => endDate || todayLocal());
  const [busy, setBusy] = useState(false);
  const fixedRange = Boolean(startDate && endDate);

  const download = async () => {
    const rangeStart = startDate || from;
    const rangeEnd = endDate || to;
    if (!rangeStart || !rangeEnd || rangeStart > rangeEnd) {
      toast.error("Choose a valid date range.");
      return;
    }
    setBusy(true);
    try {
      const query = new URLSearchParams({ format, startDate: rangeStart, endDate: rangeEnd });
      const response = await fetch(`${endpoint}?${query}`, { cache: "no-store" });
      if (!response.ok) {
        const result = await response.json().catch(() => null);
        throw new Error(result?.message || `Report download failed (${response.status})`);
      }
      const blob = await response.blob();
      const disposition = response.headers.get("content-disposition");
      const serverFilename = disposition?.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i)?.[1];
      const extension = format === "excel" ? "xlsx" : format;
      const anchor = document.createElement("a");
      const url = URL.createObjectURL(blob);
      anchor.href = url;
      anchor.download = serverFilename ? decodeURIComponent(serverFilename.replace(/\"/g, "")) : `${filename}-${rangeStart}-to-${rangeEnd}.${extension}`;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
      toast.success("Report downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Report download failed.");
    } finally {
      setBusy(false);
    }
  };

  return <div className="flex flex-wrap items-center gap-2">
    {!fixedRange && <>
      <label className="sr-only" htmlFor={`${filename}-from`}>Report start date</label>
      <input id={`${filename}-from`} type="date" value={from} max={to || todayLocal()} onChange={event => setFrom(event.target.value)} className="h-9 rounded-md border bg-background px-2 text-xs" />
      <label className="sr-only" htmlFor={`${filename}-to`}>Report end date</label>
      <input id={`${filename}-to`} type="date" value={to} min={from} max={todayLocal()} onChange={event => setTo(event.target.value)} className="h-9 rounded-md border bg-background px-2 text-xs" />
    </>}
    <label className="sr-only" htmlFor={`${filename}-format`}>Report file format</label>
    <select id={`${filename}-format`} value={format} onChange={event => setFormat(event.target.value as ReportFormat)} disabled={busy} className="h-9 rounded-md border bg-background px-2 text-sm">
      <option value="csv">CSV</option><option value="excel">Excel</option><option value="pdf">PDF</option>
    </select>
    <Button variant="outline" size={compact ? "sm" : "default"} onClick={() => void download()} disabled={busy}>
      {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
      {busy ? "Preparing" : "Download report"}
    </Button>
  </div>;
}
