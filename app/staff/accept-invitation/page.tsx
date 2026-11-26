"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function AcceptStaffInvitationForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [state, setState] = useState<"ready" | "loading" | "created" | "accepted" | "error" | "existing">("ready");
  const [message, setMessage] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  async function createStaffAccount() {
    if (password !== confirmPassword) {
      setState("error");
      setMessage("Passwords do not match.");
      return;
    }
    setState("loading"); setMessage("");
    try {
      const response = await fetch("/api/vendor/staff-account-setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, first_name: firstName, last_name: lastName, whatsapp_number: whatsappNumber, password }),
      });
      const result = await response.json();
      if (response.status === 409 && String(result.message || "").toLowerCase().includes("account already exists")) {
        setState("existing");
        setMessage("This email already has a Swiftree account. Sign in with it, then accept the invitation below.");
        return;
      }
      if (!response.ok || result.status !== "success") throw new Error(result.message || "This invitation could not be accepted.");
      setState("created");
      setMessage("Your staff account and store access are ready. Sign in with the invited email and the password you just created.");
    } catch (error) {
      setState("error"); setMessage(error instanceof Error ? error.message : "This invitation could not be accepted.");
    }
  }

  async function acceptForExistingAccount() {
    setState("loading"); setMessage("");
    try {
      const response = await fetch("/api/vendor/staff/invitations/accept", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }),
      });
      const result = await response.json();
      if (response.status === 401) {
        setState("existing");
        setMessage("Sign in with the invited email first, then return here and accept the invitation.");
        return;
      }
      if (!response.ok || result.status !== "success") throw new Error(result.message || "This invitation could not be accepted.");
      setState("accepted");
      setMessage("Your staff access is active.");
    } catch (error) {
      setState("error"); setMessage(error instanceof Error ? error.message : "This invitation could not be accepted.");
    }
  }

  const returnPath = `/staff/accept-invitation?token=${encodeURIComponent(token)}`;
  return <main className="mx-auto flex min-h-[70vh] max-w-lg flex-col justify-center px-5 py-12">
    <h1 className="text-2xl font-semibold">Staff invitation</h1>
    <p className="mt-2 text-sm text-muted-foreground">Set up a staff login to access the store that invited you. You do not need to create a vendor store.</p>
    {message && <p role={state === "error" ? "alert" : "status"} className="mt-5 rounded-md border p-4 text-sm">{message}</p>}
    {state !== "created" && state !== "accepted" && token && <form className="mt-6 space-y-4" onSubmit={(event) => { event.preventDefault(); void createStaffAccount(); }}>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2"><Label htmlFor="staff-first-name">First name</Label><Input id="staff-first-name" autoComplete="given-name" value={firstName} onChange={(event) => setFirstName(event.target.value)} required /></div>
        <div className="space-y-2"><Label htmlFor="staff-last-name">Last name</Label><Input id="staff-last-name" autoComplete="family-name" value={lastName} onChange={(event) => setLastName(event.target.value)} required /></div>
      </div>
      <div className="space-y-2"><Label htmlFor="staff-whatsapp">WhatsApp number</Label><Input id="staff-whatsapp" type="tel" autoComplete="tel" value={whatsappNumber} onChange={(event) => setWhatsappNumber(event.target.value)} required /></div>
      <div className="space-y-2"><Label htmlFor="staff-password">Create password</Label><Input id="staff-password" type="password" autoComplete="new-password" minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} required /></div>
      <div className="space-y-2"><Label htmlFor="staff-confirm-password">Confirm password</Label><Input id="staff-confirm-password" type="password" autoComplete="new-password" minLength={8} value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} required /></div>
      <Button className="w-full" type="submit" disabled={state === "loading"}>{state === "loading" ? "Creating account..." : "Create staff login"}</Button>
    </form>}
    <div className="mt-4 flex flex-wrap gap-3">
      {state !== "created" && state !== "accepted" && <Button variant="secondary" onClick={() => void acceptForExistingAccount()} disabled={state === "loading"}>I already have an account</Button>}
      {state !== "accepted" && state !== "created" && <Button variant="outline" asChild><Link href={`/login?from=${encodeURIComponent(returnPath)}`}>Already have an account? Sign in</Link></Button>}
      {state === "created" && <Button asChild><Link href={`/login?from=${encodeURIComponent(returnPath)}`}>Sign in</Link></Button>}
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
