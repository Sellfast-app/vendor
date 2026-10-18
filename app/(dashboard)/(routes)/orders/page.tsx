import Link from "next/link";
import { Button } from "@/components/ui/button";
import OrdersTable from "./_components/OrdersTable";

export default function OrdersPage() {
  return (
    <main className="mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase text-primary">Sales</p>
          <h1 className="mt-2 text-2xl font-semibold">Orders</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Review and manage customer orders across your active sales channels.</p>
        </div>
        <Button variant="outline" asChild><Link href="/orders/tickets">Ticket orders</Link></Button>
      </header>
      <OrdersTable />
    </main>
  );
}
