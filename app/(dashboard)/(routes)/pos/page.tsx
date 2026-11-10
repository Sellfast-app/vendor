import Link from "next/link";
import { ArrowUpRight, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function PosPage() {
  return (
    <main className="mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-primary">Sales</p>
        <h1 className="mt-2 text-xl font-semibold">Point of sale</h1>
      </header>
      <Card className="shadow-none">
        <CardContent className="flex min-h-64 flex-col items-center justify-center p-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/10 text-primary">
            <Store className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-base font-semibold">POS checkout is not connected yet</h2>
          <p className="mt-2 max-w-md text-sm text-muted-foreground">
            No in-person sale endpoint is available in this V2 integration. Online orders continue to appear in Orders.
          </p>
          <Button asChild variant="outline" className="mt-4">
            <Link href="/products">Open catalog <ArrowUpRight className="ml-2 h-4 w-4" /></Link>
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
