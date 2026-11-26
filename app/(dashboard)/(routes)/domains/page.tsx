"use client";

import { useCallback, useEffect, useState } from "react";
import { AlertCircle, Check, CircleCheck, Copy, ExternalLink, Globe, LoaderCircle, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type StoreDomain = {
  id: string;
  hostname: string;
  status: "pending_dns" | "pending_verification" | "active" | "error";
  verification: { type?: string; domain?: string; value?: string; reason?: string }[];
  dns_config: Record<string, unknown>;
  last_error?: string | null;
};

type DnsRecord = { type: string; name: string; value: string; purpose: string };

function dnsRecords(domain: StoreDomain): DnsRecord[] {
  const config = domain.dns_config || {};
  const records: DnsRecord[] = [];
  const addValues = (key: string, type: string, name: string) => {
    const values = config[key];
    if (!Array.isArray(values)) return;
    for (const item of values) {
      if (typeof item === "string") records.push({ type, name, value: item, purpose: "Point your domain to the Storefront project" });
      else if (item && typeof item === "object") {
        const record = item as Record<string, unknown>;
        records.push({
          type: String(record.type || type),
          name: String(record.name || record.domain || name),
          value: String(record.value || record.valueFormatted || ""),
          purpose: "Point your domain to the Storefront project",
        });
      }
    }
  };
  addValues("aValues", "A", "@");
  addValues("recommendedIPv4", "A", "@");
  addValues("cnames", "CNAME", domain.hostname);
  addValues("recommendedCnames", "CNAME", domain.hostname);
  for (const challenge of domain.verification || []) {
    if (challenge.type && challenge.value) records.push({
      type: challenge.type.toUpperCase(),
      name: challenge.domain || "@",
      value: challenge.value,
      purpose: challenge.reason || "Verify domain ownership",
    });
  }
  return records.filter((record, index) => record.value && records.findIndex(other => other.type === record.type && other.name === record.name && other.value === record.value) === index);
}

function statusLabel(status: StoreDomain["status"]) {
  if (status === "active") return "Connected";
  if (status === "pending_verification") return "Ownership verification needed";
  if (status === "error") return "Needs attention";
  return "DNS setup in progress";
}

export default function DomainsPage() {
  const [domain, setDomain] = useState<StoreDomain | null>(null);
  const [hostname, setHostname] = useState("");
  const [slug, setSlug] = useState("");
  const [defaultUrl, setDefaultUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingSlug, setSavingSlug] = useState(false);
  const [action, setAction] = useState<"verify" | "refresh" | "remove" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/store/domains", { cache: "no-store" });
      const body = await response.json();
      if (!response.ok || body.status !== "success") throw new Error(body.message || "Could not load domains");
      setDomain(Array.isArray(body.data) ? body.data[0] || null : null);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not load domains");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => {
    const value = document.cookie.split(";").map(part => part.trim()).find(part => part.startsWith("store_url="))?.slice("store_url=".length);
    if (value) {
      const url = decodeURIComponent(value);
      setDefaultUrl(url);
      try {
        const host = new URL(url).hostname;
        if (host.endsWith(".swiftree.app")) setSlug(host.slice(0, -".swiftree.app".length));
      } catch { /* Ignore malformed legacy cookie values. */ }
    }
    void load();
  }, [load]);

  async function saveSlug() {
    setSavingSlug(true);
    try {
      const response = await fetch("/api/store/domains/slug", {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ store_slug: slug }),
      });
      const body = await response.json();
      if (!response.ok || body.status !== "success") throw new Error(body.message || "Could not update Swiftree address");
      const nextUrl = body.data.store_url as string;
      setDefaultUrl(nextUrl);
      document.cookie = `store_url=${encodeURIComponent(nextUrl)}; path=/; max-age=2592000; SameSite=Lax`;
      toast.success("Swiftree storefront address updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update Swiftree address");
    } finally { setSavingSlug(false); }
  }

  async function connect() {
    setSaving(true);
    try {
      const response = await fetch("/api/store/domains", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hostname }),
      });
      const body = await response.json();
      if (!response.ok || body.status !== "success") throw new Error(body.message || "Could not connect domain");
      setDomain(body.data);
      setHostname("");
      toast.success("Domain added. Follow the DNS instructions below.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not connect domain");
    } finally { setSaving(false); }
  }

  async function domainAction(kind: "verify" | "refresh" | "remove") {
    if (!domain) return;
    setAction(kind);
    try {
      const response = await fetch(`/api/store/domains/${encodeURIComponent(domain.id)}${kind === "refresh" ? "/refresh" : ""}`, {
        method: kind === "remove" ? "DELETE" : "POST",
      });
      const body = await response.json();
      if (!response.ok || body.status !== "success") throw new Error(body.message || "Domain action failed");
      if (kind === "remove") setDomain(null);
      else setDomain(body.data);
      toast.success(body.message || (kind === "remove" ? "Domain disconnected" : "Domain status updated"));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Domain action failed");
      await load();
    } finally { setAction(null); }
  }

  async function copy(value: string) {
    await navigator.clipboard.writeText(value);
    toast.success("Copied to clipboard");
  }

  const records = domain ? dnsRecords(domain) : [];

  return (
    <main className="mx-auto w-full max-w-5xl px-4 py-7 sm:px-6 lg:px-8">
      <header className="mb-7">
        <p className="text-sm text-muted-foreground">Store settings</p>
        <h1 className="mt-1 text-2xl font-semibold">Domains</h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">Use your own domain for your Swiftree storefront. Domain purchases are not handled here.</p>
      </header>

      <section className="mb-6 rounded-lg border bg-card p-5">
        <div className="flex items-start gap-3">
          <Globe className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div className="min-w-0 flex-1">
            <h2 className="font-medium">Your Swiftree address</h2>
            <p className="mt-1 text-sm text-muted-foreground">This address remains available as a fallback. Once your custom domain is active, visitors to this address will be forwarded to it.</p>
            {defaultUrl && <a href={defaultUrl} target="_blank" rel="noreferrer" className="mt-3 inline-flex max-w-full items-center gap-2 break-all text-sm font-medium text-primary hover:underline">{defaultUrl}<ExternalLink className="h-4 w-4 shrink-0" /></a>}
            <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center" onSubmit={event => { event.preventDefault(); void saveSlug(); }}>
              <div className="flex max-w-lg flex-1 items-center rounded-md border bg-background px-3 focus-within:ring-2 focus-within:ring-ring">
                <Input value={slug} onChange={event => setSlug(event.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} aria-label="Swiftree address" className="border-0 px-0 shadow-none focus-visible:ring-0" />
                <span className="shrink-0 text-sm text-muted-foreground">.swiftree.app</span>
              </div>
              <Button type="submit" variant="outline" disabled={savingSlug || !slug.trim()}>{savingSlug && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Update address</Button>
            </form>
            <p className="mt-2 text-xs text-muted-foreground">Previous Swiftree addresses will redirect here. If a custom domain is active, both addresses forward to it.</p>
          </div>
        </div>
      </section>

      {loading ? (
        <div className="flex min-h-40 items-center justify-center rounded-lg border bg-card text-sm text-muted-foreground"><LoaderCircle className="mr-2 h-4 w-4 animate-spin" />Loading domain settings</div>
      ) : !domain ? (
        <section className="rounded-lg border bg-card p-5">
          <h2 className="font-medium">Connect a domain you own</h2>
          <p className="mt-1 text-sm text-muted-foreground">Enter the root domain or a subdomain. You will update DNS at your domain provider after it is added here.</p>
          <form className="mt-5 flex flex-col gap-3 sm:flex-row" onSubmit={event => { event.preventDefault(); void connect(); }}>
            <Input value={hostname} onChange={event => setHostname(event.target.value)} placeholder="yourbrand.com" autoCapitalize="none" autoCorrect="off" className="max-w-lg" />
            <Button type="submit" disabled={saving || !hostname.trim()}>{saving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}Add domain</Button>
          </form>
        </section>
      ) : (
        <section className="rounded-lg border bg-card">
          <div className="flex flex-col gap-4 border-b p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="break-all text-lg font-medium">{domain.hostname}</h2>
                <span className={`inline-flex items-center gap-1 rounded border px-2 py-1 text-xs ${domain.status === "active" ? "border-green-200 bg-green-50 text-green-700" : "border-amber-200 bg-amber-50 text-amber-800"}`}>
                  {domain.status === "active" ? <CircleCheck className="h-3.5 w-3.5" /> : <AlertCircle className="h-3.5 w-3.5" />}{statusLabel(domain.status)}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">{domain.status === "active" ? "This domain is serving your storefront. Your Swiftree address remains available as a fallback." : "Add the records shown below at your domain provider, allow DNS to propagate, then verify."}</p>
            </div>
            <div className="flex shrink-0 flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => void domainAction("refresh")} disabled={!!action}>{action === "refresh" ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}Refresh</Button>
              {domain.status !== "active" && <Button size="sm" onClick={() => void domainAction("verify")} disabled={!!action}>{action === "verify" ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Check className="mr-2 h-4 w-4" />}Verify domain</Button>}
              <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => void domainAction("remove")} disabled={!!action}>{action === "remove" ? <LoaderCircle className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}Disconnect</Button>
            </div>
          </div>

          {domain.status !== "active" && <div className="space-y-5 p-5">
            <ol className="grid gap-3 text-sm sm:grid-cols-3">
              <li className="rounded-md bg-muted/50 p-3"><span className="font-medium">1. Add to your storefront</span><p className="mt-1 text-muted-foreground">The domain is registered to Swiftree’s storefront project.</p></li>
              <li className="rounded-md bg-muted/50 p-3"><span className="font-medium">2. Update DNS</span><p className="mt-1 text-muted-foreground">Copy the exact records into your registrar’s DNS settings.</p></li>
              <li className="rounded-md bg-muted/50 p-3"><span className="font-medium">3. Verify</span><p className="mt-1 text-muted-foreground">Return here after DNS updates and select Verify domain.</p></li>
            </ol>
            <div>
              <div className="mb-2 flex items-center justify-between gap-3"><h3 className="text-sm font-semibold">DNS records</h3><span className="text-xs text-muted-foreground">Do not remove existing email records</span></div>
              {records.length ? <div className="overflow-x-auto rounded-md border"><table className="w-full min-w-[620px] text-left text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="px-3 py-2">Type</th><th className="px-3 py-2">Name</th><th className="px-3 py-2">Value</th><th className="px-3 py-2">Purpose</th><th className="px-3 py-2"></th></tr></thead><tbody>{records.map((record, index) => <tr className="border-t" key={`${record.type}-${record.name}-${index}`}><td className="px-3 py-2 font-medium">{record.type}</td><td className="px-3 py-2">{record.name}</td><td className="max-w-[260px] break-all px-3 py-2 font-mono text-xs">{record.value}</td><td className="px-3 py-2 text-muted-foreground">{record.purpose}</td><td className="px-3 py-2"><Button type="button" variant="ghost" size="icon" title="Copy record value" onClick={() => void copy(record.value)}><Copy className="h-4 w-4" /></Button></td></tr>)}</tbody></table></div> : <div className="rounded-md border border-dashed p-4 text-sm text-muted-foreground">Vercel has not returned DNS instructions yet. Refresh in a moment. If the domain requires ownership verification, complete the TXT challenge shown in your Vercel domain settings.</div>}
            </div>
            {domain.last_error && <p className="text-sm text-destructive">{domain.last_error}</p>}
          </div>}
        </section>
      )}
    </main>
  );
}
