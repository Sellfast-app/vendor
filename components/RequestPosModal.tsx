"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type BranchRequest = { quantity: string; branch: string; address: string; reason: string };
const newBranch = (): BranchRequest => ({ quantity: "1", branch: "", address: "", reason: "" });

export default function RequestPosModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [branches, setBranches] = useState<BranchRequest[]>([newBranch()]);
  const [submitting, setSubmitting] = useState(false);

  function updateBranch(index: number, key: keyof BranchRequest, value: string) {
    setBranches(current => current.map((branch, item) => item === index ? { ...branch, [key]: value } : branch));
  }

  async function submit() {
    if (branches.some(branch => !branch.branch.trim() || !branch.address.trim())) {
      toast.error("Enter a branch name and address for every request.");
      return;
    }
    setSubmitting(true);
    try {
      const response = await fetch("/api/vendor/pos-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ branches: branches.map(branch => ({ ...branch, quantity: Number(branch.quantity) })) }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not submit POS request");
      toast.success("POS terminal request submitted.");
      setBranches([newBranch()]);
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not submit POS request");
    } finally {
      setSubmitting(false);
    }
  }

  return <Dialog open={open} onOpenChange={value => !submitting && onOpenChange(value)}>
    <DialogContent className="max-h-[90vh] max-w-2xl gap-0 overflow-hidden p-0" showCloseButton={false}>
      <div className="flex items-start justify-between border-b px-6 py-5 sm:px-8">
        <DialogHeader className="gap-2 text-left">
          <DialogTitle className="text-xl font-semibold">Request New POS Terminal</DialogTitle>
          <DialogDescription className="max-w-xl leading-5">Fill in the details below to request a Swiftree POS terminal for your branch. Our team will review your request and get back to you.</DialogDescription>
        </DialogHeader>
        <button type="button" aria-label="Close dialog" onClick={() => onOpenChange(false)} className="ml-4 rounded-sm p-1 text-muted-foreground hover:bg-muted hover:text-foreground"><X className="h-5 w-5" /></button>
      </div>

      <div className="space-y-5 overflow-y-auto px-6 py-5 sm:px-8">
        {branches.map((branch, index) => <section key={index} className="space-y-4 border-b pb-5 last:border-0 last:pb-0">
          <div className="grid gap-4 sm:grid-cols-[150px_minmax(0,1fr)]">
            <label className="space-y-2 text-sm font-medium">Quantity<Select value={branch.quantity} onValueChange={value => updateBranch(index, "quantity", value)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{Array.from({ length: 10 }, (_, i) => <SelectItem key={i + 1} value={String(i + 1)}>{i + 1}</SelectItem>)}</SelectContent></Select></label>
            <label className="space-y-2 text-sm font-medium">Branch name<Input value={branch.branch} onChange={event => updateBranch(index, "branch", event.target.value)} placeholder="Enter branch name" maxLength={120} /></label>
          </div>
          <label className="block space-y-2 text-sm font-medium">Address<Input value={branch.address} onChange={event => updateBranch(index, "address", event.target.value)} placeholder="Enter branch address" maxLength={500} /></label>
          <label className="block space-y-2 text-sm font-medium">Reason for request (optional)<Textarea value={branch.reason} onChange={event => updateBranch(index, "reason", event.target.value)} placeholder="Tell us why you need a POS terminal" rows={3} maxLength={2000} /></label>
          {branches.length > 1 && <Button type="button" variant="ghost" size="sm" onClick={() => setBranches(current => current.filter((_, item) => item !== index))} className="text-destructive">Remove branch</Button>}
        </section>)}
        {branches.length < 20 && <Button type="button" variant="outline" onClick={() => setBranches(current => [...current, newBranch()])}><Plus className="mr-2 h-4 w-4" />Add another branch</Button>}
      </div>

      <DialogFooter className="border-t px-6 py-4 sm:px-8">
        <Button type="button" variant="outline" disabled={submitting} onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button type="button" disabled={submitting} onClick={submit}>{submitting ? "Submitting..." : "Submit Request"}</Button>
      </DialogFooter>
    </DialogContent>
  </Dialog>;
}
