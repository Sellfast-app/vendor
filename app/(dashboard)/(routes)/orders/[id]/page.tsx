"use client"

import { ArrowLeft, ClipboardList, CreditCard, MapPin, PackageCheck } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const sections = [
  {
    icon: ClipboardList,
    title: "Order items",
    description: "Order line items will appear here once your first sale is completed.",
  },
  {
    icon: MapPin,
    title: "Delivery",
    description: "Fulfillment and delivery details will be available with a connected order.",
  },
  {
    icon: CreditCard,
    title: "Payment",
    description: "Payment status and settlement details will be available with a connected order.",
  },
]

export default function OrderDetailPage() {
  const router = useRouter()

  return (
    <main className="min-h-screen bg-[#FCFCFC] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <Button
          variant="ghost"
          className="mb-6 -ml-3 gap-2"
          onClick={() => router.push("/orders")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to orders
        </Button>

        <div className="mb-8">
          <p className="text-sm text-muted-foreground">Order details</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">No order selected</h1>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            Orders from your website, WhatsApp AI and web chat will appear here after the
            first completed sale.
          </p>
        </div>

        <Card className="border-dashed shadow-none">
          <CardContent className="flex flex-col items-center justify-center px-6 py-16 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <PackageCheck className="h-6 w-6" />
            </div>
            <h2 className="text-base font-semibold">Order details are not available yet</h2>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              This v2 preview is ready for omnichannel order data. Connect your sales channels
              to populate order records and fulfillment activity.
            </p>
            <Button className="mt-6" onClick={() => router.push("/orders")}>
              View orders
            </Button>
          </CardContent>
        </Card>

        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {sections.map(({ icon: Icon, title, description }) => (
            <Card key={title} className="shadow-none">
              <CardContent className="p-5">
                <Icon className="h-5 w-5 text-muted-foreground" />
                <h2 className="mt-4 text-sm font-semibold">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  )
}
