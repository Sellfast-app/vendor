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
import BranchCatalogSettings from "./BranchCatalogSettings";
import { isV2FoodBusiness, isV2RetailBusiness, V2_COUNTRY_INFO, type V2Country } from "@/lib/v2";

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
    mode: "gig",
    supported: true,
  },
  {
    title: "Sendbox",
    description: "Automated quote, pickup and shipment creation.",
    icon: PackageCheck,
    mode: "sendbox",
    supported: true,
  },
  {
    title: "Bolt Delivery",
    description: "Instant city dispatch for supported local orders.",
    icon: Bike,
    mode: "bolt",
    supported: false,
  },
  {
    title: "Manual shipping",
    description: "Vendor-defined flat rates by city, state or region.",
    icon: Boxes,
    mode: "vendor",
    supported: true,
  },
  {
    title: "Branch pickup",
    description: "Let buyers collect from an eligible nearby branch.",
    icon: Building2,
    mode: "pickup",
    supported: true,
  },
  {
    title: "Relay",
    description: "On-demand local delivery for supported food orders.",
    icon: Bike,
    mode: "relay",
    supported: true,
  },
];

export default function LogisticsSettings() {
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [editingRate, setEditingRate] = useState<ManualRate | null>(null);
  const [editingLocation, setEditingLocation] = useState<PickupLocation | null>(null);
  const [manualRates, setManualRates] = useState<ManualRate[]>([]);
  const [pickupLocations, setPickupLocations] = useState<PickupLocation[]>([]);
  const [storeCountry, setStoreCountry] = useState<string | undefined>();
  const [catalogType, setCatalogType] = useState<"retail" | "food" | null>(null);
  const [enabledModes, setEnabledModes] = useState<string[]>([]);
  const [isLoadingModes, setIsLoadingModes] = useState(true);
  const [savingMode, setSavingMode] = useState<string | null>(null);
  const [isSavingRates, setIsSavingRates] = useState(false);

  useEffect(() => {
    const loadManualRates = async () => {
      try {
        const response = await fetch("/api/store", { cache: "no-store" });
        const result = await response.json();
        const storeDetails = result.data?.storeDetails;
        const metadata = storeDetails?.metadata || {};
        const businessType = metadata.v2?.business_type || storeDetails?.business_type;
        const foodStore = isV2FoodBusiness(businessType);
        const storeCatalog = isV2RetailBusiness(businessType) ? "retail" : foodStore ? "food" : null;
        setCatalogType(storeCatalog);
        const country = metadata.v2?.country;
        if (typeof country === "string") setStoreCountry(country.toUpperCase());
        const storedModes = storeDetails?.enabled_fulfillment_modes;
        const modes = Array.isArray(storedModes) ? storedModes.filter((mode): mode is string => typeof mode === "string") : [];
        const validModes = foodStore ? modes : modes.filter((mode) => mode !== "relay");
        setEnabledModes(validModes);
        if (validModes.length !== modes.length) {
          const cleanupResponse = await fetch("/api/store", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ enabled_fulfillment_modes: validModes }),
          });
          if (!cleanupResponse.ok) throw new Error("Unable to remove unsupported Relay delivery setting");
        }
        const rates = metadata.manual_shipping_rates;

        if (Array.isArray(rates)) {
          setManualRates(rates.flatMap((rate): ManualRate[] => {
            const amount = Number(rate?.rate);
            return typeof rate?.id === "string" && typeof rate?.location === "string" && Number.isFinite(amount) && amount > 0
              ? [{ id: rate.id, location: rate.location, rate: amount }]
              : [];
          }));
        }
        const branchesResponse = await fetch("/api/branches", { cache: "no-store" });
        const branchesResult = await branchesResponse.json();
        if (!branchesResponse.ok) throw new Error(branchesResult.message || "Unable to load branches");
        setPickupLocations(Array.isArray(branchesResult.data) ? branchesResult.data.map((branch: Record<string, unknown>) => ({
          id: String(branch.id), name: String(branch.name), address: String(branch.address), city: String(branch.city),
          state: String(branch.region), country: String(branch.country), currency: String(branch.currency),
          is_default_online: Boolean(branch.is_default_online),
        })) : []);
      } catch (error) {
        console.error("Failed to load manual shipping rates:", error);
        toast.error(error instanceof Error ? error.message : "Failed to load logistics settings");
      } finally {
        setIsLoadingModes(false);
      }
    };

    loadManualRates();
  }, []);

  const persistManualRates = async (rates: ManualRate[]) => {
    const previousRates = manualRates;
    setManualRates(rates);
    setIsSavingRates(true);
    try {
      const response = await fetch("/api/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ metadata: { manual_shipping_rates: rates } }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || result.message || "Failed to save manual shipping rates");
      }
    } catch (error) {
      setManualRates(previousRates);
      throw error;
    } finally {
      setIsSavingRates(false);
    }
  };

  const toggleFulfillmentMode = async (mode: string, checked: boolean) => {
    if (savingMode) return;
    if (mode === "relay" && catalogType !== "food") return;
    const nextModes = checked
      ? [...new Set([...enabledModes, mode])]
      : enabledModes.filter((enabledMode) => enabledMode !== mode);
    if (nextModes.length === 0) {
      toast.error("At least one delivery method must remain enabled");
      return;
    }

    const previousModes = enabledModes;
    setEnabledModes(nextModes);
    setSavingMode(mode);
    try {
      const response = await fetch("/api/store", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled_fulfillment_modes: nextModes }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || result.message || "Failed to save delivery method");
      toast.success("Delivery methods updated");
    } catch (error) {
      setEnabledModes(previousModes);
      toast.error(error instanceof Error ? error.message : "Failed to save delivery method");
    } finally {
      setSavingMode(null);
    }
  };

  const persistPickupLocations = (locations: PickupLocation[]) => setPickupLocations(locations);

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
    await persistManualRates([...manualRates, rate]);
    toast.success(`Manual rate for ${rate.location} added`);
  };

  const handleUpdateRate = async (rate: ManualRate) => {
    await persistManualRates(
      manualRates.map((item) => (item.id === rate.id ? rate : item))
    );
    toast.success(`Manual rate for ${rate.location} updated`);
  };

  const handleRemoveRate = async (id: string) => {
    try {
      await persistManualRates(manualRates.filter((rate) => rate.id !== id));
      toast.success("Manual rate removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove manual rate");
    }
  };

  const currency = storeCountry && storeCountry in V2_COUNTRY_INFO
    ? V2_COUNTRY_INFO[storeCountry as V2Country].currency
    : "NGN";

  const handleAddLocation = async (location: PickupLocation) => {
    const response = await fetch("/api/branches", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: location.name, address: location.address, city: location.city, region: location.state, country: location.country, currency: location.currency, is_default_online: location.is_default_online }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to add branch");
    await persistPickupLocations([...pickupLocations, { ...location, id: result.data.id, is_default_online: result.data.is_default_online }]);
    toast.success(`${location.name} added`);
  };

  const handleUpdateLocation = async (location: PickupLocation) => {
    const response = await fetch(`/api/branches/${encodeURIComponent(location.id)}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: location.name, address: location.address, city: location.city, region: location.state, country: location.country, currency: location.currency, is_default_online: location.is_default_online }) });
    const result = await response.json();
    if (!response.ok) throw new Error(result.message || "Failed to update branch");
    await persistPickupLocations(pickupLocations.map((item) => item.id === location.id ? { ...location, is_default_online: result.data.is_default_online } : { ...item, is_default_online: location.is_default_online ? false : item.is_default_online }));
    toast.success(`${location.name} updated`);
  };

  const handleRemoveLocation = async (id: string) => {
    try {
      const response = await fetch(`/api/branches/${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.message || "Failed to remove branch");
      const remaining = pickupLocations.filter((location) => location.id !== id);
      if (!remaining.some((location) => location.is_default_online) && remaining[0]) remaining[0].is_default_online = true;
      await persistPickupLocations(remaining);
      toast.success("Pickup location removed");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to remove pickup location");
    }
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
                Choose the delivery options available at checkout. Changes save automatically.
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 xl:grid-cols-2">
          {logisticsModes.filter((mode) => mode.mode !== "relay" || catalogType === "food").map((mode) => (
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
                        className={enabledModes.includes(mode.mode)
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-amber-200 bg-amber-50 text-amber-700"}
                      >
                        {!mode.supported ? "Coming soon" : enabledModes.includes(mode.mode) ? "Enabled" : "Available"}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {mode.description}
                    </p>
                  </div>
                </div>
                <Switch
                  checked={enabledModes.includes(mode.mode)}
                  onCheckedChange={(checked) => toggleFulfillmentMode(mode.mode, checked)}
                  disabled={!mode.supported || isLoadingModes || savingMode !== null}
                  aria-label={`${mode.title} ${enabledModes.includes(mode.mode) ? "enabled" : "disabled"}`}
                />
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
              <Button size="sm" onClick={openAddRateModal} disabled={isSavingRates}>
                <Plus className="h-4 w-4" />
                Add manual rate
              </Button>
            </div>
          </CardHeader>
          <CardContent id="branch-pickup-locations" className="p-5">
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
                          Buyer sees: Manual shipping — {formatNaira(rate.rate, currency)}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="text-sm font-semibold text-primary">
                        {formatNaira(rate.rate, currency)}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => openEditRateModal(rate)}
                        aria-label={`Edit manual rate for ${rate.location}`}
                        disabled={isSavingRates}
                      >
                        <EditIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-red-600"
                        onClick={() => handleRemoveRate(rate.id)}
                        aria-label={`Remove manual rate for ${rate.location}`}
                        disabled={isSavingRates}
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
                        <p className="truncate text-xs text-muted-foreground">{location.address} · {location.city}, {location.state} · {location.currency}</p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Badge variant="secondary">{location.is_default_online ? "Default" : "Branch"}</Badge>
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

        <BranchCatalogSettings branches={pickupLocations.map(({ id, name, currency }) => ({ id, name, currency }))} catalogType={catalogType} />
      </div>

      <AddManualRateModal
        isOpen={isRateModalOpen}
        onClose={() => setIsRateModalOpen(false)}
        onAddRate={handleAddRate}
        onUpdateRate={handleUpdateRate}
        editingRate={editingRate}
        isSaving={isSavingRates}
        currency={currency}
      />
      <AddPickupLocationModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        onAddLocation={handleAddLocation}
        onUpdateLocation={handleUpdateLocation}
        editingLocation={editingLocation}
        storeCountry={storeCountry}
      />
    </div>
  );
}
