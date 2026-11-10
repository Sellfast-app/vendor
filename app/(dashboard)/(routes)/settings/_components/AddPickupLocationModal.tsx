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
  city: string;
  state: string;
  country: string;
  currency: string;
  is_default_online: boolean;
}

const markets = [
  { country: "NG", label: "Nigeria", currency: "NGN" },
  { country: "KE", label: "Kenya", currency: "KES" },
  { country: "GH", label: "Ghana", currency: "GHS" },
  { country: "ZA", label: "South Africa", currency: "ZAR" },
];

interface AddPickupLocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddLocation: (location: PickupLocation) => void | Promise<void>;
  onUpdateLocation: (location: PickupLocation) => void | Promise<void>;
  editingLocation: PickupLocation | null;
  storeCountry?: string;
}

export default function AddPickupLocationModal({
  isOpen,
  onClose,
  onAddLocation,
  onUpdateLocation,
  editingLocation,
  storeCountry,
}: AddPickupLocationModalProps) {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [city, setCity] = useState("");
  const [country, setCountry] = useState("NG");
  const [isDefault, setIsDefault] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string;
    address?: string;
    state?: string;
    city?: string;
  }>({});
  const [submitError, setSubmitError] = useState("");
  const availableMarkets = markets.filter((market) => !storeCountry || market.country === storeCountry.toUpperCase());

  useEffect(() => {
    if (!isOpen) return;

    if (editingLocation) {
      setName(editingLocation.name);
      setAddress(editingLocation.address);
      setState(editingLocation.state);
      setCity(editingLocation.city);
      setCountry(editingLocation.country);
      setIsDefault(editingLocation.is_default_online);
    } else {
      setName("");
      setAddress("");
      setState("");
      setCity("");
      setCountry(markets[0]?.country || "NG");
      setIsDefault(false);
    }
    setErrors({});
    setSubmitError("");
  }, [isOpen, editingLocation]);

  useEffect(() => {
    if (!isOpen || editingLocation || name.trim() || !storeCountry) return;
    if (markets.some((market) => market.country === storeCountry.toUpperCase())) {
      setCountry(storeCountry.toUpperCase());
    }
  }, [isOpen, editingLocation, name, storeCountry]);

  const clearError = (field: keyof typeof errors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    const nextErrors: typeof errors = {};

    if (!name.trim()) nextErrors.name = "Location name is required";
    if (!address.trim()) nextErrors.address = "Address is required";
    if (!state.trim()) nextErrors.state = "Enter a state or region";
    if (!city.trim()) nextErrors.city = "Enter a city";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    const location = {
      ...(editingLocation || { id: "" }),
      name: name.trim(),
      address: address.trim(),
      city: city.trim(),
      state: state.trim(),
      country,
      currency: availableMarkets.find((market) => market.country === country)?.currency || "NGN",
      is_default_online: isDefault,
    };
    try {
      if (editingLocation) await onUpdateLocation(location);
      else await onAddLocation(location);
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to save pickup location");
    }
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
            Add a physical branch address for pickup. Manage branch-specific catalog and prices under Branch catalog settings.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          {submitError && <p role="alert" className="text-xs text-red-600">{submitError}</p>}
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
              placeholder="Street address"
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
              City <span className="text-red-500">*</span>
            </Label>
            <Input id="pickup-location-city" value={city} placeholder="e.g. Lagos" onChange={event => { setCity(event.target.value); clearError("city"); }} />
            {errors.city && <p className="text-xs text-red-500">{errors.city}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup-location-state" className="text-xs">State / region <span className="text-red-500">*</span></Label>
            <Input id="pickup-location-state" value={state} placeholder="e.g. Lagos State" onChange={event => { setState(event.target.value); clearError("state"); }} />
            {errors.state && <p className="text-xs text-red-500">{errors.state}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="pickup-location-country" className="text-xs">Country and currency</Label>
            <Select value={country} onValueChange={setCountry} disabled={!storeCountry || availableMarkets.length === 1}>
              <SelectTrigger id="pickup-location-country" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{availableMarkets.map(market => <SelectItem key={market.country} value={market.country}>{market.label} ({market.currency})</SelectItem>)}</SelectContent>
            </Select>
          </div>

          <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={isDefault} onChange={event => setIsDefault(event.target.checked)} className="h-4 w-4 accent-primary" />Default storefront branch</label>
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
