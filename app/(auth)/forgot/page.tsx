"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import Logo from "@/components/svgIcons/Logo";
import { toast } from "sonner"; 

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate email
    if (!email) {
      setError("Please enter your email address");
      return;
    }
    
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      console.log("Reset password mail response:", data);
      
      if (res.ok && data.success) {
        toast.success("Password reset link sent! Please check your email.");
        setEmail(""); // Clear the form on success
      } else {
        // Use the message from API response or fallback
        const errorMessage = data.message || "Failed to send reset link";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = "Network error. Please check your connection and try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Reset password mail error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 p-6">
      <Logo />
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-primary">Forgot Password?</h1>
        <p className="text-xs text-[#A0A0A0]">
          Enter the email where the reset link will be sent to
        </p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <label
              htmlFor="email"
              className={`absolute left-3 top-2 text-sm transition-all duration-200 pointer-events-none ${
                email || emailFocused
                  ? "transform -translate-y-3 scale-75 bg-white px-1 text-primary"
                  : "text-gray-500"
              }`}
            >
              Email 
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="w-full h-12 bg-[#F8F8F8] border-0 pl-3 pr-4 rounded-lg focus:ring-2 focus:ring-[#4FCA6A] transition-all duration-200"
              disabled={isLoading}
              placeholder={emailFocused ? "" : "Enter your email"}
            />
          </div>
        </div>
        {error && (
          <p className="text-sm text-red-600 text-center bg-red-50 py-2 rounded-lg">
            {error}
          </p>
        )}
        <Button
          type="submit"
          className={`w-full py-3 rounded-lg transition-colors duration-200 font-medium ${
            email && validateEmail(email) && !isLoading 
              ? "bg-[#4FCA6A] text-white hover:bg-[#45b860]" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!email || !validateEmail(email) || isLoading}
        >
          {isLoading ? "Sending..." : "Request Reset Link"}
        </Button>
        <div className="text-center">
          <Link 
            href="/login" 
            className="text-sm text-[#4FCA6A] hover:underline transition-colors"
          >
            Back to Login
          </Link>
        </div>
      </form>
    </div>
  );
}