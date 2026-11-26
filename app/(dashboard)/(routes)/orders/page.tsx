import OrdersTable from "./_components/OrdersTable";
import { BusinessTypeGuard } from "@/components/business-type-guard";

export default function OrdersPage() {
  return (
    <BusinessTypeGuard allow={["retail", "food"]} redirectTo="/orders/tickets">
      <main className="mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-6">
          <div>
            <p className="text-xs font-medium uppercase text-primary">Sales</p>
            <h1 className="mt-2 text-2xl font-semibold">Orders</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">Review and manage customer orders across your active sales channels.</p>
          </div>
        </header>
        <OrdersTable />
      </main>
    </BusinessTypeGuard>
  );
}
