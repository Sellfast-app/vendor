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

export const formatNaira = (value: number) => `₦${value.toLocaleString("en-NG")}`;

interface AddManualRateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddRate: (rate: ManualRate) => void;
  onUpdateRate: (rate: ManualRate) => void;
  editingRate: ManualRate | null;
}

export default function AddManualRateModal({
  isOpen,
  onClose,
  onAddRate,
  onUpdateRate,
  editingRate,
}: AddManualRateModalProps) {
  const [location, setLocation] = useState("");
  const [rate, setRate] = useState("");
  const [errors, setErrors] = useState<{ location?: string; rate?: string }>({});

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
  }, [isOpen, editingRate]);

  const handleRateChange = (value: string) => {
    const numeric = value.replace(/[^\d]/g, "").replace(/^0+(?=\d)/, "");
    setRate(numeric);
    if (errors.rate) setErrors((prev) => ({ ...prev, rate: undefined }));
  };

  const numericRate = Number(rate);
  const isValidRate = rate !== "" && Number.isFinite(numericRate) && numericRate > 0;

  const handleSubmit = () => {
    const nextErrors: { location?: string; rate?: string } = {};

    if (!location.trim()) nextErrors.location = "Location is required";
    if (!rate) nextErrors.rate = "Rate is required";
    else if (!isValidRate) nextErrors.rate = "Enter a valid rate";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingRate) {
      onUpdateRate({
        ...editingRate,
        location: location.trim(),
        rate: numericRate,
      });
    } else {
      onAddRate({
        id: `manual-rate-${Date.now()}`,
        location: location.trim(),
        rate: numericRate,
      });
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
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
                ₦
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
                Buyer sees: Manual shipping — {formatNaira(numericRate)}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                This rate applies at checkout for the selected location.
              </p>
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            {editingRate ? "Save Changes" : "Add Rate"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
