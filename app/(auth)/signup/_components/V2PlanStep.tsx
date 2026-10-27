'use client';

/**
 * V2 onboarding step: monetization model selection.
 *
 * Two models per the V2 PRD:
 * - Subscription: quarterly/bi-annual/yearly billing, no product markup.
 * - Markup: no upfront subscription; a locally configured amount is added to
 *   each listing and the customer-facing platform fee depends on business type.
 *
 * Ticketing vendors must use the markup model (mandatory per PRD).
 *
 * Built on the existing shadcn primitives used across the vendor app.
 *
 * References: Bumpa "Choose your Bumpa Plan" (refs #2-3),
 * Daash plan screen (ref #32).
 */

import { BadgeCheck, Calculator, Check, LockKeyhole, Tag, WalletCards } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  V2BillingInterval,
  V2BusinessType,
  V2_MARKUP_TRANSACTION_FEES,
  V2PlanModel,
  V2SubscriptionPricing,
} from '@/lib/v2';

const BILLING_OPTIONS: { value: V2BillingInterval; label: string; description: string }[] = [
  { value: 'quarterly', label: '3 months', description: 'Quarterly billing' },
  { value: 'biannually', label: '6 months', description: 'Biannual billing' },
  { value: 'yearly', label: '12 months', description: 'Annual billing' },
];

const BUSINESS_MODEL_COPY: Record<V2BusinessType, string> = {
  retail: 'Retail & Wholesale can use Subscription or Markup.',
  food: 'Food & Restaurant can use Subscription or Markup.',
  ticketing: 'Ticketing uses Markup only.',
};

interface V2PlanStepProps {
  businessType: V2BusinessType;
  currency: string;
  planModel: V2PlanModel | null;
  billingInterval: V2BillingInterval;
  subscriptionPricing: V2SubscriptionPricing | null;
  pricingLoading: boolean;
  pricingError: string | null;
  onPlanModelChange: (value: V2PlanModel) => void;
  onBillingIntervalChange: (value: V2BillingInterval) => void;
}

