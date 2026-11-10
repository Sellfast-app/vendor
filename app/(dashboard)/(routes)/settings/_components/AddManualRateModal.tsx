"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export interface ManualRate {
  id: string;
  location: string;
  rate: number;
}

export const formatNaira = (value: number, currency = "NGN") =>
  new Intl.NumberFormat(undefined, { style: "currency", currency, maximumFractionDigits: 0 }).format(value);

interface AddManualRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRate: (rate: ManualRate) => void | Promise<void>;
  onUpdateRate: (rate: ManualRate) => void | Promise<void>;
  editingRate: ManualRate | null;
  isSaving?: boolean;
  currency?: string;
}

export default function AddManualRateModal({
  isOpen,
  onClose,
  onAddRate,
  onUpdateRate,
  editingRate,
  isSaving = false,
  currency = "NGN",
}: AddManualRateModalProps) {
  const [location, setLocation] = useState("");
  const [rate, setRate] = useState("");
  const [errors, setErrors] = useState<{ location?: string; rate?: string }>({});
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    if (editingRate) {
      setLocation(editingRate.location);
      setRate(String(editingRate.rate));
    } else {
      setLocation("");
      setRate("");
    }
    setErrors({});
    setSubmitError("");
  }, [isOpen, editingRate]);

  const handleRateChange = (value: string) => {
    const numeric = value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
    setRate(numeric);
    if (errors.rate) setErrors((prev) => ({ ...prev, rate: undefined }));
  };

  const numericRate = Number(rate);
  const isValidRate = rate !== "" && Number.isFinite(numericRate) && numericRate > 0;
  const currencySymbol = new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    currencyDisplay: "narrowSymbol",
  }).formatToParts(0).find((part) => part.type === "currency")?.value || currency;

  const handleSubmit = async () => {
    if (isSaving) return;
    const nextErrors: { location?: string; rate?: string } = {};

    if (!location.trim()) nextErrors.location = "Location is required";
    if (!rate) nextErrors.rate = "Rate is required";
    else if (!isValidRate) nextErrors.rate = "Enter a valid rate";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const manualRate = editingRate
      ? {
        ...editingRate,
        location: location.trim(),
        rate: numericRate,
      }
      : {
        id: `manual-rate-${Date.now()}`,
        location: location.trim(),
        rate: numericRate,
      };

    try {
      setSubmitError("");
      if (editingRate) await onUpdateRate(manualRate);
      else await onAddRate(manualRate);
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save manual rate");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open && !isSaving) onClose(); }}>
      <DialogOverlay className="backdrop-blur-xs bg-[#06140033] dark:bg-black/50" />
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-sm font-semibold">
            {editingRate ? "Edit manual rate" : "Add manual rate"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Set a flat shipping rate shown to buyers when automated logistics are
            not used.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {submitError && <p role="alert" className="text-xs text-red-600">{submitError}</p>}
          <div className="space-y-2">
            <Label htmlFor="manual-rate-location" className="text-xs">
              Location <span className="text-red-500">*</span>
            </Label>
            <Input
              id="manual-rate-location"
              placeholder="e.g. Lagos Mainland"
              value={location}
              onChange={(e) => {
                setLocation(e.target.value);
                if (errors.location)
                  setErrors((prev) => ({ ...prev, location: undefined }));
              }}
              className={errors.location ? "border-red-500" : ""}
            />
            {errors.location && (
              <p className="text-xs text-red-500">{errors.location}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="manual-rate-amount" className="text-xs">
              Rate <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {currencySymbol}
              </span>
              <Input
                id="manual-rate-amount"
                inputMode="numeric"
                placeholder="0"
                value={rate}
                onChange={(e) => handleRateChange(e.target.value)}
                className={`pl-8 ${errors.rate ? "border-red-500" : ""}`}
              />
            </div>
            {errors.rate && <p className="text-xs text-red-500">{errors.rate}</p>}
          </div>

          {isValidRate && (
            <div className="rounded-lg border bg-[#F7FFF9] p-4 dark:bg-primary/5">
              <p className="text-sm font-medium text-primary">
                Buyer sees: Manual shipping — {formatNaira(numericRate, currency)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This rate applies at checkout for the selected location.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isSaving}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            {isSaving ? "Saving..." : editingRate ? "Save Changes" : "Add Rate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
