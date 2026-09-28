"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Bike,
  Boxes,
  Building2,
  MapPin,
  PackageCheck,
  Truck,
} from "lucide-react";

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
    status: "Preview",
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

const branchRows = [
  ["Lekki branch", "Lekki Phase 1, Lagos", "Pickup + local dispatch"],
  ["Ikeja branch", "Allen Avenue, Lagos", "Pickup only"],
  ["Abuja branch", "Wuse 2, Abuja", "Manual shipping"],
];

export default function LogisticsSettings() {
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
            <h3 className="text-sm font-semibold">Manual rate preview</h3>
            <p className="text-xs text-muted-foreground">
              Flat rates shown to buyers when automated logistics are not used.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Location</Label>
                <Input defaultValue="Lagos Mainland" />
              </div>
              <div className="space-y-2">
                <Label>Rate</Label>
                <Input defaultValue="₦2,500" />
              </div>
            </div>
            <div className="rounded-lg border bg-[#F7FFF9] p-4">
              <p className="text-sm font-medium text-primary">
                Buyer sees: Manual shipping - ₦2,500
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Use this for custom regions, local vendor delivery and branch
                fulfillment.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h3 className="text-sm font-semibold">Branch pickup locations</h3>
            <p className="text-xs text-muted-foreground">
              Localized pickup options can be restricted by customer state.
            </p>
          </CardHeader>
          <CardContent className="divide-y p-0">
            {branchRows.map(([name, address, mode]) => (
              <div
                key={name}
                className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between"
              >
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F5F5] text-primary">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{address}</p>
                  </div>
                </div>
                <Badge variant="secondary">{mode}</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
