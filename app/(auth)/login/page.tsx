"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Logo from "@/components/svgIcons/Logo";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation with toast errors
    if (!password) {
      toast.error("Password is required");
      return;
    }
    if (!email || !validateEmail(email)) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("Login response:", data); // Debug log
      
      if (res.ok && data.success) {
        toast.success("Login successful! Redirecting...");
        router.push(`/verify?email=${encodeURIComponent(email)}`);
      } else {
        toast.error(data.error || "Login failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="w-full max-w-lg space-y-6">
        <Logo/>
      <div className="flex flex-col ">
        <h1 className="text-2xl font-semibold text-primary">Welcome back</h1>
        <p className="text-xs text-[#A0A0A0]">Let&apos;s help you get stuff done today</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <label
              htmlFor="email"
              className={`left-10  text-sm transition-all duration-200 pointer-events-none inline-block px-1 ${email || emailFocused
                  ? "top-[-1.5] text-xs  font-medium "
                  : "top-5"
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
              className="w-full h-11 bg-[#F8F8F8] border-0  pr-4 rounded-lg focus:ring-2 transition-all duration-200 flex items-center"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label
            htmlFor="password"
            className={` text-sm transition-all duration-200 pointer-events-none inline-block px-1 ${password || passwordFocused
                ? "top-[-1.5] text-xs  font-medium "
                : "top-5"
              }`}
          >
            Password
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full h-11 bg-[#F8F8F8] border-0 pr-10 rounded-lg focus:ring-2 transition-all duration-200 flex items-center"
            />
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={togglePasswordVisibility}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-end">
              <Link href="/forgot" className="text-sm text-[#4FCA6A] hover:underline">
                Forgot password?
              </Link>
          </div>
        </div>
        <Button
          type="submit"
          variant={email && !isLoading ? "default" : "secondary"}
          className={`w-full py-2 rounded-lg transition-colors duration-200 `}
          disabled={!email || isLoading}
        >
          {isLoading ? "Signing in..." : "Login"}
        </Button>
      </form>
      <span className="flex justify-center gap-1 text-sm"><p>Don&apos;t have an account?</p>  <Link href={"/signup"} className="text-[#4FCA6A]">Sign up</Link></span>
    </div>
  );
}