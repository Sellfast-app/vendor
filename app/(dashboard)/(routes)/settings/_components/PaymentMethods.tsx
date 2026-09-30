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
import {
  Banknote,
  Bitcoin,
  CreditCard,
  Landmark,
  QrCode,
  Smartphone,
  PlusIcon,
} from "lucide-react";

const providers = [
  {
    key: "paystack",
    title: "Paystack",
    description: "Cards, bank transfer and USSD for local checkout.",
    icon: CreditCard,
    active: true,
    channels: ["Website", "Web chat", "WhatsApp"],
  },
  {
    key: "nomba",
    title: "Nomba",
    description: "Cards, transfer and QR payment routes.",
    icon: QrCode,
    active: false,
    channels: ["Website", "Web chat"],
  },
  {
    key: "kuvarpay",
    title: "Kuvarpay Crypto",
    description: "Crypto checkout converted and settled to your local wallet.",
    icon: Bitcoin,
    active: true,
    channels: ["Website"],
  },
  {
    key: "pocket",
    title: "Pocket App / Fincra",
    description: "Alternative wallet and transfer rails for supported markets.",
    icon: Smartphone,
    active: false,
    channels: ["Website", "WhatsApp"],
  },
];

export default function PaymentMethods() {
  return (
    <div className="space-y-6">
      <Card className="shadow-none">
        <CardHeader className="border-b">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
                Checkout routing
              </p>
              <h2 className="mt-2 text-lg font-semibold">Payment methods</h2>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                Choose the payment providers customers can use across your
                website storefront, web chat and WhatsApp AI checkout.
              </p>
            </div>
            <Button>Save payment setup</Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 p-5 xl:grid-cols-2">
          {providers.map((provider) => (
            <div key={provider.key} className="rounded-xl border p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <provider.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{provider.title}</p>
                      {provider.active && (
                        <Badge className="bg-primary/10 text-primary" variant="outline">
                          Active
                        </Badge>
                      )}
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {provider.description}
                    </p>
                  </div>
                </div>
                <Switch defaultChecked={provider.active} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {provider.channels.map((channel) => (
                  <Badge key={channel} variant="secondary">
                    {channel}
                  </Badge>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Manual Rate Setup */}
        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h3 className="text-sm font-semibold">Manual rate setup</h3>
            <p className="text-xs text-muted-foreground">
              Flat rates shown to buyers when automated logistics are not used.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs">Location</Label>
                <Input placeholder="Enter location" defaultValue="Lagos Mainland" />
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Rate (₦)</Label>
                <Input placeholder="0" defaultValue="2500" />
              </div>
            </div>
            <div className="rounded-lg bg-[#D1FFDB] p-3 dark:bg-background">
              <p className="text-xs text-primary">
                <strong>Buyer sees:</strong> Manual shipping - ₦2,500
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Branch Pickup Locations */}
        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h3 className="text-sm font-semibold">Branch pickup locations</h3>
            <p className="text-xs text-muted-foreground">
              Localized pickup options can be restricted by customer state.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-3">
              {[
                { name: "Lekki branch", address: "Lekki Phase 1, Lagos", tag: "Pickup + local dispatch" },
                { name: "Ikeja branch", address: "Allen Avenue, Lagos", tag: "Pickup only" },
                { name: "Abuja branch", address: "Wuse 2, Abuja", tag: "Manual shipping" },
              ].map((branch) => (
                <div
                  key={branch.name}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <div>
                    <p className="text-sm font-medium">{branch.name}</p>
                    <p className="text-xs text-muted-foreground">{branch.address}</p>
                  </div>
                  <div className="flex gap-2 items-center">
                    <Badge variant="secondary" className="text-[10px]">{branch.tag}</Badge>
                    <Button size="sm" variant="outline">Edit</Button>
                    <Button size="sm" variant="destructive">Delete</Button>
                  </div>
                </div>
              ))}
            </div>
            <Button size="sm" variant="outline" className="w-full">
              <PlusIcon className="h-4 w-4 mr-1" /> Add pickup location
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}