"use client";

import { useCallback, useEffect, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";

type Kind = "categories" | "units";
type Entry = { id: string; name: string; description: string; abbreviation?: string; allBranches: boolean };

export default function FoodTaxonomyManager({ kind }: { kind: Kind }) {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [abbreviation, setAbbreviation] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/food-taxonomy", { cache: "no-store" });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not load food settings");
      setEntries(Array.isArray(result.data?.[kind]) ? result.data[kind] : []);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not load food settings";
      setError(message);
      setEntries([]);
    } finally {
      setLoading(false);
    }
  }, [kind]);

  useEffect(() => { void load(); }, [load]);

  const persist = async (next: Entry[]) => {
    setSaving(true);
    setError("");
    try {
      const response = await fetch("/api/food-taxonomy", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, entries: next }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not save changes");
      await load();
      setEditingId(""); setName(""); setDescription(""); setAbbreviation("");
      toast.success(kind === "categories" ? "Food categories saved" : "Food units saved");
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Could not save changes";
      setError(message); toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const saveEntry = (event: React.FormEvent) => {
    event.preventDefault();
    const normalized = name.trim().replace(/\s+/g, " ");
    if (!normalized) return setError("Name is required.");
    if (entries.some(entry => entry.id !== editingId && entry.name.toLowerCase() === normalized.toLowerCase())) return setError("That name already exists.");
    if (kind === "units" && !abbreviation.trim()) return setError("Unit abbreviation is required.");
    const entry: Entry = { id: editingId || crypto.randomUUID(), name: normalized, description: description.trim(), allBranches: true,
      ...(kind === "units" ? { abbreviation: abbreviation.trim() } : {}) };
    void persist(editingId ? entries.map(current => current.id === editingId ? entry : current) : [...entries, entry]);
  };

  const edit = (entry: Entry) => { setEditingId(entry.id); setName(entry.name); setDescription(entry.description || ""); setAbbreviation(entry.abbreviation || ""); setError(""); };
  const remove = (id: string) => void persist(entries.filter(entry => entry.id !== id));
  const title = kind === "categories" ? "Food categories" : "Food units";

  return <main className="mx-auto min-w-0 space-y-6 px-4 py-6 sm:px-6 lg:px-8">
    <header><h1 className="text-xl font-semibold">{title}</h1><p className="mt-1 text-sm text-muted-foreground">These store settings are available when creating food menu items.</p></header>
    <form onSubmit={saveEntry} className="grid gap-3 rounded-lg border p-4 sm:grid-cols-2">
      <Input aria-label="Name" maxLength={120} placeholder={kind === "categories" ? "Category name" : "Unit name"} value={name} onChange={event => setName(event.target.value)} />
      {kind === "units" && <Input aria-label="Abbreviation" maxLength={10} placeholder="Abbreviation" value={abbreviation} onChange={event => setAbbreviation(event.target.value)} />}
      <Textarea aria-label="Description" maxLength={200} placeholder="Description (optional)" value={description} onChange={event => setDescription(event.target.value)} className="sm:col-span-2" />
      {error && <p role="alert" className="text-sm text-destructive sm:col-span-2">{error}</p>}
      <div className="flex gap-2 sm:col-span-2">
        <Button type="submit" disabled={saving || loading} className="gap-2"><Plus className="h-4 w-4" />{editingId ? "Save changes" : `Add ${kind === "categories" ? "category" : "unit"}`}</Button>
        {editingId && <Button type="button" variant="outline" onClick={() => { setEditingId(""); setName(""); setDescription(""); setAbbreviation(""); }}>Cancel</Button>}
      </div>
    </form>
    <section className="overflow-x-auto rounded-lg border">
      <table className="w-full text-left text-sm"><thead className="bg-muted/40 text-xs uppercase text-muted-foreground"><tr>
        <th className="px-4 py-3">Name</th>{kind === "units" && <th className="px-4 py-3">Abbreviation</th>}<th className="px-4 py-3">Description</th><th className="px-4 py-3">Scope</th><th className="px-4 py-3" />
      </tr></thead><tbody>
        {loading ? Array.from({ length: 3 }, (_, index) => <tr key={index}><td colSpan={kind === "units" ? 5 : 4} className="px-4 py-3"><Skeleton className="h-5 w-full" /></td></tr>) : entries.map(entry => <tr key={entry.id} className="border-t">
          <td className="px-4 py-3 font-medium">{entry.name}</td>{kind === "units" && <td className="px-4 py-3">{entry.abbreviation}</td>}<td className="px-4 py-3 text-muted-foreground">{entry.description || "-"}</td><td className="px-4 py-3">Store-wide</td>
          <td className="px-4 py-3"><div className="flex justify-end"><Button type="button" variant="ghost" size="icon" title="Edit" aria-label={`Edit ${entry.name}`} onClick={() => edit(entry)}><Pencil className="h-4 w-4" /></Button><Button type="button" variant="ghost" size="icon" title="Delete" aria-label={`Delete ${entry.name}`} onClick={() => remove(entry.id)} disabled={saving}><Trash2 className="h-4 w-4" /></Button></div></td>
        </tr>)}
        {!loading && entries.length === 0 && <tr><td colSpan={kind === "units" ? 5 : 4} className="px-4 py-12 text-center text-muted-foreground">No {kind} configured.</td></tr>}
      </tbody></table>
    </section>
  </main>;
}
