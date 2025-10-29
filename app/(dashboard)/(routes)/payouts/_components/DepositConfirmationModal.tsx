"use client";

import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface DepositConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  accountIcon: ReactNode;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  amount: string;
}

export default function DepositConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  accountIcon,
  accountNumber,
  bankName,
  accountHolder,
  amount,
}: DepositConfirmationModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleConfirm = async () => {
    setIsLoading(true);
    try {
      await onConfirm();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={isLoading ? undefined : onClose}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
      <DialogContent className="sm:max-w-[500px] border-none rounded-lg p-6 bg-card">
        <VisuallyHidden>
          <DialogTitle>Confirm Deposit</DialogTitle>
        </VisuallyHidden>
        
        <div className="flex-col items-center justify-between mb-4">
          <h2 className="text-sm font-semibold">Confirm Action</h2>
          <p className="text-xs font-light text-muted-foreground">
            Let&apos;s make sure you want to perform this action
          </p>
        </div>

        <div className="flex flex-col items-center space-y-4">
          {/* Icon */}
          <div className="flex items-center justify-center w-24 h-24 bg-green-500 rounded-full">
            <svg
              className="w-12 h-12 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10l0 4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 14l0 .01"
              />
            </svg>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h3 className="text-base font-semibold mb-1">Deposit Funds?</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to deposit this money to your available balance, this action is irreversible?
            </p>
          </div>

          {/* Account Details */}
          <div className="flex items-center justify-between w-full p-4 bg-gray-50 dark:bg-background rounded-lg">
            <div className="flex items-center gap-3 flex-1">
              {accountIcon}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{accountNumber}</span>
                <p className="text-xs text-gray-500">
                  {bankName} • {accountHolder}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium">₦{amount}</p>
              <p className="text-xs text-gray-500">₦{amount}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Close
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Depositing...
              </>
            ) : (
              'Confirm'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}