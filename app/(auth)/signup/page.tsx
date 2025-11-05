// components/signup/MultiStepSignupPage.tsx
'use client';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Link from 'next/link';
import { useState } from 'react';
import { Eye, EyeOff, ChevronDown, ArrowLeft, Download, Copy } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Label } from '@radix-ui/react-label';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import Logo from '@/components/svgIcons/Logo';
import { FaArrowRightLong } from 'react-icons/fa6';
import AccountIcon from '@/components/svgIcons/AccountIcon';
import { LuBriefcaseBusiness } from 'react-icons/lu';
import { PiPlugs } from 'react-icons/pi';
import StoreFrontIcon from '@/components/svgIcons/StoreFrontIcon';
import { ThemeName, themes } from '@/lib/themes';
import Image from 'next/image';

// Inline TypeScript interfaces
interface UserDetails {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone_number: string;
}

interface BrandColor {
  primary: string;
  secondary: string;
  accent: string;
}

interface BusinessDetails {
  store_name: string;
  type: string;
  description: string;
  brand_color: BrandColor;
}

interface RegisterRequest {
  user_details: UserDetails;
  business_details: BusinessDetails;
}

interface RegisterResponse {
  status: string;
  message: string;
  data: {
    token: string;
    store_url: string;
    qrCode: string;
  };
}

// Step indicator component
const StepIndicator = ({ currentStep }: { currentStep: number }) => {
  const steps = [
    { number: 1, title: 'Account', icon: <AccountIcon /> },
    { number: 2, title: 'Business Info', icon: <LuBriefcaseBusiness /> },
    { number: 3, title: 'WhatsApp Setup', icon: <PiPlugs /> },
  ];

  return (
    <div className="flex items-center justify-center mb-8 space-x-4">
      {steps.map((step, index) => (
        <div key={step.number} className="flex items-center px-5 md:px-0">
          <div
            className={`flex items-center justify-center w-12 h-12 mr-6 md:mr-0 rounded-full transition-all duration-200 ${
              step.number === currentStep
                ? 'bg-primary border-primary text-primary-foreground'
                : step.number < currentStep
                ? 'bg-primary border-primary text-primary-foreground'
                : 'bg-primary-tertiary text-gray-400'
            }`}
          >
            <span
              className={`text-sm font-medium ${
                step.number <= currentStep ? 'text-primary-foreground' : 'text-foreground'
              }`}
            >
              {step.icon}
            </span>
          </div>
          <div className="hidden sm:inline ml-3 text-left">
            <p
              className={`text-sm font-medium ${
                step.number <= currentStep ? 'text-foreground' : 'text-gray-400'
              }`}
            >
              <span className=" ml-2">{step.title}</span> 
            </p>
          </div>
          {index < steps.length - 1 && (
            <ChevronDown className="w-4 h-4 mx-1 sm:mx-4 transform rotate-[-90deg]" />
          )}
        </div>
      ))}
    </div>
  );
};

