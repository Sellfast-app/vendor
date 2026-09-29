"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

interface InviteStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteStaffModal({ open, onOpenChange }: InviteStaffModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!name.trim()) { toast.error("Name is required"); return; }
    if (!email.trim()) { toast.error("Email is required"); return; }
    if (!role) { toast.error("Select a role"); return; }
    setIsLoading(true);
    try {
      toast.success(`Invitation sent to ${name} (${email})`);
      setName("");
      setEmail("");
      setRole("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to send invitation");
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
            <Label htmlFor="staff-name">Full name</Label>
            <Input id="staff-name" placeholder="e.g. John Doe" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
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
                <SelectItem value="Operations Manager">Operations Manager</SelectItem>
                <SelectItem value="Finance Lead">Finance Lead</SelectItem>
                <SelectItem value="Support Agent">Support Agent</SelectItem>
                <SelectItem value="Viewer">Viewer</SelectItem>
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