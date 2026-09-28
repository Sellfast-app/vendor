"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Globe2, MapPinned, Navigation, WalletCards } from "lucide-react";

const markets = [
  ["Nigeria", "NGN", "Lagos, Abuja, Port Harcourt", "Active"],
  ["United Kingdom", "GBP", "London, Manchester", "Preview"],
  ["Kenya", "KES", "Nairobi, Mombasa", "Preview"],
  ["Ghana", "GHS", "Accra, Kumasi", "Preview"],
  ["Rwanda", "RWF", "Kigali", "Preview"],
];

const localizedRules = [
  "Detect customer country from IP on storefront entry.",
  "Show local currency labels before checkout.",
  "Limit pickup branches to the selected customer state.",
  "Keep vendor settlement in the configured wallet currency.",
];

const customerPreview = [
  { icon: Navigation, label: "Detected region", value: "Lagos, Nigeria" },
  { icon: WalletCards, label: "Display currency", value: "NGN" },
  { icon: MapPinned, label: "Pickup scope", value: "Lagos branches only" },
];

export default function LocalizationSettings() {
  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Geolocation engine
              </p>
              <h2 className="mt-2 text-lg font-semibold">
                Markets, currency and branches
              </h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Control how the storefront adapts by customer country, state and
                available fulfillment locations.
              </p>
            </div>
            <Button>Save localization</Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 xl:grid-cols-[0.85fr_1.15fr]">
          <div className="rounded-xl border bg-[#061400] p-5 text-white">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-[#061400]">
              <Globe2 className="h-5 w-5" />
            </div>
            <h3 className="mt-5 text-lg font-semibold">Auto-localized storefront</h3>
            <p className="mt-2 text-sm text-white/65">
              Customers see localized currency and eligible pickup branches
              while payments still route through enabled providers.
            </p>
            <div className="mt-6 space-y-3">
              {localizedRules.map((rule) => (
                <div key={rule} className="rounded-lg bg-white/10 p-3 text-sm">
                  {rule}
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {markets.map(([country, currency, coverage, status]) => (
              <div
                key={country}
                className="flex flex-col gap-3 rounded-xl border p-4 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium">{country}</p>
                    <Badge
                      variant="outline"
                      className={
                        status === "Active"
                          ? "border-primary/20 bg-primary/10 text-primary"
                          : "border-amber-200 bg-amber-50 text-amber-700"
                      }
                    >
                      {status}
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {currency} . {coverage}
                  </p>
                </div>
                <Switch defaultChecked={status === "Active"} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="shadow-none xl:col-span-2">
          <CardHeader className="border-b">
            <h3 className="text-sm font-semibold">Default storefront market</h3>
          </CardHeader>
          <CardContent className="grid gap-4 p-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Country</Label>
              <Select defaultValue="nigeria">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nigeria">Nigeria</SelectItem>
                  <SelectItem value="uk">United Kingdom</SelectItem>
                  <SelectItem value="kenya">Kenya</SelectItem>
                  <SelectItem value="ghana">Ghana</SelectItem>
                  <SelectItem value="rwanda">Rwanda</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Currency</Label>
              <Input defaultValue="NGN" />
            </div>
            <div className="space-y-2">
              <Label>Fallback state</Label>
              <Input defaultValue="Lagos" />
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h3 className="text-sm font-semibold">Customer preview</h3>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {customerPreview.map((item) => (
              <div key={item.label} className="flex items-center gap-3 rounded-lg border p-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <item.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="text-sm font-medium">{item.value}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
