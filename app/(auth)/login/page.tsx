"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import {  useSearchParams } from "next/navigation";
import { toast } from "sonner";
import Logo from "@/components/svgIcons/Logo";

interface LoginResponse {
  status: string;
  message: string;
  success: boolean;
  data: { store_name: string };
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  // const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from") || "/dashboard";

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const isValid = emailRegex.test(email);
    console.log("validateEmail:", { email, isValid });
    return isValid;
  };

  const validatePassword = (password: string) => {
    // Simplified to match common requirements (8+ characters)
    const isValid = password.length >= 8;
    console.log("validatePassword:", { password, isValid });
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("handleSubmit triggered", { email, password });

    // Validation with toast errors
    if (!email || !validateEmail(email)) {
      console.log("Validation failed: Invalid email");
      toast.error("Please enter a valid email address");
      return;
    }
    if (!password) {
      console.log("Validation failed: Password missing");
      toast.error("Password is required");
      return;
    }
    if (!validatePassword(password)) {
      console.log("Validation failed: Invalid password");
      toast.error("Password must be at least 8 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data: LoginResponse = await res.json();
      console.log("Login response:", data);

      if (res.ok && data.success) {
        // Store store_name in localStorage
        if (data.data.store_name) {
          console.log("Storing store_name:", data.data.store_name);
          localStorage.setItem("store_name", data.data.store_name);
        }
        toast.success("Login successful! Redirecting...");
        console.log("Redirecting to:", from);
        
        // FIXED: Use window.location for PWA compatibility
        // Wait a bit for cookies to be processed, then hard redirect
        setTimeout(() => {
          console.log("Performing hard redirect to:", from);
          window.location.href = from;
          // Alternative: window.location.replace(from) to prevent back navigation
        }, 300);
      } else {
        console.log("Login failed:", data.message);
        toast.error(data.message || "Login failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed. Please try again.";
      console.error("Login error:", errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      console.log("handleSubmit completed");
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full max-w-lg space-y-6">
     <Logo />
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-primary">Welcome back</h1>
        <p className="text-xs text-muted-foreground">Let&apos;s help you get stuff done today</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <label
              htmlFor="email"
              className={`left-3 text-sm transition-all duration-200 pointer-events-none inline-block px-1 ${
                email || emailFocused ? "top-[-10px] text-xs font-medium bg-background" : "top-3"
              }`}
            >
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="w-full h-11 bg-muted border-0 pr-4 rounded-lg focus:ring-2 transition-all duration-200"
              placeholder="e.g., example@gmail.com"
              disabled={isLoading}
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <label
              htmlFor="password"
              className={`left-3 text-sm transition-all duration-200 pointer-events-none inline-block px-1 ${
                password || passwordFocused ? "top-[-10px] text-xs font-medium bg-background" : "top-3"
              }`}
            >
              Password <span className="text-destructive">*</span>
            </label>
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full h-11 bg-muted border-0 pr-10 rounded-lg focus:ring-2 transition-all duration-200"
              placeholder="e.g., JOHNdoe123#"
              disabled={isLoading}
            />
            <div
              className="absolute inset-y-0 right-0 top-1/3 flex items-center pr-3 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-muted-foreground" />
              ) : (
                <Eye className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-end">
            <Link href="/forgot" className="text-sm text-primary hover:underline">
              Forgot password?
            </Link>
          </div>
        </div>
        <Button
          type="submit"
          variant={email && password && !isLoading ? "default" : "secondary"}
          className="w-full py-2 rounded-lg transition-colors duration-200"
          disabled={!email || !password || isLoading}
        >
          {isLoading ? "Signing in..." : "Login"}
        </Button>
      </form>
      <span className="flex justify-center gap-1 text-sm">
        <p>Don&apos;t have an account?</p>
        <Link href="/signup" className="text-primary hover:underline">
          Sign up
        </Link>
      </span>
    </div>
  );
}