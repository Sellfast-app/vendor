"use client";

import { Dialog, DialogContent, DialogOverlay, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { ReactNode, useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface WithdrawalConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (otp: string) => void;
  accountIcon: ReactNode;
  accountNumber: string;
  bankName: string;
  accountHolder: string;
  amount: string;
  email: string;
  onResendOTP?: () => void;
}

export default function WithdrawalConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  accountIcon,
  accountNumber,
  bankName,
  accountHolder,
  amount,
  email,
  onResendOTP,
}: WithdrawalConfirmationModalProps) {
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const [countdown, setCountdown] = useState(40);
  const [canResend, setCanResend] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (!isOpen) {
      setCountdown(40);
      setCanResend(false);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown, isOpen]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setOtp(["", "", "", "", "", ""]);
      setCountdown(40);
      setCanResend(false);
    }
  }, [isOpen]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").slice(0, 6);
    if (!/^\d+$/.test(pastedData)) return;

    const newOtp = [...otp];
    pastedData.split("").forEach((char, index) => {
      if (index < 6) newOtp[index] = char;
    });
    setOtp(newOtp);

    // Focus last filled input or next empty
    const nextIndex = Math.min(pastedData.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleConfirm = () => {
    const otpString = otp.join("");
    if (otpString.length === 6) {
      onConfirm(otpString);
    }
  };

  const handleResend = () => {
    if (canResend && onResendOTP) {
      onResendOTP();
      setCountdown(40);
      setCanResend(false);
      setOtp(["", "", "", "", "", ""]);
    }
  };

  const maskEmail = (email: string) => {
    const [username, domain] = email.split("@");
    if (!username || !domain) return email;
    const maskedUsername = username.slice(0, 3) + "***";
    return `${maskedUsername}@${domain}`;
  };

  const isOtpComplete = otp.every(digit => digit !== "");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
      <DialogContent className="sm:max-w-[500px] border-none rounded-lg p-6 bg-card">
        <VisuallyHidden>
          <DialogTitle>Confirm Withdrawal</DialogTitle>
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
                d="M12 14l0 -4"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 10l0 .01"
              />
            </svg>
          </div>

          {/* Heading */}
          <div className="text-center">
            <h3 className="text-base font-semibold mb-1">Withdraw Funds?</h3>
            <p className="text-xs text-muted-foreground">
              Are you sure you want to withdraw this money from your available balance, this action is irreversible?
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

          {/* OTP Section */}
          <div className="w-full space-y-4 pt-4">
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Enter 6-digit OTP sent to{" "}
                <span className="text-foreground">{maskEmail(email)}</span>
              </p>
            </div>

            {/* OTP Input Fields */}
            <div className="flex justify-center gap-2">
              {otp.map((digit, index) => (
                <Input
                  key={index}
                  ref={(el) => {
                    inputRefs.current[index] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className="w-12 h-12 text-center text-lg font-semibold"
                />
              ))}
            </div>

            {/* Resend OTP */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Didn&apos;t receive code?{" "}
                {canResend ? (
                  <button
                    onClick={handleResend}
                    className="text-green-500 hover:text-green-600 font-medium"
                  >
                    Resend
                  </button>
                ) : (
                  <span className="text-muted-foreground">
                    Resend in {countdown.toString().padStart(2, "0")}s
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button
            className="bg-green-500 hover:bg-green-600 text-white"
            onClick={handleConfirm}
            disabled={!isOtpComplete}
          >
            Confirm
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}