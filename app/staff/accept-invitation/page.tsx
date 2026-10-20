"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";

function AcceptStaffInvitationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState<"ready" | "loading" | "accepted" | "error" | "unauthenticated">("ready");
  const [message, setMessage] = useState("");

  async function accept() {
    setState("loading"); setMessage("");
    try {
      const response = await fetch("/api/vendor/staff/invitations/accept", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (response.status === 401) { setState("unauthenticated"); setMessage("Sign in with the email address that received this invitation, then return here to accept it."); return; }
      if (!response.ok || result.status !== "success") throw new Error(result.message || "This invitation could not be accepted.");
      setState("accepted"); setMessage("Your staff access is active. Sign in again if the dashboard does not update your access automatically.");
    } catch (error) {
      setState("error"); setMessage(error instanceof Error ? error.message : "This invitation could not be accepted.");
    }
  }

  const returnPath = `/staff/accept-invitation?token=${encodeURIComponent(token)}`;
  return <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-5 py-12">
    <h1 className="text-2xl font-semibold">Staff invitation</h1>
    <p className="mt-2 text-sm text-muted-foreground">Accept access to a Swiftree vendor workspace.</p>
    {message && <p role={state === "error" ? "alert" : "status"} className="mt-5 rounded-md border p-4 text-sm">{message}</p>}
    <div className="mt-6 flex flex-wrap gap-3">
      {state !== "accepted" && <Button onClick={() => void accept()} disabled={state === "loading" || !token}>{state === "loading" ? "Accepting..." : "Accept invitation"}</Button>}
      {state === "unauthenticated" && <Button variant="outline" asChild><Link href={`/login?from=${encodeURIComponent(returnPath)}`}>Sign in</Link></Button>}
      {state === "accepted" && <Button asChild><Link href="/dashboard">Open dashboard</Link></Button>}
    </div>
    {!token && <p className="mt-4 text-sm text-destructive">Invitation token is missing. Open the complete link from your invitation email.</p>}
  </main>;
}

export default function AcceptStaffInvitationPage() {
  return <Suspense fallback={<main className="mx-auto flex min-h-[70vh] max-w-lg items-center px-5 py-12"><p className="text-sm text-muted-foreground">Loading invitation...</p></main>}>
    <AcceptStaffInvitationForm />
  </Suspense>;
}
