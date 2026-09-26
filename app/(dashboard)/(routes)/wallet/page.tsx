"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Download,
  Landmark,
  RefreshCw,
  Wallet,
} from "lucide-react";

const ledgerRows = [
  {
    reference: "WEB-1048",
    channel: "Website Storefront",
    gross: "₦18,500",
    platform: "₦1,055",
    settlement: "₦17,445",
    status: "Settled",
  },
  {
    reference: "WA-0931",
    channel: "WhatsApp AI",
    gross: "₦9,000",
    platform: "₦770",
    settlement: "₦8,230",
    status: "Settled",
  },
  {
    reference: "EVT-2210",
    channel: "Ticketing",
    gross: "₦32,000",
    platform: "₦3,600",
    settlement: "₦28,400",
    status: "Pending",
  },
];

const channelStats = [
  { label: "Website", amount: "₦420,500", value: 68 },
  { label: "WhatsApp AI", amount: "₦184,000", value: 42 },
  { label: "Web Chat", amount: "₦96,250", value: 24 },
];

export default function WalletPage() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
            Instant wallet ledger
          </p>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight">
            Wallet
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Review available balance, split-payment deductions and settlements
            across website, chat and WhatsApp channels.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <RefreshCw className="h-4 w-4" />
            <span className="ml-2">Refresh</span>
          </Button>
          <Button>
            <ArrowUpRight className="h-4 w-4" />
            <span className="ml-2">Withdraw</span>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="overflow-hidden border-primary/20 bg-[#061400] text-white shadow-none">
          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-white/60">Available balance</p>
                <p className="mt-3 text-4xl font-semibold">₦701,250.00</p>
                <p className="mt-2 text-sm text-white/60">
                  Last webhook confirmation: 3 mins ago
                </p>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-[#061400]">
                <Wallet className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-8 grid gap-3 md:grid-cols-3">
              {[
                ["Pending", "₦42,000"],
                ["Withdrawn", "₦1.2m"],
                ["Platform fees", "₦86,430"],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-white/10 p-3">
                  <p className="text-xs text-white/60">{label}</p>
                  <p className="mt-1 text-lg font-semibold">{value}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h2 className="text-sm font-semibold">Connected settlement</h2>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center gap-3 rounded-lg border p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Landmark className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-medium">Access Bank</p>
                <p className="text-xs text-muted-foreground">
                  0123456789 . Swiftree Demo Store
                </p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline">
                <Banknote className="h-4 w-4" />
                <span className="ml-2">Add bank</span>
              </Button>
              <Button variant="outline">
                <Download className="h-4 w-4" />
                <span className="ml-2">Export</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <Card className="shadow-none">
          <CardHeader className="border-b">
            <h2 className="text-sm font-semibold">Channel performance</h2>
            <p className="text-xs text-muted-foreground">
              Revenue attributed from the V2 routing hub.
            </p>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            {channelStats.map((channel) => (
              <div key={channel.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>{channel.label}</span>
                  <span className="font-medium">{channel.amount}</span>
                </div>
                <Progress value={channel.value} />
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="shadow-none">
          <CardHeader className="border-b">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold">Ledger</h2>
                <p className="text-xs text-muted-foreground">
                  Split-payment preview for markup and transaction fee logic.
                </p>
              </div>
              <Badge variant="outline" className="border-primary/20 text-primary">
                Live mock
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-[#F5F5F5] dark:bg-background">
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Gross</TableHead>
                  <TableHead>Swiftree fee</TableHead>
                  <TableHead>Settlement</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ledgerRows.map((row) => (
                  <TableRow key={row.reference}>
                    <TableCell className="font-medium">{row.reference}</TableCell>
                    <TableCell>{row.channel}</TableCell>
                    <TableCell>{row.gross}</TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-red-600">
                        <ArrowDownLeft className="mr-1 h-3 w-3" />
                        {row.platform}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center text-primary">
                        <ArrowUpRight className="mr-1 h-3 w-3" />
                        {row.settlement}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={
                          row.status === "Settled"
                            ? "border-primary/20 bg-primary/10 text-primary"
                            : "border-amber-200 bg-amber-50 text-amber-700"
                        }
                      >
                        {row.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
