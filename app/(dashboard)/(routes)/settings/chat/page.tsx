import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TawkChat from "./TawkChat";

export default function SupportChatPage() {
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 border-b pb-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/settings" aria-label="Back to support settings">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-base font-semibold">Chat Support</h1>
          <p className="text-sm text-muted-foreground">
            Speak with the Swiftree support team.
          </p>
        </div>
      </div>
      <TawkChat />
    </div>
  );
}
