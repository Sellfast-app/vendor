'use client';

/**
 * V2 onboarding step: business vertical + country selection.
 *
 * Replaces the legacy freeform business-type dropdown. The selected
 * vertical drives dashboard navigation, storefront layout and the
 * available plan models (markup is mandatory for ticketing).
 *
 * Built on the existing shadcn primitives used across the vendor app.
 *
 * References: Bumpa "Tell us about your business" (ref #1),
 * Daash "What brings you to Daash" (refs #29-31).
 */

import { Check, Globe2, LayoutDashboard, WalletCards } from 'lucide-react';
import { Store, Ticket, UtensilsCrossed } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  V2_BUSINESS_TYPE_INFO,
  V2_BUSINESS_TYPES,
  V2_COUNTRY_INFO,
  V2_COUNTRIES,
  V2BusinessType,
  V2Country,
} from '@/lib/v2';

const VERTICAL_ICONS: Record<V2BusinessType, React.ReactNode> = {
  retail: <Store className="w-5 h-5" />,
  ticketing: <Ticket className="w-5 h-5" />,
  food: <UtensilsCrossed className="w-5 h-5" />,
};

const VERTICAL_REFERENCE_COPY: Record<V2BusinessType, string> = {
  retail: 'Retail dashboard and storefront inspired by Bumpa-style catalog selling.',
  ticketing: 'Event dashboard and ticket checkout inspired by Tix Africa-style flows.',
  food: 'Menu storefront and food ordering inspired by Daash-style restaurant flows.',
};

interface V2BusinessTypeStepProps {
  businessType: V2BusinessType | null;
  country: V2Country | null;
  onBusinessTypeChange: (value: V2BusinessType) => void;
  onCountryChange: (value: V2Country) => void;
}

export default function V2BusinessTypeStep({
  businessType,
  country,
  onBusinessTypeChange,
  onCountryChange,
}: V2BusinessTypeStepProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-primary">Tell us about your business</h1>
        <p className="text-xs text-muted-foreground">
          Choose one V2 vertical. This controls your dashboard, storefront and checkout setup.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs md:grid-cols-3">
        <div className="flex items-start gap-2">
          <LayoutDashboard className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>Only Retail & Wholesale, Ticketing, and Food & Restaurant are available in V2.</span>
        </div>
        <div className="flex items-start gap-2">
          <Globe2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>Supported countries are Nigeria, United Kingdom, Kenya, and Ghana.</span>
        </div>
        <div className="flex items-start gap-2">
          <WalletCards className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>Your selection determines currency and eligible revenue models.</span>
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">
          What type of business are you running? <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={businessType ?? ''}
          onValueChange={(value) => onBusinessTypeChange(value as V2BusinessType)}
          className="grid gap-3"
        >
          {V2_BUSINESS_TYPES.map((type) => {
            const info = V2_BUSINESS_TYPE_INFO[type];
            const selected = businessType === type;
            return (
              <Label
                key={type}
                htmlFor={`v2-type-${type}`}
                className={`flex cursor-pointer items-start gap-4 rounded-lg border-2 p-4 font-normal transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-[#1F1F1F] dark:bg-background'
                }`}
              >
                <RadioGroupItem value={type} id={`v2-type-${type}`} className="mt-1" />
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                    selected ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
                  }`}
                >
                  {VERTICAL_ICONS[type]}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-semibold text-foreground">{info.label}</p>
                  <p className="text-xs text-muted-foreground">{info.description}</p>
                  <p className="text-[11px] text-primary">{VERTICAL_REFERENCE_COPY[type]}</p>
                </div>
                {selected && <Check className="h-5 w-5 shrink-0 text-primary" />}
              </Label>
            );
          })}
        </RadioGroup>
      </div>

      <div className="space-y-3">
        <Label className="text-sm font-medium">
          Where is your business situated? <span className="text-destructive">*</span>
        </Label>
        <RadioGroup
          value={country ?? ''}
          onValueChange={(value) => onCountryChange(value as V2Country)}
          className="grid grid-cols-2 gap-3"
        >
          {V2_COUNTRIES.map((code) => {
            const info = V2_COUNTRY_INFO[code];
            const selected = country === code;
            return (
              <Label
                key={code}
                htmlFor={`v2-country-${code}`}
                className={`flex cursor-pointer items-center justify-between rounded-lg border-2 p-3 font-normal transition-all duration-200 ${
                  selected
                    ? 'border-primary bg-primary/10'
                    : 'border-gray-200 bg-white hover:border-gray-300 dark:border-[#1F1F1F] dark:bg-background'
                }`}
              >
                <span className="flex items-center gap-2">
                  <RadioGroupItem value={code} id={`v2-country-${code}`} />
                  <span className="text-xl" role="img" aria-label={info.name}>
                    {info.flag}
                  </span>
                  <span className="text-sm font-medium text-foreground">{info.name}</span>
                </span>
                <span className="hidden text-xs text-muted-foreground sm:inline">
                  {info.currency}
                </span>
                {selected && <Check className="h-4 w-4 text-primary" />}
              </Label>
            );
          })}
        </RadioGroup>
        <p className="text-xs text-muted-foreground">
          This sets your default storefront currency and phone-code options during onboarding.
        </p>
      </div>
    </div>
  );
}

/**
 * Wizard validation helper — returns true when both selections are present.
 * Kept as a named export so the signup page can validate before advancing.
 */
export const isV2BusinessTypeStepValid = (
  businessType: V2BusinessType | null,
  country: V2Country | null
): boolean => Boolean(businessType) && Boolean(country);
