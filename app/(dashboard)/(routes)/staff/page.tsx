"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, Plus, Search, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InviteStaffModal } from "./_components/InviteStaffModal";

type Member = { staff_user_id: string; email: string; first_name?: string; last_name?: string; role_key: string; role_name: string; role_id: string | null; permissions: string[]; is_active: boolean };
type Invitation = { id: string; email: string; role_name: string; status: string; expires_at: string };
type AuditEntry = { id: string; actor_name: string; action_type: string; module: string; ip_address?: string; before_state?: unknown; after_state?: unknown; created_at: string };

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/vendor/staff${path}`, {
    ...init,
    headers: { ...(init?.body ? { "Content-Type": "application/json" } : {}), ...init?.headers },
    cache: "no-store",
  });
  const result = await response.json();
  if (!response.ok || result.status !== "success") throw new Error(result.message || "Staff request failed");
  return result.data as T;
}

export default function StaffPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [memberRows, invitationRows, auditRows] = await Promise.all([
        request<Member[]>(""), request<Invitation[]>("/invitations"), request<AuditEntry[]>("/audit-log?limit=50"),
      ]);
      setMembers(memberRows);
      setInvitations(invitationRows);
      setAudit(auditRows);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to load staff data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const visibleMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return members.filter((member) => !normalized || `${member.first_name || ""} ${member.last_name || ""} ${member.email} ${member.role_name}`.toLowerCase().includes(normalized));
  }, [members, query]);

  async function toggleMember(member: Member, active: boolean) {
    try {
      await request(`/${member.staff_user_id}`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: active }),
      });
      toast.success(active ? "Staff access updated" : "Staff access disabled");
      await load();
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not update staff access"); }
  }

  async function revokeInvitation(invitation: Invitation) {
    try {
      await request(`/invitations/${invitation.id}`, { method: "DELETE" });
      toast.success("Invitation revoked");
      await load();
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not revoke invitation"); }
  }

  return <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-medium uppercase text-primary">Store operations</p><h1 className="mt-2 text-2xl font-semibold">Order staff</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Staff can access the dashboard and orders only. You can disable access at any time.</p></div>
      <Button onClick={() => setInviteOpen(true)}><Plus className="mr-2 h-4 w-4" />Add staff</Button>
    </div>

    {error && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y py-4 text-sm"><span>{error}</span><Button variant="outline" onClick={() => void load()}>Retry</Button></div>}
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: "Active staff", value: members.filter((member) => member.is_active).length, icon: UsersRound },
        { label: "Pending invitations", value: invitations.filter((item) => item.status === "pending").length, icon: ShieldCheck },
        { label: "Audit entries", value: audit.length, icon: Activity },
      ].map((item) => <Card key={item.label} className="shadow-none"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-semibold">{loading ? "—" : item.value}</p></div><item.icon className="h-5 w-5 text-primary" /></CardContent></Card>)}
    </div>

    <div className="mt-6 grid gap-6">
      <Card className="shadow-none"><CardHeader className="border-b"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold">Team members</h2><p className="text-xs text-muted-foreground">Access is limited to dashboard and order fulfillment.</p></div><div className="relative"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search staff" aria-label="Search staff" className="pl-9 sm:w-64" /><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /></div></div></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Staff</TableHead><TableHead>Role</TableHead><TableHead>Access</TableHead></TableRow></TableHeader><TableBody>
          {loading ? <TableRow><TableCell colSpan={3}><div className="h-14 animate-pulse rounded bg-muted" /></TableCell></TableRow> : visibleMembers.map((member) => <TableRow key={member.staff_user_id}>
            <TableCell><div className="flex items-center gap-3"><UserRound className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{[member.first_name, member.last_name].filter(Boolean).join(" ") || member.email}</p><p className="text-xs text-muted-foreground">{member.email}</p></div></div></TableCell>
            <TableCell><span className="text-sm">Order staff</span></TableCell>
            <TableCell><Button size="sm" variant="outline" onClick={() => void toggleMember(member, !member.is_active)}>{member.is_active ? "Revoke access" : "Restore access"}</Button></TableCell>
          </TableRow>)}
          {!loading && !error && visibleMembers.length === 0 && <TableRow><TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">No staff accounts found.</TableCell></TableRow>}
        </TableBody></Table></div></CardContent>
      </Card>

    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <Card className="shadow-none"><CardHeader className="border-b"><h2 className="text-sm font-semibold">Pending invitations</h2><p className="text-xs text-muted-foreground">Invited users must sign in with the invited email to accept.</p></CardHeader><CardContent className="divide-y p-0">
        {loading ? <div className="h-20 animate-pulse bg-muted" /> : invitations.filter((item) => item.status === "pending").length ? invitations.filter((item) => item.status === "pending").map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-medium">{invitation.email}</p><p className="text-xs text-muted-foreground">{invitation.role_name} · Expires {new Date(invitation.expires_at).toLocaleDateString()}</p></div><Button variant="outline" size="sm" onClick={() => void revokeInvitation(invitation)}>Revoke</Button></div>) : <p className="p-5 text-sm text-muted-foreground">No pending invitations.</p>}
      </CardContent></Card>
      <Card className="shadow-none"><CardHeader className="border-b"><h2 className="text-sm font-semibold">Audit log</h2><p className="text-xs text-muted-foreground">Recent actions recorded by the backend.</p></CardHeader><CardContent className="max-h-80 divide-y overflow-y-auto p-0">
        {loading ? <div className="h-20 animate-pulse bg-muted" /> : audit.length ? audit.map((entry) => <div key={entry.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{entry.action_type.replaceAll(".", " ")}</p><p className="text-xs text-muted-foreground">{entry.actor_name || "Vendor user"} · {entry.module}</p></div><time className="shrink-0 text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</time></div></div>) : <p className="p-5 text-sm text-muted-foreground">No audit entries returned.</p>}
      </CardContent></Card>
    </div>

    <InviteStaffModal open={inviteOpen} onOpenChange={setInviteOpen} onInvited={() => void load()} />
  </div>;
}
