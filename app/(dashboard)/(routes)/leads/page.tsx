"use client";

import { useEffect, useMemo, useState } from "react";
import { Download, Mail, RefreshCw, Search, UsersRound } from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Lead = {
  id?: string;
  email: string;
  source?: string;
  status?: string;
  created_at?: string;
  createdAt?: string;
};

type LeadsResponse = {
  data?: Lead[] | { items?: Lead[]; total?: number };
  message?: string;
  status?: string;
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter((lead) => lead.email.toLowerCase().includes(query));
  }, [leads, search]);

  async function fetchLeads() {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({ page: "1", pageSize: "50" });
      if (search.trim()) params.set("search", search.trim());

      const response = await fetch(`/api/leads?${params.toString()}`, {
        cache: "no-store",
      });
      const result = (await response.json()) as LeadsResponse;

      if (!response.ok) {
        throw new Error(result.message || "Unable to load leads");
      }

      const data = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result.data?.items)
          ? result.data.items
          : [];
      setLeads(data);
    } catch (err) {
      setLeads([]);
      setError(err instanceof Error ? err.message : "Unable to load leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void fetchLeads();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exportLeads() {
    if (filteredLeads.length === 0) {
      toast.error("No leads to export");
      return;
    }

    const csv = [
      ["Email", "Source", "Status", "Created"],
      ...filteredLeads.map((lead) => [
        lead.email,
        lead.source || "storefront",
        lead.status || "new",
        formatDate(lead.created_at || lead.createdAt),
      ]),
    ]
      .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "storefront-leads.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Storefront Leads
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Emails collected from the lead form at the bottom of your storefront.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => void fetchLeads()}>
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Refresh</span>
          </Button>
          <Button onClick={exportLeads}>
            <Download className="h-4 w-4" />
            <span className="ml-2">Export</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <Card className="shadow-none">
          <CardContent className="flex items-center justify-between p-5">
            <div>
              <p className="text-sm text-muted-foreground">Total leads</p>
              <p className="mt-2 text-2xl font-semibold">{leads.length}</p>
            </div>
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UsersRound className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
        <Card className="shadow-none md:col-span-2">
          <CardContent className="flex h-full items-center p-5">
            <div>
              <p className="text-sm font-medium">Lead source</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Storefront form submissions are sent to the backend and appear here once the leads endpoint is live.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6 shadow-none">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-sm font-semibold">Captured emails</h2>
              <p className="text-xs text-muted-foreground">
                {error ? "Backend leads endpoint is not available yet." : "Latest storefront leads."}
              </p>
            </div>
            <div className="relative">
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search email"
                className="pl-9 md:w-72"
              />
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader className="bg-[#F5F5F5] dark:bg-background">
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="py-10 text-center text-sm text-muted-foreground">
                    Loading leads...
                  </TableCell>
                </TableRow>
              ) : filteredLeads.length > 0 ? (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id || lead.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Mail className="h-4 w-4" />
                        </div>
                        <span className="text-sm font-medium">{lead.email}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm capitalize">{lead.source || "storefront"}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                        {lead.status || "New"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(lead.created_at || lead.createdAt)}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="mx-auto max-w-sm">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Mail className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-medium">No leads yet</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {error || "Emails submitted from the storefront form will show here."}
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

function formatDate(value?: string) {
  if (!value) return "Not available";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}
