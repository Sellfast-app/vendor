"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Activity,
  LockKeyhole,
  Mail,
  Plus,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
} from "lucide-react";

const staffMembers = [
  {
    name: "Caleb Akpomughe",
    email: "caleb@swiftree.app",
    role: "Owner",
    status: "Active",
    lastSeen: "Now",
  },
  {
    name: "Amara Joseph",
    email: "amara@store.com",
    role: "Operations Manager",
    status: "Active",
    lastSeen: "12 mins ago",
  },
  {
    name: "Tomi Ade",
    email: "tomi@store.com",
    role: "Support Agent",
    status: "Invited",
    lastSeen: "Pending invite",
  },
];

const roleProfiles = [
  {
    title: "Operations Manager",
    description: "Can manage orders, inventory, logistics and customer records.",
    enabled: true,
    permissions: ["Products", "Orders", "Customers", "Logistics"],
  },
  {
    title: "Finance Lead",
    description: "Can review wallet, settlements, transactions and exports.",
    enabled: true,
    permissions: ["Wallet & Finance", "Analytics & Reports"],
  },
  {
    title: "Support Agent",
    description: "Can view orders and reply to storefront/chat customers.",
    enabled: false,
    permissions: ["Orders", "Customers", "Notifications"],
  },
];

const permissionGroups = [
  "Products",
  "Orders",
  "Customers",
  "Analytics & Reports",
  "Wallet & Finance",
  "Settings",
  "Notifications",
];

const auditLogs = [
  {
    action: "Updated delivery method",
    module: "Settings",
    user: "Amara Joseph",
    time: "Today, 09:42",
  },
  {
    action: "Exported transactions",
    module: "Wallet",
    user: "Caleb Akpomughe",
    time: "Yesterday, 16:20",
  },
  {
    action: "Changed stock quantity",
    module: "Products",
    user: "Amara Joseph",
    time: "Yesterday, 12:08",
  },
];

export default function StaffPage() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            V2 Access Control
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Staff & Roles
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Invite staff, create role profiles and review the activity trail for
            sensitive dashboard actions.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Mail className="h-4 w-4" />
            <span className="ml-2">Invite link</span>
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            <span className="ml-2">Invite staff</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        {[
          { label: "Active staff", value: "2", icon: UsersRound },
          { label: "Custom roles", value: "3", icon: ShieldCheck },
          { label: "Logged actions", value: "128", icon: Activity },
        ].map((item) => (
          <Card key={item.label} className="shadow-none">
            <CardContent className="flex items-center justify-between p-5">
              <div>
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold">{item.value}</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <item.icon className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <Card className="shadow-none">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold">Team members</h2>
                <p className="text-xs text-muted-foreground">
                  Owner and staff accounts with role-based dashboard access.
                </p>
              </div>
              <div className="relative">
                <Input placeholder="Search staff" className="pl-9 md:w-72" />
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#F5F5F5] dark:bg-background">
                <TableRow>
                  <TableHead>Staff</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {staffMembers.map((member) => (
                  <TableRow key={member.email}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <UserRound className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{member.role}</TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          member.status === "Active"
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                      >
                        {member.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {member.lastSeen}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h2 className="text-sm font-semibold">Permission builder</h2>
            <p className="text-xs text-muted-foreground">
              Toggle the modules a custom role can access.
            </p>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {permissionGroups.map((permission, index) => (
              <label
                key={permission}
                className="flex items-center justify-between rounded-lg border p-3 text-sm"
              >
                <span>{permission}</span>
                <Checkbox defaultChecked={index < 4} />
              </label>
            ))}
            <Button className="w-full">
              <LockKeyhole className="h-4 w-4" />
              <span className="ml-2">Save role profile</span>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h2 className="text-sm font-semibold">Role profiles</h2>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {roleProfiles.map((role) => (
              <div key={role.title} className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium">{role.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {role.description}
                    </p>
                  </div>
                  <Switch defaultChecked={role.enabled} />
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {role.permissions.map((permission) => (
                    <Badge key={permission} variant="secondary">
                      {permission}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h2 className="text-sm font-semibold">Audit log</h2>
            <p className="text-xs text-muted-foreground">
              Every staff action will map to timestamp, module and before/after
              state once backend logging is connected.
            </p>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {auditLogs.map((log) => (
              <div
                key={`${log.action}-${log.time}`}
                className="flex items-center justify-between gap-4 p-5"
              >
                <div>
                  <p className="text-sm font-medium">{log.action}</p>
                  <p className="text-xs text-muted-foreground">
                    {log.user} in {log.module}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">{log.time}</p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
