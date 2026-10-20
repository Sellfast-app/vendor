"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface InviteStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roles: Array<{ id: string | null; role_key: string; role_name: string }>;
  onInvited: () => void;
}

export function InviteStaffModal({ open, onOpenChange, roles, onInvited }: InviteStaffModalProps) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (open && !role) {
      const defaultRole = roles.find((item) => item.role_key === "staff");
      if (defaultRole) setRole(defaultRole.id || defaultRole.role_key);
    }
  }, [open, role, roles]);

  const handleInvite = async () => {
    if (!email.trim()) { toast.error("Email is required"); return; }
    if (!role) { toast.error("Select a role"); return; }
    const selected = roles.find((item) => (item.id || item.role_key) === role);
    if (!selected) { toast.error("Select a valid role"); return; }
    setIsLoading(true);
    try {
      const response = await fetch("/api/vendor/staff/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), role_key: selected.role_key, ...(selected.id ? { role_id: selected.id } : {}) }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Failed to send invitation");
      toast.success(result.message || `Invitation sent to ${email.trim()}`);
      onInvited();
      setEmail("");
      setRole("");
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to send invitation");
      onInvited();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite staff</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="staff-email">Email address</Label>
            <Input id="staff-email" type="email" placeholder="e.g. john@store.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-role">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger>
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                {roles.map((item) => <SelectItem key={item.id || item.role_key} value={item.id || item.role_key}>{item.role_name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Button className="w-full" onClick={handleInvite} disabled={isLoading}>
            {isLoading ? "Sending..." : "Send invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
