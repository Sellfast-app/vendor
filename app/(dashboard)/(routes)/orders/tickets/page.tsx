import { TicketWorkspace } from "@/components/ticket-workspace";
import { BusinessTypeGuard } from "@/components/business-type-guard";

export default function TicketOrdersPage() {
  return <BusinessTypeGuard allow={["ticketing"]} redirectTo="/dashboard"><div className="mx-auto min-h-screen px-4 py-6 sm:px-6 lg:px-8"><TicketWorkspace /></div></BusinessTypeGuard>;
}
