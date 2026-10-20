"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, LockKeyhole, Plus, Search, ShieldCheck, UserRound, UsersRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InviteStaffModal } from "./_components/InviteStaffModal";

type Role = { id: string | null; role_key: "manager" | "staff" | "custom"; role_name: string; permissions: string[]; is_system?: boolean };
type Member = { staff_user_id: string; email: string; first_name?: string; last_name?: string; role_key: string; role_name: string; role_id: string | null; permissions: string[]; is_active: boolean };
type Invitation = { id: string; email: string; role_name: string; status: string; expires_at: string };
type AuditEntry = { id: string; actor_name: string; action_type: string; module: string; ip_address?: string; before_state?: unknown; after_state?: unknown; created_at: string };

const permissionGroups = [
  { title: "Products", permissions: ["products.read", "products.create", "products.update", "products.delete"] },
  { title: "Orders", permissions: ["orders.read", "orders.update"] },
  { title: "Customers", permissions: ["customers.read", "customers.manage"] },
  { title: "Tickets", permissions: ["tickets.checkin"] },
  { title: "Analytics & reports", permissions: ["analytics.read"] },
  { title: "Wallet & finance", permissions: ["wallet.read", "wallet.withdraw"] },
  { title: "Settings", permissions: ["settings.read", "settings.update"] },
  { title: "Notifications", permissions: ["notifications.read", "notifications.manage"] },
];

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
  const [roles, setRoles] = useState<Role[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [roleName, setRoleName] = useState("");
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [permissions, setPermissions] = useState<string[]>([]);
  const [savingRole, setSavingRole] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [memberRows, roleRows, invitationRows, auditRows] = await Promise.all([
        request<Member[]>(""), request<Role[]>("/roles"), request<Invitation[]>("/invitations"), request<AuditEntry[]>("/audit-log?limit=50"),
      ]);
      setMembers(memberRows);
      setRoles(roleRows);
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

  function selectRole(role: Role) {
    setSelectedRole(role);
    setRoleName(role.is_system ? "" : role.role_name);
    setPermissions(role.permissions || []);
  }

  async function saveRole() {
    if (!roleName.trim()) { toast.error("Enter a role name"); return; }
    setSavingRole(true);
    try {
      if (selectedRole?.id) {
        await request(`/roles/${selectedRole.id}`, { method: "PATCH", body: JSON.stringify({ role_name: roleName.trim(), permissions }) });
        toast.success("Role updated");
      } else {
        await request("/roles", { method: "POST", body: JSON.stringify({ role_name: roleName.trim(), permissions }) });
        toast.success("Role created");
      }
      setSelectedRole(null); setRoleName(""); setPermissions([]);
      await load();
    } catch (cause) {
      toast.error(cause instanceof Error ? cause.message : "Could not save role");
    } finally { setSavingRole(false); }
  }

  async function updateMember(member: Member, role: Role | undefined, active = member.is_active) {
    try {
      await request(`/${member.staff_user_id}`, {
        method: "PATCH",
        body: JSON.stringify({
          ...(role ? role.id
            ? { role_key: "custom", role_id: role.id }
            : { role_key: role.role_key, role_name: role.role_name, permissions: role.permissions }
            : {}),
          is_active: active,
        }),
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

  async function deleteRole(role: Role) {
    if (!role.id) return;
    try {
      await request(`/roles/${role.id}`, { method: "DELETE" });
      toast.success("Role deleted");
      if (selectedRole?.id === role.id) { setSelectedRole(null); setRoleName(""); setPermissions([]); }
      await load();
    } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not delete role"); }
  }

  return <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div><p className="text-xs font-medium uppercase text-primary">Access control</p><h1 className="mt-2 text-2xl font-semibold">Staff &amp; roles</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Manage vendor team access, permissions, invitations, and activity.</p></div>
      <Button onClick={() => setInviteOpen(true)}><Plus className="mr-2 h-4 w-4" />Invite staff</Button>
    </div>

    {error && <div role="alert" className="mb-5 flex flex-wrap items-center justify-between gap-3 border-y py-4 text-sm"><span>{error}</span><Button variant="outline" onClick={() => void load()}>Retry</Button></div>}
    <div className="grid gap-3 sm:grid-cols-3">
      {[
        { label: "Active staff", value: members.filter((member) => member.is_active).length, icon: UsersRound },
        { label: "Custom roles", value: roles.filter((role) => !role.is_system).length, icon: ShieldCheck },
        { label: "Audit entries", value: audit.length, icon: Activity },
      ].map((item) => <Card key={item.label} className="shadow-none"><CardContent className="flex items-center justify-between p-5"><div><p className="text-sm text-muted-foreground">{item.label}</p><p className="mt-2 text-2xl font-semibold">{loading ? "—" : item.value}</p></div><item.icon className="h-5 w-5 text-primary" /></CardContent></Card>)}
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
      <Card className="shadow-none"><CardHeader className="border-b"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="text-sm font-semibold">Team members</h2><p className="text-xs text-muted-foreground">Staff access is tied to the signed-in account.</p></div><div className="relative"><Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search staff" aria-label="Search staff" className="pl-9 sm:w-64" /><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /></div></div></CardHeader>
        <CardContent className="p-0"><div className="overflow-x-auto"><Table><TableHeader><TableRow><TableHead>Staff</TableHead><TableHead>Role</TableHead><TableHead>Access</TableHead></TableRow></TableHeader><TableBody>
          {loading ? <TableRow><TableCell colSpan={3}><div className="h-14 animate-pulse rounded bg-muted" /></TableCell></TableRow> : visibleMembers.map((member) => <TableRow key={member.staff_user_id}>
            <TableCell><div className="flex items-center gap-3"><UserRound className="h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">{[member.first_name, member.last_name].filter(Boolean).join(" ") || member.email}</p><p className="text-xs text-muted-foreground">{member.email}</p></div></div></TableCell>
            <TableCell><select className="h-9 max-w-48 rounded-md border bg-background px-2 text-sm" aria-label={`Role for ${member.email}`} value={member.role_id || member.role_key} onChange={(event) => { const role = roles.find((item) => (item.id || item.role_key) === event.target.value); if (role) void updateMember(member, role); }}>
              {roles.map((role) => <option key={role.id || role.role_key} value={role.id || role.role_key}>{role.role_name}</option>)}</select></TableCell>
            <TableCell><Button size="sm" variant="outline" onClick={() => void updateMember(member, undefined, !member.is_active)}>{member.is_active ? "Disable" : "Enable"}</Button></TableCell>
          </TableRow>)}
          {!loading && !error && visibleMembers.length === 0 && <TableRow><TableCell colSpan={3} className="py-10 text-center text-sm text-muted-foreground">No staff accounts found.</TableCell></TableRow>}
        </TableBody></Table></div></CardContent>
      </Card>

      <Card className="shadow-none"><CardHeader className="border-b"><h2 className="text-sm font-semibold">Role permissions</h2><p className="text-xs text-muted-foreground">Create and maintain reusable access profiles.</p></CardHeader><CardContent className="space-y-4 p-5">
        <div className="flex flex-wrap gap-2">{roles.map((role) => <Button key={role.id || role.role_key} size="sm" variant={selectedRole?.id === role.id && selectedRole?.role_key === role.role_key ? "default" : "outline"} onClick={() => selectRole(role)}>{role.role_name}</Button>)}</div>
        <Input value={roleName} onChange={(event) => setRoleName(event.target.value)} placeholder="New role name" aria-label="Role name" />
        <div className="max-h-72 space-y-3 overflow-y-auto pr-1">{permissionGroups.map((group) => <fieldset key={group.title} className="space-y-2"><legend className="text-sm font-medium">{group.title}</legend>{group.permissions.map((permission) => <label key={permission} className="flex items-center justify-between border-b py-2 text-sm last:border-0"><span>{permission.split(".")[1].replaceAll("_", " ")}</span><Checkbox checked={permissions.includes(permission)} onCheckedChange={(checked) => setPermissions((current) => checked ? [...new Set([...current, permission])] : current.filter((item) => item !== permission))} /></label>)}</fieldset>)}</div>
        <div className="flex gap-2"><Button className="flex-1" onClick={() => void saveRole()} disabled={savingRole || !roleName.trim()}><LockKeyhole className="mr-2 h-4 w-4" />{savingRole ? "Saving..." : selectedRole?.id ? "Save role" : "Create role"}</Button>{selectedRole?.id && <Button variant="outline" onClick={() => void deleteRole(selectedRole)}>Delete</Button>}</div>
      </CardContent></Card>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-2">
      <Card className="shadow-none"><CardHeader className="border-b"><h2 className="text-sm font-semibold">Pending invitations</h2><p className="text-xs text-muted-foreground">Invited users must sign in with the invited email to accept.</p></CardHeader><CardContent className="divide-y p-0">
        {loading ? <div className="h-20 animate-pulse bg-muted" /> : invitations.filter((item) => item.status === "pending").length ? invitations.filter((item) => item.status === "pending").map((invitation) => <div key={invitation.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="text-sm font-medium">{invitation.email}</p><p className="text-xs text-muted-foreground">{invitation.role_name} · Expires {new Date(invitation.expires_at).toLocaleDateString()}</p></div><Button variant="outline" size="sm" onClick={() => void revokeInvitation(invitation)}>Revoke</Button></div>) : <p className="p-5 text-sm text-muted-foreground">No pending invitations.</p>}
      </CardContent></Card>
      <Card className="shadow-none"><CardHeader className="border-b"><h2 className="text-sm font-semibold">Audit log</h2><p className="text-xs text-muted-foreground">Recent actions recorded by the backend.</p></CardHeader><CardContent className="max-h-80 divide-y overflow-y-auto p-0">
        {loading ? <div className="h-20 animate-pulse bg-muted" /> : audit.length ? audit.map((entry) => <div key={entry.id} className="p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{entry.action_type.replaceAll(".", " ")}</p><p className="text-xs text-muted-foreground">{entry.actor_name || "Vendor user"} · {entry.module}</p></div><time className="shrink-0 text-xs text-muted-foreground">{new Date(entry.created_at).toLocaleString()}</time></div></div>) : <p className="p-5 text-sm text-muted-foreground">No audit entries returned.</p>}
      </CardContent></Card>
    </div>

    <InviteStaffModal open={inviteOpen} onOpenChange={setInviteOpen} roles={roles} onInvited={() => void load()} />
  </div>;
}