export default function V2PlanStep({
  businessType,
  currency,
  planModel,
  billingInterval,
  subscriptionPricing,
  pricingLoading,
  pricingError,
  onPlanModelChange,
  onBillingIntervalChange,
}: V2PlanStepProps) {
  const isTicketing = businessType === 'ticketing';
  const txnFee = V2_MARKUP_TRANSACTION_FEES[businessType];
  const effectiveModel: V2PlanModel | null = isTicketing ? 'markup' : planModel;
  const formatCurrency = (amount: number) => new Intl.NumberFormat(undefined, {
    style: 'currency', currency, maximumFractionDigits: 2,
  }).format(amount);

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-primary">Choose your Swiftree plan</h1>
        <p className="text-xs text-muted-foreground">
          {BUSINESS_MODEL_COPY[businessType]} Monthly billing is not available.
        </p>
      </div>

      <div className="grid gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4 text-xs md:grid-cols-3">
        <div className="flex items-start gap-2">
          <WalletCards className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>Subscription: pay in advance quarterly, bi-annually or yearly.</span>
        </div>
        <div className="flex items-start gap-2">
          <Tag className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>Markup: no upfront subscription; a country-specific amount is added to each product or ticket.</span>
        </div>
        <div className="flex items-start gap-2">
          <Calculator className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
          <span>Transaction fee: {txnFee}% for this business type.</span>
        </div>
      </div>

      {isTicketing ? (
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <LockKeyhole className="h-5 w-5 text-primary" />
              Markup Model — automatic for ticketing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Ticketing businesses use the markup model: no upfront subscription. A locally
              configured amount is added to each ticket listing, and a {txnFee}% platform fee
              is added to the customer&apos;s checkout total when applicable.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> No upfront subscription — no
                subscription bill
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> Instant wallet
                settlements on every ticket sale
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> Sell via website, web
                chat and WhatsApp
              </li>
            </ul>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Model toggle */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">How do you want to pay for Swiftree?</Label>
            <RadioGroup
              value={effectiveModel ?? ''}
              onValueChange={(value) => onPlanModelChange(value as V2PlanModel)}
              className="grid grid-cols-2 gap-3"
            >
              {(['subscription', 'markup'] as const).map((model) => {
                const selected = effectiveModel === model;
                return (
                  <Label
                    key={model}
                    htmlFor={`v2-model-${model}`}
                    className={`flex cursor-pointer flex-col gap-2 rounded-lg border-2 p-4 font-normal transition-all duration-200 ${
                      selected
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-200 bg-white hover:border-gray-300 dark:border-[#1F1F1F] dark:bg-background'
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">
                        {model === 'subscription' ? 'Subscription' : `Free (+ markup)`}
                      </span>
                      {model === 'subscription' && (
                        <Badge variant="outline" className="border-primary/20 text-primary">
                          No monthly
                        </Badge>
                      )}
                      <RadioGroupItem value={model} id={`v2-model-${model}`} />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {model === 'subscription'
                        ? 'Pay quarterly, bi-annually or yearly. No markup on your prices.'
                        : `No upfront subscription. A locally configured markup is added per listing; the ${txnFee}% platform fee is charged to the customer when applicable.`}
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Subscription duration */}
          {effectiveModel === 'subscription' && (
            <div className="space-y-4">
              <div className="rounded-lg border bg-muted/40 p-3 text-xs text-muted-foreground">
                There is no free trial. Subscription is paid upfront before your store is activated.
                Swiftree does not add markup to your listed product prices under this model.
              </div>
              {pricingError ? (
                <p role="alert" className="text-xs text-destructive">{pricingError}</p>
              ) : !pricingLoading && !subscriptionPricing ? (
                <p role="status" className="text-xs text-muted-foreground">
                  Subscription pricing has not been configured for this currency. Choose Markup to continue.
                </p>
              ) : !pricingLoading && subscriptionPricing && !subscriptionPricing.payment_ready ? (
                <p role="status" className="text-xs text-muted-foreground">
                  Subscription checkout is not ready for this currency. Choose Markup to continue.
                </p>
              ) : null}
              <RadioGroup
                value={billingInterval}
                onValueChange={(value) => onBillingIntervalChange(value as V2BillingInterval)}
                aria-label="Subscription duration"
                className="grid gap-3 sm:grid-cols-3"
                disabled={pricingLoading || !subscriptionPricing?.payment_ready}
              >
                {BILLING_OPTIONS.map((option) => {
                  const selected = billingInterval === option.value;
                  return (
                    <Label
                      key={option.value}
                      htmlFor={`v2-period-${option.value}`}
                      className={`flex cursor-pointer items-start gap-3 rounded-lg border-2 p-4 font-normal transition-colors ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-[#1F1F1F] dark:bg-background'
                      } ${pricingLoading || !subscriptionPricing?.payment_ready ? 'cursor-not-allowed opacity-60' : ''}`}
                    >
                      <RadioGroupItem value={option.value} id={`v2-period-${option.value}`} className="mt-0.5" />
                      <span className="space-y-1">
                        <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                        <span className="block text-xs text-muted-foreground">{option.description}</span>
                        <span className="block text-sm font-semibold tabular-nums text-primary">
                          {pricingLoading
                            ? 'Loading price…'
                            : subscriptionPricing
                              ? new Intl.NumberFormat(undefined, {
                                  style: 'currency',
                                  currency: subscriptionPricing.currency,
                                  maximumFractionDigits: 2,
                                }).format(subscriptionPricing.intervals[option.value].amount)
                              : 'Unavailable'}
                        </span>
                      </span>
                    </Label>
                  );
                })}
              </RadioGroup>
              {subscriptionPricing?.payment_ready && (
                <p className="rounded-lg border border-primary/20 bg-primary/5 p-3 text-xs text-foreground">
                  This plan renews automatically every {subscriptionPricing.intervals[billingInterval].months} months at{' '}
                  {new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: subscriptionPricing.currency,
                    maximumFractionDigits: 2,
                  }).format(subscriptionPricing.intervals[billingInterval].amount)}. The first payment is due now.
                </p>
              )}
            </div>
          )}

          {/* Markup detail card */}
          {effectiveModel === 'markup' && (
            <Card className="border-2 border-primary bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                  <BadgeCheck className="h-5 w-5 text-primary" />
                  How the markup model works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <ul className="space-y-1.5 text-xs">
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> No upfront
                      subscription — start selling immediately
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> A country-specific
                      markup is added to each product or ticket price
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> {txnFee}%
                      platform fee is added to the customer&apos;s checkout total when applicable
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> Buyer payments
                      settle instantly to your Swiftree wallet
                    </li>
                  </ul>

                  <div className="rounded-lg border bg-background p-3 text-xs">
                    <p className="mb-2 font-medium">Fee example ({currency})</p>
                    {[
                      ['Vendor item price', formatCurrency(10000)],
                      ['Customer platform fee', formatCurrency(10000 * (txnFee / 100))],
                      ['Vendor item earnings', formatCurrency(10000)],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-1">
                        <span className="text-muted-foreground">{label}</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}

/**
 * Wizard validation helper — true when the plan selection is complete
 * for the given business type (markup auto-selected for ticketing).
 */
export const isV2PlanStepValid = (
  businessType: V2BusinessType,
  planModel: V2PlanModel | null
): boolean => {
  if (businessType === 'ticketing') return true;
  if (!planModel) return false;
  return true;
};
