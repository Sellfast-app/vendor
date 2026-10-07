"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Bike,
  Boxes,
  Building2,
  MapPin,
  MapPinPlus,
  PackageCheck,
  Plus,
  Trash2,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import AddManualRateModal, {
  formatNaira,
  type ManualRate,
} from "./AddManualRateModal";
import AddPickupLocationModal, {
  type PickupLocation,
} from "./AddPickupLocationModal";

const EditIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const logisticsModes = [
  {
    title: "GIG Logistics",
    description: "Nationwide automated dispatch with tracking links.",
    icon: Truck,
    active: true,
    status: "Connected",
  },
  {
    title: "Sendbox",
    description: "Automated quote, pickup and shipment creation.",
    icon: PackageCheck,
    active: true,
    status: "Connected",
  },
  {
    title: "Bolt Delivery",
    description: "Instant city dispatch for supported local orders.",
    icon: Bike,
    active: false,
    status: "Available",
  },
  {
    title: "Manual shipping",
    description: "Vendor-defined flat rates by city, state or region.",
    icon: Boxes,
    active: true,
    status: "Manual",
  },
  {
    title: "Branch pickup",
    description: "Let buyers collect from an eligible nearby branch.",
    icon: Building2,
    active: false,
    status: "Setup needed",
  },
];

export default function LogisticsSettings() {
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ManualRate | null>(null);
  const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(null);
  const [manualRates, setManualRates] = useState<ManualRate[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);

  useEffect(() => {
    const loadManualRates = async () => {
      try {
        const response = await fetch("/api/store", { cache: "no-store" });
        const result = await response.json();
        const rates = result.data?.storeDetails?.metadata?.manual_shipping_rates;

        if (Array.isArray(rates)) {
          setManualRates(
            rates.filter(
              (rate): rate is ManualRate =>
                typeof rate?.id === "string" &&
                typeof rate?.location === "string" &&
                typeof rate?.rate === "number" &&
                Number.isFinite(rate.rate) &&
                rate.rate > 0
            )
          );
        }
      } catch (error) {
        console.error("Failed to load manual shipping rates:", error);
      }
    };

    loadManualRates();
  }, []);

  const persistManualRates = async (rates: ManualRate[]) => {
    const response = await fetch("/api/store", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ metadata: { manual_shipping_rates: rates } }),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || result.message || "Failed to save manual shipping rates");
    }
    setManualRates(rates);
  };

  const openAddRateModal = () => {
    setEditingRate(null);
    setIsRateModalOpen(true);
  };

  const openEditRateModal = (rate: ManualRate) => {
    setEditingRate(rate);
    setIsRateModalOpen(true);
  };

  const openAddLocationModal = () => {
    setEditingLocation(null);
    setIsLocationModalOpen(true);
  };

  const openEditLocationModal = (location: PickupLocation) => {
    setEditingLocation(location);
    setIsLocationModalOpen(true);
  };

  const handleAddRate = async (rate: ManualRate) => {
    try {
      await persistManualRates([...manualRates, rate]);
      toast.success(`Manual rate for ${rate.location} added`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to save manual rate");
    }
  };

  const handleUpdateRate = async (rate: ManualRate) => {
    try {
      await persistManualRates(
        manualRates.map((item) => (item.id === rate.id ? rate : item))
      );
      toast.success(`Manual rate for ${rate.location} updated`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to update manual rate");
    }
  };

  const handleRemoveRate = async (id: string) => {
    try {
      await persistManualRates(manualRates.filter((rate) => rate.id !== id));
      toast.success("Manual rate removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove manual rate");
    }
  };

  const handleAddLocation = (location: PickupLocation) => {
    setPickupLocations((current) => [...current, location]);
    toast.success(`${location.name} added`);
  };

  const handleUpdateLocation = (location: PickupLocation) => {
    setPickupLocations((current) =>
      current.map((item) => (item.id === location.id ? location : item))
    );
    toast.success(`${location.name} updated`);
  };

  const handleRemoveLocation = (id: string) => {
    setPickupLocations((current) =>
      current.filter((location) => location.id !== id)
    );
    toast.success("Pickup location removed");
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Fulfillment routing
              </p>
              <h2 className="mt-2 text-lg font-semibold">Logistics modes</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Configure the delivery options that appear on website, web chat
                and WhatsApp checkout.
              </p>
            </div>
            <Button>Save logistics setup</Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 xl:grid-cols-2">
          {logisticsModes.map((mode) => (
            <div key={mode.title} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <mode.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium">{mode.title}</p>
                      <Badge
                        variant="outline"
                        className={
                          mode.active
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                      >
                        {mode.status}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {mode.description}
                    </p>
                  </div>
                </div>
                <Switch defaultChecked={mode.active} />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <Card className="shadow-none">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">Manual rate setup</h3>
                <p className="text-xs text-muted-foreground">
                  Flat rates shown to buyers when automated logistics are not
                  used.
                </p>
              </div>
              <Button size="sm" onClick={openAddRateModal}>
                <Plus className="h-4 w-4" />
                Add manual rate
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {manualRates.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                <Boxes className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-medium">No manual rates yet</p>
                <p className="text-xs text-muted-foreground">
                  Add a location and flat rate to charge buyers manually.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {manualRates.map((rate) => (
                  <div
                    key={rate.id}
                    className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {rate.location}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Buyer sees: Manual shipping — {formatNaira(rate.rate)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-sm font-semibold text-primary">
                        {formatNaira(rate.rate)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => openEditRateModal(rate)}
                        aria-label={`Edit manual rate for ${rate.location}`}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => handleRemoveRate(rate.id)}
                        aria-label={`Remove manual rate for ${rate.location}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold">
                  Branch pickup locations
                </h3>
                <p className="text-xs text-muted-foreground">
                  Localized pickup options can be restricted by customer state.
                </p>
              </div>
              <Button size="sm" onClick={openAddLocationModal}>
                <MapPinPlus className="h-4 w-4" />
                Add pickup location
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            {pickupLocations.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-center">
                <Building2 className="h-8 w-8 text-muted-foreground/60" />
                <p className="text-sm font-medium">No pickup locations yet</p>
                <p className="text-xs text-muted-foreground">
                  Add branch addresses buyers can collect orders from.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {pickupLocations.map((location) => (
                  <div
                    key={location.id}
                    className="flex flex-col gap-3 py-3 first:pt-0 last:pb-0 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="flex min-w-0 gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#F5F5F5] text-primary">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">
                          {location.name}
                        </p>
                        <p className="truncate text-xs text-muted-foreground">
                          {location.address} · {location.state}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Badge variant="secondary">{location.mode}</Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => openEditLocationModal(location)}
                        aria-label={`Edit ${location.name}`}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => handleRemoveLocation(location.id)}
                        aria-label={`Remove ${location.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <AddManualRateModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        onAddRate={handleAddRate}
        onUpdateRate={handleUpdateRate}
        editingRate={editingRate}
      />
      <AddPickupLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onAddLocation={handleAddLocation}
        onUpdateLocation={handleUpdateLocation}
        editingLocation={editingLocation}
      />
    </div>
  );
}
