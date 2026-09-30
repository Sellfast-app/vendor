"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Banknote, ArrowUpRight } from "lucide-react";

interface AddBankModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddBankModal({ open, onOpenChange }: AddBankModalProps) {
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!bankName || !accountName || !accountNumber) return;
    setIsSubmitting(true);
    // TODO: connect to bank account API
    setTimeout(() => setIsSubmitting(false), 500);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">
            Add bank account
          </DialogTitle>
        </DialogHeader>
        <Card className="shadow-none">
          <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bank name</Label>
              <Input
                value={bankName}
                onChange={(e) => setBankName(e.target.value)}
                placeholder="e.g. Access Bank, GTBank"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account name</Label>
              <Input
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                placeholder="Name on the account"
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Account number</Label>
              <Input
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                placeholder="10-digit account number"
                className="h-10"
                maxLength={10}
              />
            </div>
            <div className="rounded-lg border border-dashed border-primary/30 p-3 text-xs text-muted-foreground text-center">
              Your bank account is used for instant wallet settlements.
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleSave}
                disabled={!bankName || !accountName || !accountNumber || isSubmitting}
              >
                {isSubmitting ? "Saving..." : "Save bank"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </DialogContent>
    </Dialog>
  );
}