// Country code selector component
const CountryCodeSelect = ({ value, onValueChange }: { value: string; onValueChange: (value: string) => void }) => {
  const countryCodes = [
    { code: '+234', country: 'NG' },
    { code: '+1', country: 'US' },
  ];

  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger className="bg-muted border-0 ">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {countryCodes.map((country) => (
          <SelectItem key={country.code} value={country.code}>
            <span className="flex items-center gap-2">{country.code}</span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

// Color scheme selector component
const ColorSchemeSelector = ({ selectedScheme, onSchemeSelect }: { selectedScheme: ThemeName; onSchemeSelect: (scheme: ThemeName) => void }) => {
  const colorSchemes = [
    { name: 'Surge Green', value: 'surge-green' as ThemeName, colors: themes['surge-green'].light },
    { name: 'Ocean Blue', value: 'ocean-blue' as ThemeName, colors: themes['ocean-blue'].light },
    { name: 'Purple Elegance', value: 'purple-elegance' as ThemeName, colors: themes['purple-elegance'].light },
    { name: 'Sunset Orange', value: 'sunset-orange' as ThemeName, colors: themes['sunset-orange'].light },
  ];

  return (
    <div className="grid grid-cols-2 gap-4">
      {colorSchemes.map((scheme) => (
        <div
          key={scheme.value}
          className={`p-4 rounded-lg dark:bg-background border-2 cursor-pointer transition-all duration-200 ${
            selectedScheme === scheme.value ? 'border-primary bg-primary/10' : 'border-gray-200 bg-white dark:border-[#1F1F1F] hover:border-gray-300'
          }`}
          onClick={() => onSchemeSelect(scheme.value)}
        >
          <div className="flex items-center space-x-3">
            <div className="flex space-x-1">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.colors.primary }} />
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.colors.secondary }} />
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: scheme.colors.tertiary }} />
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
  const [isSuccess, setIsSuccess] = useState(false);
  const [successData, setSuccessData] = useState<RegisterResponse | null>(null);
  const router = useRouter();

  // Form data state
  const [formData, setFormData] = useState<RegisterRequest & { agreeToTerms: boolean; countryCode: string; colorScheme: ThemeName }>({
    user_details: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      phone_number: '',
    },
    business_details: {
      store_name: '',
      type: '',
      description: '',
      brand_color: {
        primary: '',
        secondary: '',
        accent: '',
      },
    },
    agreeToTerms: false,
    countryCode: '+234',
    colorScheme: 'surge-green',
  });

  // UI state
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [firstNameFocused, setFirstNameFocused] = useState(false);
  const [lastNameFocused, setLastNameFocused] = useState(false);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateStep = (step: number) => {
    switch (step) {
      case 1:
        if (!formData.user_details.firstName) {
          toast.error('First name is required');
          return false;
        }
        if (!formData.user_details.lastName) {
          toast.error('Last name is required');
          return false;
        }
        if (!formData.user_details.email || !validateEmail(formData.user_details.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        if (!formData.user_details.password) {
          toast.error('Password is required');
          return false;
        }
        if (!formData.agreeToTerms) {
          toast.error('Please agree to the terms and conditions');
          return false;
        }
        return true;
      case 2:
        if (!formData.business_details.store_name.trim()) {
          toast.error('Business name is required');
          return false;
        }
        if (!formData.business_details.type) {
          toast.error('Please select a business type');
          return false;
        }
        if (!formData.business_details.description.trim()) {
          toast.error('Business description is required');
          return false;
        }
        return true;
      case 3:
        if (!formData.user_details.phone_number.trim()) {
          toast.error('WhatsApp business number is required');
          return false;
        }
        if (!formData.business_details.brand_color.primary) {
          toast.error('Please choose a color scheme');
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

  const mapColorSchemeToBrandColor = (scheme: ThemeName) => {
    const colors = themes[scheme].light;
    return {
      primary: colors.primary,
      secondary: colors.secondary,
      accent: colors.tertiary,
    };
  };

  const handleInputChange = (
    field: keyof typeof formData,
           // eslint-disable-next-line @typescript-eslint/no-explicit-any
    value: any,
    nestedField?: keyof typeof formData.user_details | keyof typeof formData.business_details
  ) => {
    setFormData((prev) => {
      if (field === 'colorScheme') {
        return {
          ...prev,
          colorScheme: value as ThemeName,
          business_details: {
            ...prev.business_details,
            brand_color: mapColorSchemeToBrandColor(value as ThemeName),
          },
        };
      }
      if (nestedField && field === 'user_details') {
        return {
          ...prev,
          user_details: { ...prev.user_details, [nestedField]: value },
        };
      }
      if (nestedField && field === 'business_details') {
        return {
          ...prev,
          business_details: { ...prev.business_details, [nestedField]: value },
        };
      }
      return { ...prev, [field]: value };
    });
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsLoading(true);

    try {
      const phone_number = `${formData.countryCode}${formData.user_details.phone_number}`.replace(/\s/g, '');
      const payload: RegisterRequest = {
        user_details: {
          ...formData.user_details,
          phone_number,
        },
        business_details: formData.business_details,
      };

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result: RegisterResponse & { message?: string } = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to create account');
      }

      // Save theme to local storage
      localStorage.setItem('colorScheme', formData.colorScheme);
      localStorage.setItem('store_url', result.data.store_url);
      localStorage.setItem('qrCode', result.data.qrCode);

      setSuccessData(result);
      toast.success('Account created successfully!');
      setIsSuccess(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const businessTypes = [
    'Restaurant/Food Service',
    'Retail Store',
    'E-commerce',
    'Professional Services',
    'Health & Beauty',
    'Technology',
    'Education',
    'Real Estate',
    'Other',
  ];

  // Step 1 - Account Creation
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-primary">Create Account</h1>
        <p className="text-xs text-muted-foreground">Increase your sales revenue by 15-30% with SellFast</p>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="relative">
              <label
                htmlFor="firstName"
                className={`left-3 text-sm transition-all duration-200 pointer-events-none ${
                  formData.user_details.firstName || firstNameFocused
                    ? 'top-[-10px] text-xs font-medium bg-background px-1'
                    : 'top-3'
                }`}
              >
                First Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="firstName"
                type="text"
                value={formData.user_details.firstName}
                placeholder="James"
                onChange={(e) => handleInputChange('user_details', e.target.value, 'firstName')}
                onFocus={() => setFirstNameFocused(true)}
                onBlur={() => setFirstNameFocused(false)}
                className="w-full h-11 bg-muted border-0 pr-4 rounded-lg focus:ring-2 transition-all duration-200"
              />
            </div>
          </div>
          <div className="space-y-2">
            <div className="relative">
              <label
                htmlFor="lastName"
                className={`left-3 text-sm transition-all duration-200 pointer-events-none ${
                  formData.user_details.lastName || lastNameFocused
                    ? 'top-[-10px] text-xs font-medium bg-background px-1'
                    : 'top-3'
                }`}
              >
                Last Name <span className="text-destructive">*</span>
              </label>
              <Input
                id="lastName"
                type="text"
                value={formData.user_details.lastName}
                placeholder="Smith"
                onChange={(e) => handleInputChange('user_details', e.target.value, 'lastName')}
                onFocus={() => setLastNameFocused(true)}
                onBlur={() => setLastNameFocused(false)}
                className="w-full h-11 bg-muted border-0 pr-4 rounded-lg focus:ring-2 transition-all duration-200"
              />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <label
              htmlFor="email"
              className={`left-3 text-sm transition-all duration-200 pointer-events-none ${
                formData.user_details.email || emailFocused ? 'top-[-10px] text-xs font-medium bg-background px-1' : 'top-3'
              }`}
            >
              Email <span className="text-destructive">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={formData.user_details.email}
              placeholder="e.g., jamesfood@example.com"
              onChange={(e) => handleInputChange('user_details', e.target.value, 'email')}
              onFocus={() => setEmailFocused(true)}
              onBlur={() => setEmailFocused(false)}
              className="w-full h-11 bg-muted border-0 pr-4 rounded-lg focus:ring-2 transition-all duration-200"
            />
          </div>
        </div>
        <div className="space-y-2">
          <div className="relative">
            <label
              htmlFor="password"
              className={`left-3 text-sm transition-all duration-200 pointer-events-none ${
                formData.user_details.password || passwordFocused
                  ? 'top-[-10px] text-xs font-medium bg-background px-1'
                  : 'top-3'
              }`}
            >
              Password <span className="text-destructive">*</span>
            </label>
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.user_details.password}
              placeholder="e.g., Password123#"
              onChange={(e) => handleInputChange('user_details', e.target.value, 'password')}
              onFocus={() => setPasswordFocused(true)}
              onBlur={() => setPasswordFocused(false)}
              className="w-full h-11 bg-muted border-0 pr-10 rounded-lg focus:ring-2 transition-all duration-200"
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer" onClick={togglePasswordVisibility}>
              {showPassword ? <EyeOff className="h-4 w-4 text-muted-foreground" /> : <Eye className="h-4 w-4 text-muted-foreground" />}
            </div>
          </div>
          <div className="flex items-center">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="terms"
                checked={formData.agreeToTerms}
                onCheckedChange={(checked) => handleInputChange('agreeToTerms', checked)}
                disabled={isLoading}
              />
              <Label htmlFor="terms" className="text-sm font-normal">
                I agree to all <span className="text-primary">Terms & Conditions</span>
              </Label>
            </div>
          </div>
        </div>
      </div>

      <Button
        type="button"
        onClick={handleNext}
        variant={
          formData.user_details.firstName &&
          formData.user_details.lastName &&
          formData.user_details.email &&
          formData.user_details.password &&
          !isLoading
            ? 'default'
            : 'secondary'
        }
        className="w-full py-2 rounded-lg transition-colors duration-200"
        disabled={
          !formData.user_details.firstName ||
          !formData.user_details.lastName ||
          !formData.user_details.email ||
          !formData.user_details.password ||
          isLoading
        }
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
        <p className="text-xs text-muted-foreground">Supercharge your operations using SellFast</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="businessName" className="text-sm font-medium">
            Business Name <span className="text-destructive">*</span>
          </Label>
          <Input
            id="businessName"
            type="text"
            value={formData.business_details.store_name}
            placeholder="e.g., James Food Place"
            onChange={(e) => handleInputChange('business_details', e.target.value, 'store_name')}
            className="w-full h-11 bg-muted border-0 rounded-lg focus:ring-2 transition-all duration-200"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="businessType" className="text-sm font-medium">
            Business Type <span className="text-destructive">*</span>
          </Label>
          <Select
            value={formData.business_details.type}
            onValueChange={(value) => handleInputChange('business_details', value, 'type')}
          >
            <SelectTrigger className="w-full h-11 bg-muted border-0 rounded-lg">
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
            Business Description <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="businessDescription"
            value={formData.business_details.description}
            placeholder="Tell customers what makes your business special"
            onChange={(e) => handleInputChange('business_details', e.target.value, 'description')}
            className="w-full min-h-[100px] bg-muted border-0 rounded-lg focus:ring-2 transition-all duration-200 resize-none"
            maxLength={500}
          />
          <div className="text-right text-xs text-muted-foreground">
            {formData.business_details.description.length}/500
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
        <p className="text-xs text-muted-foreground">SellFast&apos;s bot helps with customer communication and order management</p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="phoneNumber" className="text-sm font-medium">
            WhatsApp Business Number <span className="text-destructive">*</span>
          </Label>
          <div className="flex gap-1">
            <CountryCodeSelect
              value={formData.countryCode}
              onValueChange={(value) => handleInputChange('countryCode', value)}
            />
            <Input
              id="phoneNumber"
              type="tel"
              value={formData.user_details.phone_number}
              placeholder="809 789 7891"
              onChange={(e) => handleInputChange('user_details', e.target.value, 'phone_number')}
              className="flex-1 bg-muted border-0 rounded-r-lg focus:ring-2 transition-all duration-200"
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium">
            Choose Your Color Scheme <span className="text-destructive">*</span>
          </Label>
          <ColorSchemeSelector
            selectedScheme={formData.colorScheme}
            onSchemeSelect={(scheme) => handleInputChange('colorScheme', scheme)}
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
          {isLoading ? 'Creating Storefront...' : 'Create Storefront'}
        </Button>
      </div>
    </div>
  );

  // Success Screen
  const renderSuccessScreen = () => (
    <div className="space-y-6">
      <div className="flex justify-center">
        <StoreFrontIcon />
      </div>
      <div className="space-y-2 flex flex-col justify-center items-center">
        <h2 className="text-lg font-bold text-foreground">Your Storefront is Ready!</h2>
        <p className="text-muted-foreground text-xs">
          We&apos;ve created your awesome <span className="text-primary">{formData.business_details.store_name}</span> storefront with WhatsApp integration
        </p>
        {successData?.data.qrCode && (
          <div className="relative w-32 h-32">
            <Image
              src={successData.data.qrCode}
              alt="QR Code"
              fill
              className="object-contain"
              sizes="128px"
            />
          </div>
        )}
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => {
              toast.success('QR code download triggered!');
              // Implement actual download logic if needed
            }}
          >
            Download QR <Download />
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              navigator.clipboard.writeText(successData?.data.store_url || '');
              toast.success('Storefront link copied!');
            }}
          >
            Copy Storefront Link <Copy />
          </Button>
        </div>
      </div>
      <div className="space-y-3">
        <h3 className="font-bold text-sm">Next Steps</h3>
        <div className="pl-3 text-sm space-y-2">
          <p>1. Check your WhatsApp for setup instructions</p>
          <p>2. Add your first products to the catalog</p>
          <p>3. Share your storefront link with customers</p>
          <p>4. Start receiving orders on WhatsApp!</p>
        </div>
      </div>
      <div className="pt-4">
        <Button
          onClick={() => router.push('/dashboard')}
          className="bg-primary hover:bg-primary-secondary text-primary-foreground px-6 py-3 w-full"
        >
          Go to Your Dashboard
        </Button>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    if (isSuccess) {
      return renderSuccessScreen();
    }

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
      {!isSuccess && (
        <div className="absolute top-6">
          <StepIndicator currentStep={currentStep} />
        </div>
      )}
      {!isSuccess && <Logo />}
      {renderCurrentStep()}
      {!isSuccess && (
        <span className="flex justify-center gap-1 text-sm">
          <p>Already have an account?</p>
          <Link href="/login" className="text-primary">
            Login
          </Link>
        </span>
      )}
    </div>
  );
}