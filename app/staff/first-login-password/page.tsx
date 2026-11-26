"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/svgIcons/Logo";

function FirstLoginPasswordForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (newPassword.length < 12) return toast.error("Choose a password with at least 12 characters.");
    if (newPassword !== confirmPassword) return toast.error("The new passwords do not match.");
    setSubmitting(true);
    try {
      const response = await fetch("/api/auth/staff/temporary-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, temporary_password: temporaryPassword, new_password: newPassword }),
      });
      const result = await response.json();
      if (!response.ok || result.status !== "success") throw new Error(result.message || "Could not change the temporary password");
      toast.success("Password updated. Sign in with your new password.");
      router.replace("/login");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not change the temporary password");
    } finally {
      setSubmitting(false);
    }
  }

  return <main className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-5 py-12">
    <Logo />
    <h1 className="mt-8 text-2xl font-semibold">Set your staff password</h1>
    <p className="mt-2 text-sm text-muted-foreground">Use the temporary password sent to your email, then choose a new password to continue.</p>
    <form onSubmit={submit} className="mt-6 space-y-4">
      <div className="space-y-2"><Label htmlFor="staff-email">Email</Label><Input id="staff-email" type="email" autoComplete="username" required value={email} onChange={event => setEmail(event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="temporary-password">Temporary password</Label><Input id="temporary-password" type="password" autoComplete="current-password" required value={temporaryPassword} onChange={event => setTemporaryPassword(event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="new-password">New password</Label><Input id="new-password" type="password" autoComplete="new-password" minLength={12} required value={newPassword} onChange={event => setNewPassword(event.target.value)} /></div>
      <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" autoComplete="new-password" minLength={12} required value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} /></div>
      <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Updating password..." : "Save new password"}</Button>
    </form>
    <Link href="/login" className="mt-4 text-center text-sm text-primary hover:underline">Back to sign in</Link>
  </main>;
}

export default function FirstLoginPasswordPage() {
  return <Suspense fallback={<main className="mx-auto flex min-h-[75vh] max-w-md items-center px-5"><p className="text-sm text-muted-foreground">Loading...</p></main>}><FirstLoginPasswordForm /></Suspense>;
}
