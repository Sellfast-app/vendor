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
                V2 checkout routing
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
        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h3 className="text-sm font-semibold">Settlement account</h3>
            <p className="text-xs text-muted-foreground">
              Used for fiat settlement after Paystack, Nomba, Kuvarpay or
              Fincra webhook confirmation.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Bank</Label>
                <Select defaultValue="access">
                  <SelectTrigger>
                    <SelectValue placeholder="Select bank" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="access">Access Bank</SelectItem>
                    <SelectItem value="gtb">GTBank</SelectItem>
                    <SelectItem value="zenith">Zenith Bank</SelectItem>
                    <SelectItem value="uba">UBA</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Account number</Label>
                <Input placeholder="0123456789" />
              </div>
            </div>
            <div className="rounded-lg bg-[#F5F5F5] p-4 dark:bg-background">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-primary dark:bg-muted">
                  <Landmark className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-medium">Swiftree Demo Store</p>
                  <p className="text-xs text-muted-foreground">
                    Primary settlement account
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h3 className="text-sm font-semibold">Checkout fee preview</h3>
            <p className="text-xs text-muted-foreground">
              Shows how the V2 markup model routes fees before vendor wallet
              settlement.
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {[
              ["Base item price", "₦10,000"],
              ["Markup added to buyer", "₦500"],
              ["Transaction fee", "₦500"],
              ["Swiftree master wallet", "₦1,000"],
              ["Vendor instant wallet", "₦9,500"],
            ].map(([label, value], index) => (
              <div
                key={label}
                className={`flex items-center justify-between rounded-lg border p-3 text-sm ${
                  index >= 3 ? "bg-primary/5" : ""
                }`}
              >
                <span>{label}</span>
                <span className="font-medium">{value}</span>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              <Banknote className="h-4 w-4" />
              <span className="ml-2">View wallet ledger</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
