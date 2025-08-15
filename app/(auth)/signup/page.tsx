"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { useState } from "react";
import { Eye, EyeOff, ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { Label } from "@radix-ui/react-label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import Logo from "@/components/svgIcons/Logo";
import { FaArrowRightLong } from "react-icons/fa6";
import { ArrowLeft } from "lucide-react";
import AccountIcon from "@/components/svgIcons/AccountIcon";
import { LuBriefcaseBusiness } from "react-icons/lu";
import { PiPlugs } from "react-icons/pi";


// Step indicator component
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { number: 1, title: "Account", icon: <AccountIcon/> },
    { number: 2, title: "Business Info", icon: <LuBriefcaseBusiness /> },
    { number: 3, title: "WhatsApp Setup", icon: <PiPlugs/> },
  ];

  return (
    <div className="flex items-center justify-center mb-8 space-x-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center">
          <div
            className={`flex items-center justify-center w-12 h-12 rounded-full  transition-all duration-200 ${
              step.number === currentStep
                ? "bg-[#4FCA6A] border-[#4FCA6A] text-white"
                : step.number < currentStep
                ? "bg-[#4FCA6A] border-[#4FCA6A] text-white"
                : "bg-[#D1FFDB] text-gray-400"
            }`}
          >
            <span  className={`text-sm font-medium ${
                step.number <= currentStep ? "text-white" : "text-black"
              }`}>{step.icon}</span>
          </div>
          <div className="ml-3 text-left">
            <p
                className={`text-sm font-medium ${
                    step.number <= currentStep ? "text-black" : "text-gray-400"
                  }`}
            >
              {step.title}
            </p>
          </div>
          {index < steps.length - 1 && (
            <ChevronDown
              className={`w-4 h-4 mx-4 transform rotate-[-90deg]`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

// Country code selector component
const CountryCodeSelect = ({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) => {
  const countryCodes = [
    { code: "+234", country: "NG"},
    {code: "+1", country: "US"},    
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="w-24 h-11 bg-[#F8F8F8] border-0 border-r border-gray-200">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {countryCodes.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className="flex items-center gap-2">
            {country.code}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Color scheme selector component
const ColorSchemeSelector = ({ selectedScheme, onSchemeSelect }: { selectedScheme: string; onSchemeSelect: (scheme: string) => void }) => {
  const colorSchemes = [
    {
      name: "Surge Green",
      value: "surge-green",
      colors: ["#4FCA6A", "#45B862", "#3BA65A"],
    },
    {
      name: "Ocean Blue",
      value: "ocean-blue",
      colors: ["#3B82F6", "#2563EB", "#1D4ED8"],
    },
    {
      name: "Purple Elegance",
      value: "purple-elegance",
      colors: ["#8B5CF6", "#7C3AED", "#6D28D9"],
    },
    {
      name: "Sunset Orange",
      value: "sunset-orange",
      colors: ["#F97316", "#EA580C", "#DC2626"],
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {colorSchemes.map((scheme) => (
        <div
          key={scheme.value}
          className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
            selectedScheme === scheme.value
              ? "border-[#4FCA6A] bg-green-50"
              : "border-gray-200 bg-white hover:border-gray-300"
          }`}
          onClick={() => onSchemeSelect(scheme.value)}
        >
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              {scheme.colors.map((color, index) => (
                <div
                  key={index}
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
            <span className="text-sm font-medium">{scheme.name}</span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default function MultiStepSignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  // Form data state
  const [formData, setFormData] = useState({
    // Step 1 - Account
    email: "",
    password: "",
    agreeToTerms: false,
    
    // Step 2 - Business Info
    businessName: "",
    businessType: "",
    businessDescription: "",
    
    // Step 3 - WhatsApp Setup
    countryCode: "+234",
    phoneNumber: "",
    colorScheme: "surge-green",
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.email || !validateEmail(formData.email)) {
          toast.error("Please enter a valid email address");
          return false;
        }
        if (!formData.password) {
          toast.error("Password is required");
          return false;
        }
        if (!formData.agreeToTerms) {
          toast.error("Please agree to the terms and conditions");
          return false;
        }
        return true;
      case 2:
        if (!formData.businessName.trim()) {
          toast.error("Business name is required");
          return false;
        }
        if (!formData.businessType) {
          toast.error("Please select a business type");
          return false;
        }
        if (!formData.businessDescription.trim()) {
          toast.error("Business description is required");
          return false;
        }
        return true;
      case 3:
        if (!formData.phoneNumber.trim()) {
          toast.error("WhatsApp business number is required");
          return false;
        }
        if (!formData.colorScheme) {
          toast.error("Please choose a color scheme");
          return false;
        }
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;
    
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok && data.success) {
        toast.success("Account created successfully! Redirecting...");
        router.push(`/verify?email=${encodeURIComponent(formData.email)}`);
      } else {
        toast.error(data.error || "Signup failed");
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const businessTypes = [
    "Restaurant/Food Service",
    "Retail Store",
    "E-commerce",
    "Professional Services",
    "Health & Beauty",
    "Technology",
    "Education",
    "Real Estate",
    "Other",
  ];

  // Step 1 - Account Creation
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-primary">Create Account</h1>
        <p className="text-xs text-[#A0A0A0]">Increase your sales revenue by 15-30% with SellFast</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <label
              htmlFor="email"
              className={`left-10 text-sm transition-all duration-200 pointer-events-none inline-block px-1 ${
                formData.email || emailFocused
                  ? "top-[-1.5] text-xs font-medium"
                  : "top-5"
              }`}
            >
              Email <span className="text-red-500">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              placeholder="e.g., jamesfood@example.com"
              onChange={(e) => handleInputChange("email", e.target.value)}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="w-full h-11 bg-[#F8F8F8] border-0 pr-4 rounded-lg focus:ring-2 transition-all duration-200 flex items-center"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label
            htmlFor="password"
            className={`text-sm transition-all duration-200 pointer-events-none inline-block px-1 ${
              formData.password || passwordFocused
                ? "top-[-1.5] text-xs font-medium"
                : "top-5"
            }`}
          >
            Password <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              placeholder="e.g., Password123#"
              onChange={(e) => handleInputChange("password", e.target.value)}
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
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm font-normal">
                I agree to all <span className="text-[#4FCA6A]">Terms & Conditions</span>
              </Label>
            </div>
          </div>
        </div>
      </div>
      
      <Button
        type="button"
        onClick={handleNext}
        variant={formData.email && formData.password && !isLoading ? "default" : "secondary"}
        className="w-full py-2 rounded-lg transition-colors duration-200"
        disabled={!formData.email || !formData.password || isLoading}
      >
        Next <FaArrowRightLong />
      </Button>
    </div>
  );

  // Step 2 - Business Information
  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-primary">Business Information</h1>
        <p className="text-xs text-[#A0A0A0]">Supercharge your operations using SellFast</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-medium">
            Business Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="businessName"
            type="text"
            value={formData.businessName}
            placeholder="e.g., James Food Place"
            onChange={(e) => handleInputChange("businessName", e.target.value)}
            className="w-full h-11 bg-[#F8F8F8] border-0 rounded-lg focus:ring-2 transition-all duration-200"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessType" className="text-sm font-medium">
            Business Type <span className="text-red-500">*</span>
          </Label>
          <Select value={formData.businessType} onValueChange={(value) => handleInputChange("businessType", value)}>
            <SelectTrigger className="w-full h-11 bg-[#F8F8F8] border-0 rounded-lg">
              <SelectValue placeholder="Select your business type" />
            </SelectTrigger>
            <SelectContent>
              {businessTypes.map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="businessDescription" className="text-sm font-medium">
            Business Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="businessDescription"
            value={formData.businessDescription}
            placeholder="Tell customers what makes your business special"
            onChange={(e) => handleInputChange("businessDescription", e.target.value)}
            className="w-full min-h-[100px] bg-[#F8F8F8] border-0 rounded-lg focus:ring-2 transition-all duration-200 resize-none"
            maxLength={500}
          />
          <div className="text-right text-xs text-gray-500">
            {formData.businessDescription.length}/500
          </div>
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="w-[30%] py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleNext}
          className="w-[67%] py-2 rounded-lg transition-colors duration-200"
        >
          Next <FaArrowRightLong />
        </Button>
      </div>
    </div>
  );

  // Step 3 - WhatsApp Setup
  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-primary">WhatsApp Setup</h1>
        <p className="text-xs text-[#A0A0A0]">SellFast's bot helps with customer communication and order management</p>
      </div>
      
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium">
            WhatsApp Business Number <span className="text-red-500">*</span>
          </Label>
          <div className="flex">
            <CountryCodeSelect
              value={formData.countryCode}
              onValueChange={(value) => handleInputChange("countryCode", value)}
            />
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.phoneNumber}
              placeholder="809 789 7891"
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className="flex-1 bg-[#F8F8F8] border-0 rounded-r-lg focus:ring-2 transition-all duration-200"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Choose Your Color Scheme <span className="text-red-500">*</span>
          </Label>
          <ColorSchemeSelector
            selectedScheme={formData.colorScheme}
            onSchemeSelect={(scheme) => handleInputChange("colorScheme", scheme)}
          />
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleBack}
          className="w-[30%] py-2 rounded-lg transition-colors duration-200"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-[67%] py-2 rounded-lg transition-colors duration-200"
        >
          {isLoading ? "Creating Storefront..." : "Create Storefront"}
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="w-full max-w-lg space-y-6">
        <div className="absolute top-6">
        <StepIndicator currentStep={currentStep} />
        </div>
      <Logo />
      {renderCurrentStep()}
      <span className="flex justify-center gap-1 text-sm">
        <p>Already have an account?</p>
        <Link href="/login" className="text-[#4FCA6A]">
          Login
        </Link>
      </span>
    </div>
  );
}