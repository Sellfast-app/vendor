'use client';

/**
 * V2 onboarding step: monetization model selection.
 *
 * Two models per the V2 PRD:
 * - Subscription: quarterly/bi-annual/yearly billing, no product markup.
 * - Markup: ₦0 upfront, +₦500 auto-added to each listing price, platform
 *   transaction fee (3% retail / 5% food / 5% ticketing) split to the
 *   Swiftree master wallet at checkout.
 *
 * Ticketing vendors must use the markup model (mandatory per PRD).
 *
 * Built on the existing shadcn primitives used across the vendor app.
 *
 * References: Bumpa "Choose your Bumpa Plan" (refs #2-3),
 * Daash plan screen (ref #32).
 */

import { BadgeCheck, Check, Sparkles, Tag } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  V2_BILLING_INTERVALS,
  V2BillingInterval,
  V2BusinessType,
  V2_MARKUP_LISTING_PAD,
  V2_MARKUP_TRANSACTION_FEES,
  V2_PLAN_TIERS,
  V2PlanModel,
  V2PlanTier,
} from '@/lib/v2';

const INTERVAL_LABELS: Record<V2BillingInterval, string> = {
  quarterly: 'Quarterly',
  biannually: 'Bi-annually',
  yearly: 'Yearly',
};

const INTERVAL_SUFFIX: Record<V2BillingInterval, string> = {
  quarterly: 'Billed quarterly (every 3 months)',
  biannually: 'Billed bi-annually (every 6 months)',
  yearly: 'Billed yearly (every 12 months)',
};

interface V2PlanStepProps {
  businessType: V2BusinessType;
  planModel: V2PlanModel | null;
  billingInterval: V2BillingInterval;
  planTier: V2PlanTier['id'] | null;
  onPlanModelChange: (value: V2PlanModel) => void;
  onBillingIntervalChange: (value: V2BillingInterval) => void;
  onPlanTierChange: (value: V2PlanTier['id']) => void;
}

export default function V2PlanStep({
  businessType,
  planModel,
  billingInterval,
  planTier,
  onPlanModelChange,
  onBillingIntervalChange,
  onPlanTierChange,
}: V2PlanStepProps) {
  const isTicketing = businessType === 'ticketing';
  const txnFee = V2_MARKUP_TRANSACTION_FEES[businessType];
  const effectiveModel: V2PlanModel | null = isTicketing ? 'markup' : planModel;

  return (
    <div className="space-y-6">
      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold text-primary">Choose your Swiftree plan</h1>
        <p className="text-xs text-muted-foreground">
          Two ways to run your business on Swiftree — pick what suits you
        </p>
      </div>

      {isTicketing ? (
        <Card className="border-2 border-primary bg-primary/5">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-semibold">
              <Tag className="h-5 w-5 text-primary" />
              Markup Model — automatic for ticketing
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Ticketing businesses run on the markup model: ₦0 upfront subscription. Instead,
              ₦{V2_MARKUP_LISTING_PAD.toLocaleString()} is added to each ticket listing and a{' '}
              {txnFee}% transaction fee applies per sale. Everything else stays free.
            </p>
            <ul className="space-y-1.5 text-xs">
              <li className="flex items-center gap-2">
                <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> ₦0 upfront — no
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
                        {model === 'subscription' ? 'Subscription' : 'Markup'}
                      </span>
                      <RadioGroupItem value={model} id={`v2-model-${model}`} />
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {model === 'subscription'
                        ? 'Pay quarterly, bi-annually or yearly. No markup on your prices.'
                        : `₦0 upfront. +₦${V2_MARKUP_LISTING_PAD.toLocaleString()} per listing and ${txnFee}% per sale.`}
                    </span>
                  </Label>
                );
              })}
            </RadioGroup>
          </div>

          {/* Subscription tiers */}
          {effectiveModel === 'subscription' && (
            <div className="space-y-4">
              <Tabs
                value={billingInterval}
                onValueChange={(value) => onBillingIntervalChange(value as V2BillingInterval)}
              >
                <TabsList className="grid w-full grid-cols-3">
                  {V2_BILLING_INTERVALS.map((interval) => (
                    <TabsTrigger key={interval} value={interval} className="text-xs">
                      {INTERVAL_LABELS[interval]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>

              <RadioGroup
                value={planTier ?? ''}
                onValueChange={(value) => onPlanTierChange(value as V2PlanTier['id'])}
                className="grid gap-3"
              >
                {V2_PLAN_TIERS.map((tier) => {
                  const selected = planTier === tier.id;
                  return (
                    <Label
                      key={tier.id}
                      htmlFor={`v2-tier-${tier.id}`}
                      className={`relative flex cursor-pointer flex-col gap-3 rounded-lg border-2 p-4 font-normal transition-all duration-200 ${
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 bg-white hover:border-gray-300 dark:border-[#1F1F1F] dark:bg-background'
                      }`}
                    >
                      {tier.recommended && (
                        <Badge className="absolute -top-2.5 right-4">RECOMMENDED</Badge>
                      )}
                      <span className="flex items-start justify-between gap-3">
                        <span className="flex items-center gap-3">
                          <RadioGroupItem value={tier.id} id={`v2-tier-${tier.id}`} />
                          <span className="space-y-1">
                            <span className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground">
                                {tier.name}
                              </span>
                              {tier.recommended && (
                                <Sparkles className="h-3.5 w-3.5 text-primary" />
                              )}
                            </span>
                            <span className="block text-xs text-muted-foreground">
                              {tier.description}
                            </span>
                          </span>
                        </span>
                        <span className="shrink-0 text-right">
                          <span className="block text-base font-bold text-primary">
                            ₦{tier.price[billingInterval].toLocaleString()}
                          </span>
                          <span className="block text-[10px] text-muted-foreground">
                            {INTERVAL_SUFFIX[billingInterval]}
                          </span>
                        </span>
                      </span>
                      {selected && (
                        <span className="grid gap-1.5 border-t pt-3">
                          {tier.features.map((feature) => (
                            <span key={feature} className="flex items-center gap-2 text-xs">
                              <Check className="h-3.5 w-3.5 shrink-0 text-primary" />
                              {feature}
                            </span>
                          ))}
                        </span>
                      )}
                    </Label>
                  );
                })}
              </RadioGroup>
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
                <ul className="space-y-1.5 text-xs">
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> ₦0 upfront
                    subscription — start selling immediately
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> ₦
                    {V2_MARKUP_LISTING_PAD.toLocaleString()} auto-added to each product listing
                    price (you keep your base price)
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> {txnFee}%
                    transaction fee per sale, split automatically at checkout
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary" /> Buyer payments
                    settle instantly to your Swiftree wallet
                  </li>
                </ul>
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
  planModel: V2PlanModel | null,
  planTier: V2PlanTier['id'] | null
): boolean => {
  if (businessType === 'ticketing') return true;
  if (!planModel) return false;
  if (planModel === 'subscription' && !planTier) return false;
  return true;
};
