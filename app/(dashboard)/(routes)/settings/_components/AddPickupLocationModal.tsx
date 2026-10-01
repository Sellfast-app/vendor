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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  state: string;
  mode: string;
}

const pickupModes = [
  "Pickup only",
  "Pickup + local dispatch",
  "Manual shipping",
];

const nigerianStates = [
  "Abia", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue",
  "Borno", "Cross River", "Delta", "Ebonyi", "Edo", "Ekiti", "Enugu", "FCT - Abuja",
  "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara",
  "Lagos", "Nasarawa", "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers",
  "Sokoto", "Taraba", "Yobe", "Zamfara",
];

interface AddPickupLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocation: (location: PickupLocation) => void;
  onUpdateLocation: (location: PickupLocation) => void;
  editingLocation: PickupLocation | null;
}

export default function AddPickupLocationModal({
  isOpen,
  onClose,
  onAddLocation,
  onUpdateLocation,
  editingLocation,
}: AddPickupLocationModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [mode, setMode] = useState("");
  const [errors, setErrors] = useState<{
    name?: string;
    address?: string;
    state?: string;
    mode?: string;
  }>({});

  useEffect(() => {
    if (!isOpen) return;

    if (editingLocation) {
      setName(editingLocation.name);
      setAddress(editingLocation.address);
      setState(editingLocation.state);
      setMode(editingLocation.mode);
    } else {
      setName("");
      setAddress("");
      setState("");
      setMode("");
    }
    setErrors({});
  }, [isOpen, editingLocation]);

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = () => {
    const nextErrors: typeof errors = {};

    if (!name.trim()) nextErrors.name = "Location name is required";
    if (!address.trim()) nextErrors.address = "Address is required";
    if (!state) nextErrors.state = "Select a state";
    if (!mode) nextErrors.mode = "Select a fulfillment mode";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingLocation) {
      onUpdateLocation({
        ...editingLocation,
        name: name.trim(),
        address: address.trim(),
        state,
        mode,
      });
    } else {
      onAddLocation({
        id: `pickup-location-${Date.now()}`,
        name: name.trim(),
        address: address.trim(),
        state,
        mode,
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
            {editingLocation ? "Edit pickup location" : "Add pickup location"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Buyers can collect orders from this branch. Pickup options are shown
            based on the customer&apos;s localized state.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="pickup-location-name" className="text-xs">
              Location name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pickup-location-name"
              placeholder="e.g. Lekki branch"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                clearError("name");
              }}
              className={errors.name ? "border-red-500" : ""}
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup-location-address" className="text-xs">
              Address <span className="text-red-500">*</span>
            </Label>
            <Input
              id="pickup-location-address"
              placeholder="e.g. Lekki Phase 1, Lagos"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                clearError("address");
              }}
              className={errors.address ? "border-red-500" : ""}
            />
            {errors.address && (
              <p className="text-xs text-red-500">{errors.address}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup-location-state" className="text-xs">
              State <span className="text-red-500">*</span>
            </Label>
            <Select
              value={state}
              onValueChange={(value) => {
                setState(value);
                clearError("state");
              }}
            >
              <SelectTrigger
                id="pickup-location-state"
                className={`w-full ${errors.state ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {nigerianStates.map((stateName) => (
                  <SelectItem key={stateName} value={stateName}>
                    {stateName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup-location-mode" className="text-xs">
              Fulfillment mode <span className="text-red-500">*</span>
            </Label>
            <Select
              value={mode}
              onValueChange={(value) => {
                setMode(value);
                clearError("mode");
              }}
            >
              <SelectTrigger
                id="pickup-location-mode"
                className={`w-full ${errors.mode ? "border-red-500" : ""}`}
              >
                <SelectValue placeholder="Select mode" />
              </SelectTrigger>
              <SelectContent>
                {pickupModes.map((pickupMode) => (
                  <SelectItem key={pickupMode} value={pickupMode}>
                    {pickupMode}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.mode && <p className="text-xs text-red-500">{errors.mode}</p>}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-green-500 text-white hover:bg-green-600"
          >
            {editingLocation ? "Save Changes" : "Add Location"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
