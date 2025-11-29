"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { Eye, EyeOff, X, Check } from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";
import Logo from "@/components/svgIcons/Logo";
import { toast } from "sonner";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidatingToken, setIsValidatingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
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

  // Validate token on component mount
  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError("Invalid reset link. Please request a new password reset.");
        setIsValidatingToken(false);
        return;
      }

      try {
        const res = await fetch(`/api/auth/validate-reset-token?token=${encodeURIComponent(token)}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const data = await res.json();
        
        if (res.ok && data.success && data.data.valid) {
          setTokenValid(true);
          setUserEmail(data.data.email || "");
          toast.success("Token validated! You can now reset your password.");
        } else {
          setTokenValid(false);
          const errorMessage = data.message || "Invalid or expired reset token";
          setError(errorMessage);
          toast.error(errorMessage);
        }
      } catch (err) {
        setTokenValid(false);
        const errorMessage = "Failed to validate reset token. Please try again.";
        setError(errorMessage);
        toast.error(errorMessage);
        console.error("Token validation error:", err);
      } finally {
        setIsValidatingToken(false);
      }
    };

    validateToken();
  }, [token]);

  // Validate password rules on change
  useEffect(() => {
    setHasLength(password.length >= 8);
    setHasUppercase(/[A-Z]/.test(password));
    setHasLowercase(/[a-z]/.test(password));
    setHasNumber(/\d/.test(password));
    setHasSpecialChar(/[!@#$%^&*(),.?":{}|<>]/.test(password));
  }, [password]);

  // Check if all password requirements are met
  const isPasswordValid = hasLength && hasUppercase && hasLowercase && hasNumber && hasSpecialChar;

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) {
      setError("Invalid reset link. Please request a new password reset.");
      return;
    }

    if (!tokenValid) {
      setError("Reset token is invalid or expired. Please request a new password reset.");
      return;
    }

    if (!password || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!isPasswordValid) {
      setError("Password does not meet all requirements");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          token, 
          newPassword: password, 
          confirmPassword 
        }),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success("Password reset successfully! You can now log in with your new password.");
        setTimeout(() => {
          router.push("/login");
        }, 2000);
      } else {
        const errorMessage = data.message || "Failed to reset password";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = "Network error. Please check your connection and try again.";
      setError(errorMessage);
      toast.error(errorMessage);
      console.error("Reset password error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading state while validating token
  if (isValidatingToken) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-6 p-6">
        <Logo />
        <div className="flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <h2 className="text-lg font-semibold text-primary">Validating reset token...</h2>
          <p className="text-sm text-muted-foreground mt-2">Please wait while we verify your reset link</p>
        </div>
      </div>
    );
  }

  // Show error if token is invalid
  if (!tokenValid) {
    return (
      <div className="w-full max-w-lg mx-auto space-y-6 p-6">
        <Logo />
        <div className="flex flex-col">
          <h1 className="text-2xl font-semibold text-primary">Invalid Reset Link</h1>
          <p className="text-xs text-[#A0A0A0]">This password reset link is invalid or has expired</p>
        </div>
        
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 text-center">{error}</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => router.push("/forgot")}
            className="w-full py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors duration-200"
          >
            Request New Reset Link
          </Button>
          <Button
            onClick={() => router.push("/login")}
            variant="outline"
            className="w-full py-3 rounded-lg transition-colors duration-200"
          >
            Back to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6 p-6">
      <Logo />
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-primary">Reset Password</h1>
        <p className="text-xs text-[#A0A0A0]">
          {userEmail ? `Reset password for ${userEmail}` : "Enter your new password"}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* New Password Field */}
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full h-12 bg-[#F8F8F8] border-0 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-[#4FCA6A] transition-all duration-200"
              placeholder=" "
              disabled={isLoading}
            />
            <label
              htmlFor="password"
              className={`absolute left-4 text-gray-400 text-sm transition-all duration-200 pointer-events-none ${
                password || passwordFocused
                  ? "top-[-10px] text-xs text-gray-600 font-medium bg-white px-1"
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

          {/* Confirm Password Field */}
          <div className="relative">
            <Input
              id="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onFocus={() => setConfirmPasswordFocused(true)}
              onBlur={() => setConfirmPasswordFocused(false)}
              className="w-full h-12 bg-[#F8F8F8] border-0 pl-4 pr-10 rounded-lg focus:ring-2 focus:ring-[#4FCA6A] transition-all duration-200"
              placeholder=" "
              disabled={isLoading}
            />
            <label
              htmlFor="confirm-password"
              className={`absolute left-4 text-gray-400 text-sm transition-all duration-200 pointer-events-none ${
                confirmPassword || confirmPasswordFocused
                  ? "top-[-10px] text-xs text-gray-600 font-medium bg-white px-1"
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

        {/* Password Requirements */}
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Password Requirements:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div className={`flex items-center space-x-2 p-2 rounded-lg ${hasLength ? "bg-[#D1FFDB]" : "bg-gray-100"}`}>
              {hasLength ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
              <span className={`text-xs ${hasLength ? "text-green-800" : "text-gray-600"}`}>8+ characters</span>
            </div>
            <div className={`flex items-center space-x-2 p-2 rounded-lg ${hasUppercase ? "bg-[#D1FFDB]" : "bg-gray-100"}`}>
              {hasUppercase ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
              <span className={`text-xs ${hasUppercase ? "text-green-800" : "text-gray-600"}`}>Uppercase letter</span>
            </div>
            <div className={`flex items-center space-x-2 p-2 rounded-lg ${hasLowercase ? "bg-[#D1FFDB]" : "bg-gray-100"}`}>
              {hasLowercase ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
              <span className={`text-xs ${hasLowercase ? "text-green-800" : "text-gray-600"}`}>Lowercase letter</span>
            </div>
            <div className={`flex items-center space-x-2 p-2 rounded-lg ${hasNumber ? "bg-[#D1FFDB]" : "bg-gray-100"}`}>
              {hasNumber ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
              <span className={`text-xs ${hasNumber ? "text-green-800" : "text-gray-600"}`}>Number</span>
            </div>
            <div className={`flex items-center space-x-2 p-2 rounded-lg ${hasSpecialChar ? "bg-[#D1FFDB]" : "bg-gray-100"}`}>
              {hasSpecialChar ? <Check className="h-4 w-4 text-green-600" /> : <X className="h-4 w-4 text-gray-400" />}
              <span className={`text-xs ${hasSpecialChar ? "text-green-800" : "text-gray-600"}`}>Special character</span>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600 text-center">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          className={`w-full py-3 rounded-lg transition-colors duration-200 font-medium ${
            password && confirmPassword && isPasswordValid && !isLoading
              ? "bg-[#4FCA6A] text-white hover:bg-[#45b860]" 
              : "bg-gray-200 text-gray-500 cursor-not-allowed"
          }`}
          disabled={!password || !confirmPassword || !isPasswordValid || isLoading}
        >
          {isLoading ? "Resetting Password..." : "Reset Password"}
        </Button>
      </form>
    </div>
  );
}