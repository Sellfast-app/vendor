"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Building2, MapPin, Store } from "lucide-react";
import { V2_COUNTRY_INFO, type V2Country } from "@/lib/v2";

type BranchSummary = { id: string; name: string; city: string; state: string };

export default function LocalizationSettings({ onManageBranches }: { onManageBranches: () => void }) {
  const [country, setCountry] = useState("");
  const [branches, setBranches] = useState<BranchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const [storeResponse, branchesResponse] = await Promise.all([
          fetch("/api/store", { cache: "no-store" }),
          fetch("/api/branches", { cache: "no-store" }),
        ]);
        const [storeResult, branchesResult] = await Promise.all([
          storeResponse.json(),
          branchesResponse.json(),
        ]);
        if (!storeResponse.ok) throw new Error(storeResult.message || "Could not load store details");
        if (!branchesResponse.ok) throw new Error(branchesResult.message || "Could not load branches");

        const storeDetails = storeResult.data?.storeDetails;
        const storeCountry = storeDetails?.metadata?.v2?.country;
        const validCountry = typeof storeCountry === "string" && storeCountry in V2_COUNTRY_INFO
          ? storeCountry as V2Country
          : "";
        if (active) {
          setCountry(validCountry);
          setBranches(Array.isArray(branchesResult.data) ? branchesResult.data.map((branch: Record<string, unknown>) => ({
            id: String(branch.id),
            name: String(branch.name),
            city: String(branch.city),
            state: String(branch.region),
          })) : []);
        }
      } catch (loadError) {
        if (active) setError(loadError instanceof Error ? loadError.message : "Could not load store locations");
      } finally {
        if (active) setLoading(false);
      }
    };
    void load();
    return () => { active = false; };
  }, []);

  const countryInfo = country ? V2_COUNTRY_INFO[country as V2Country] : null;

  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <CardHeader className="border-b">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Store locations</p>
          <h2 className="mt-2 text-lg font-semibold">Branches and currency</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Branch addresses and pickup locations are managed in StoreFront Settings. Each branch can also have its own catalog and pricing.
          </p>
        </CardHeader>
        <CardContent className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-start">
          <div className="space-y-4">
            <div className="flex items-start gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Store country and currency</p>
                {loading ? <p className="mt-1 text-sm text-muted-foreground">Loading store settings...</p> : countryInfo ? (
                  <p className="mt-1 text-sm text-muted-foreground">{countryInfo.name} · {countryInfo.currency}</p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">Country details are not available for this store.</p>
                )}
              </div>
            </div>

            <div className="rounded-lg border p-4">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-primary" />
                <p className="text-sm font-medium">Configured branches</p>
                {!loading && <span className="text-xs text-muted-foreground">({branches.length})</span>}
              </div>
              {error ? <p role="alert" className="mt-2 text-sm text-destructive">{error}</p> : loading ? (
                <p className="mt-2 text-sm text-muted-foreground">Loading branches...</p>
              ) : branches.length ? (
                <ul className="mt-3 divide-y">
                  {branches.map((branch) => (
                    <li key={branch.id} className="flex items-start gap-2 py-2 first:pt-0 last:pb-0">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="text-sm">{branch.name}<span className="text-muted-foreground"> · {branch.city}, {branch.state}</span></span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-2 text-sm text-muted-foreground">No branches have been added yet.</p>
              )}
            </div>
          </div>

          <Button onClick={onManageBranches} className="w-full md:w-auto">Manage branches</Button>
        </CardContent>
      </Card>
    </div>
  );
}
