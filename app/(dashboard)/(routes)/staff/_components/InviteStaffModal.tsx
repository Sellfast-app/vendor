"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface InviteStaffModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onInvited: () => void;
}

export function InviteStaffModal({ open, onOpenChange, onInvited }: InviteStaffModalProps) {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInvite = async () => {
    if (!email.trim()) { toast.error("Email is required"); return; }
    setIsLoading(true);
    try {
      const response = await fetch("/api/vendor/staff/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), first_name: firstName.trim(), last_name: lastName.trim(), whatsapp_number: whatsappNumber.trim(), role_key: "staff" }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Failed to send invitation");
      toast.success(result.message || `Invitation sent to ${email.trim()}`);
      onInvited();
      setEmail("");
      setFirstName("");
      setLastName("");
      setWhatsappNumber("");
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
        <DialogHeader><DialogTitle>Add order staff</DialogTitle></DialogHeader>
        <div className="space-y-4 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="staff-first-name">First name</Label><Input id="staff-first-name" autoComplete="given-name" value={firstName} onChange={event => setFirstName(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="staff-last-name">Last name</Label><Input id="staff-last-name" autoComplete="family-name" value={lastName} onChange={event => setLastName(event.target.value)} /></div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-email">Email address</Label>
            <Input id="staff-email" type="email" placeholder="e.g. john@store.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="space-y-2"><Label htmlFor="staff-whatsapp">WhatsApp number</Label><Input id="staff-whatsapp" type="tel" autoComplete="tel" placeholder="e.g. +2348012345678" value={whatsappNumber} onChange={event => setWhatsappNumber(event.target.value)} /></div>
          <p className="text-sm text-muted-foreground">New staff receive a temporary password by email and must change it before signing in. Existing Swiftree accounts keep their current password.</p>
          <Button className="w-full" onClick={handleInvite} disabled={isLoading}>
            {isLoading ? "Adding staff..." : "Add staff and send access details"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
