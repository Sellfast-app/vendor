"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Banknote } from "lucide-react";

interface BankData {
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  bankCode: string;
}

interface AddBankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddBank: (bankData: BankData) => void;
}

export function AddBankModal({ isOpen, onClose, onAddBank }: AddBankModalProps) {
  const [bankName, setBankName] = useState("");
  const [accountHolder, setAccountHolder] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    if (!bankName || !accountHolder || !accountNumber) return;
    setIsSubmitting(true);
    onAddBank({
      bankName,
      accountNumber,
      accountHolder,
      bankCode,
    });
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
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
              <Label className="text-sm font-medium">Account holder</Label>
              <Input
                value={accountHolder}
                onChange={(e) => setAccountHolder(e.target.value)}
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
            <div className="space-y-2">
              <Label className="text-sm font-medium">Bank code</Label>
              <Input
                value={bankCode}
                onChange={(e) => setBankCode(e.target.value)}
                placeholder="e.g. 044"
                className="h-10"
              />
            </div>
            <div className="rounded-lg border border-dashed border-primary/30 p-3 text-xs text-muted-foreground text-center">
              Your bank account is used for instant wallet settlements.
            </div>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1" onClick={onClose}>
                Cancel
              </Button>
              <Button
                className="flex-1 bg-primary hover:bg-primary/90"
                onClick={handleSave}
                disabled={!bankName || !accountHolder || !accountNumber || isSubmitting}
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