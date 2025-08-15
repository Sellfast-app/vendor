"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Eye, EyeOff, X, Check } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Logo from "@/components/svgIcons/Logo";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  // Password validation states
  const [hasLength, setHasLength] = useState(false);
  const [hasUppercase, setHasUppercase] = useState(false);
  const [hasLowercase, setHasLowercase] = useState(false);
  const [hasNumber, setHasNumber] = useState(false);
  const [hasSpecialChar, setHasSpecialChar] = useState(false);

  // Redirect to /login if token is missing
//   useEffect(() => {
//     if (!token) {
//       router.push("/login");
//     }
//   }, [token, router]);

  // Validate password rules on change
  useEffect(() => {
    setHasLength(password.length >= 8);
    setHasUppercase(/[A-Z]/.test(password));
    setHasLowercase(/[a-z]/.test(password));
    setHasNumber(/\d/.test(password));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
  }, [password]);

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (!hasLength || !hasUppercase || !hasLowercase || !hasNumber || !hasSpecialChar) {
      setError("Password does not meet all requirements");
      return;
    }
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ newPassword: password, confirmPassword, token }),
      });

      const data = await res.json();
      console.log("Reset password response:", JSON.stringify(data, null, 2)); // Debug log
      if (res.ok && data.success) {
        alert("Password reset successfully!"); // Replace with toast
        router.push("/login");
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch (err) {
      setError("Failed to reset password. Please try again.");
      console.error("Reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

//   if (!token) {
//     return null;
//   }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 p-6">
        <Logo />
      <div className="flex flex-col ">
        <h1 className="text-2xl font-semibold text-primary">Reset Password</h1>
        <p className="text-xs text-[#A0A0A0]">Enter your new password</p>
      </div>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="relative">
           
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full h-12 bg-[#F8F8F8] border-0 pl-10 pr-10 rounded-lg focus:ring-2 transition-all duration-200 flex items-center"
            />
            <label
              htmlFor="password"
              className={`absolute left-10 text-gray-400 text-sm transition-all duration-200 pointer-events-none inline-block px-1 ${
                password || passwordFocused
                  ? "top-[-1.5] text-xs text-gray-600 font-medium bg-card"
                  : "top-3.5"
              }`}
            >
              New Password
            </label>
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
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
              className="w-full h-12 bg-[#F8F8F8] border-0 pl-10 pr-10 rounded-lg focus:ring-2 transition-all duration-200 flex items-center"
            />
            <label
              htmlFor="confirm-password"
              className={`absolute left-10 text-gray-400 text-sm transition-all duration-200 pointer-events-none inline-block px-1 ${
                confirmPassword || confirmPasswordFocused
                  ? "top-[-1.5] text-xs text-gray-600 font-medium bg-card"
                  : "top-3.5"
              }`}
            >
              Confirm New Password
            </label>
            <div
              className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
              onClick={toggleConfirmPasswordVisibility}
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </div>
          </div>
        </div>
        <div className="space-y-2 flex flex-wrap gap-1">
          <div className="flex gap-2">
            <div className={`flex items-center space-x-2 p-2 rounded-full ${hasUppercase ? "bg-[#D1FFDB] " : "bg-gray-100 text-gray-600"}`}>
              {hasUppercase ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <span className="text-xs">at least 1 uppercase letter</span>
            </div>
          </div>
          <div className={`flex items-center space-x-2 p-2 rounded-full ${hasLowercase ? "bg-[#D1FFDB] " : "bg-gray-100 text-gray-600"}`}>
              {hasLowercase ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <span className="text-xs">at least 1 lowercase letter</span>
            </div>
            <div className={`flex items-center space-x-2 p-2 rounded-full ${hasLowercase ? "bg-[#D1FFDB] " : "bg-gray-100 text-gray-600"}`}>
              {hasLowercase ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <span className="text-xs">at least 1 lowercase letter</span>
            </div>
            <div className={`flex items-center space-x-2 p-2 rounded-full ${hasLength ? "bg-[#D1FFDB] " : "bg-gray-100 text-gray-600"}`}>
              {hasLength ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <span className="text-xs">min 8 characters</span>
            </div>
            <div className={`flex items-center space-x-2 p-2 rounded-full ${hasNumber ? "bg-[#D1FFDB] " : "bg-gray-100 text-gray-600"}`}>
              {hasNumber ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <span className="text-xs">at least 1 number</span>
            </div>
          <div className={`flex items-center space-x-2 p-2 rounded-full w-[50%] ${hasSpecialChar ? "bg-[#D1FFDB] " : "bg-gray-100 text-gray-600"}`}>
            {hasSpecialChar ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
            <span className="text-xs">at least 1 special symbol &apos;$, #...&apos;</span>
          </div>
        </div>
        {error && <p className="text-sm text-red-600 text-center">{error}</p>}
        <Button
          type="submit"
          className={`w-full py-2 rounded-lg transition-colors duration-200 ${
            password && confirmPassword && !isLoading
              ? "bg-[#4FCA6A]  text-white"
              : "bg-[#F8F8F8] hover:bg-gray-300 text-gray-600"
          }`}
          disabled={!password || !confirmPassword || isLoading}
        >
          {isLoading ? "Resetting..." : "Reset "}
        </Button>
      </form>
    </div>
  );
}