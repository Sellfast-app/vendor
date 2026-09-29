"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface WithdrawModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  availableBalance: string;
}

export function WithdrawModal({ open, onOpenChange, availableBalance }: WithdrawModalProps) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleWithdraw = async () => {
    const numAmount = Number(amount);
    if (!numAmount || numAmount <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setIsLoading(true);
    try {
      toast.success(`Withdrawal request of ₦${numAmount.toLocaleString()} submitted`);
      setAmount("");
      onOpenChange(false);
    } catch {
      toast.error("Failed to process withdrawal");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Withdraw funds</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="withdraw-amount">Amount (₦)</Label>
            <Input
              id="withdraw-amount"
              type="number"
              min={0}
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div className="rounded-lg border p-3 text-sm">
            <span className="text-muted-foreground">Available: </span>
            <span className="font-medium">{availableBalance}</span>
          </div>
          <Button className="w-full" onClick={handleWithdraw} disabled={isLoading}>
            {isLoading ? "Processing..." : "Confirm Withdrawal"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}