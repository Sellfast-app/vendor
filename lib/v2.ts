/**
 * Swiftree V2.0 — core business domain types.
 *
 * V2 restricts onboarding to three business verticals and four countries,
 * and introduces the subscription-vs-markup monetization model.
 *
 * IMPORTANT — legacy compatibility:
 * Existing stores were onboarded with freeform business types such as
 * "Restaurant/Food Service", "Retail Store", "Fashion", etc. Every
 * vertical check MUST go through `toV2BusinessType` so legacy values
 * keep resolving to the correct vertical until the backend migration
 * completes.
 */

export const V2_BUSINESS_TYPES = ['retail', 'ticketing', 'food'] as const;
export type V2BusinessType = (typeof V2_BUSINESS_TYPES)[number];

export const V2_COUNTRIES = ['NG', 'UK', 'KE', 'GH'] as const;
export type V2Country = (typeof V2_COUNTRIES)[number];

export type V2PlanModel = 'subscription' | 'markup';

export const V2_BILLING_INTERVALS = ['quarterly', 'biannually', 'yearly'] as const;
export type V2BillingInterval = (typeof V2_BILLING_INTERVALS)[number];

/** Transaction fee (%) charged per business type under the markup model. */
export const V2_MARKUP_TRANSACTION_FEES: Record<V2BusinessType, number> = {
  retail: 3,
  food: 5,
  ticketing: 5,
};

/** Flat amount added to every product/ticket listing price under the markup model (₦). */
export const V2_MARKUP_LISTING_PAD = 500;

export interface V2CountryInfo {
  code: V2Country;
  name: string;
  flag: string;
  currency: string;
  currencySymbol: string;
  dialCode: string;
}

export const V2_COUNTRY_INFO: Record<V2Country, V2CountryInfo> = {
  NG: { code: 'NG', name: 'Nigeria', flag: '🇳🇬', currency: 'NGN', currencySymbol: '₦', dialCode: '+234' },
  UK: { code: 'UK', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', currencySymbol: '£', dialCode: '+44' },
  KE: { code: 'KE', name: 'Kenya', flag: '🇰🇪', currency: 'KES', currencySymbol: 'KSh', dialCode: '+254' },
  GH: { code: 'GH', name: 'Ghana', flag: '🇬🇭', currency: 'GHS', currencySymbol: '₵', dialCode: '+233' },
};

export interface V2BusinessTypeInfo {
  value: V2BusinessType;
  label: string;
  description: string;
  /** Legacy freeform business types that resolve to this vertical. */
  legacyValues: string[];
}

export const V2_BUSINESS_TYPE_INFO: Record<V2BusinessType, V2BusinessTypeInfo> = {
  retail: {
    value: 'retail',
    label: 'Retail & Wholesale Store',
    description: 'Sell physical products online with variants, inventory and collections.',
    legacyValues: [
      'retail store',
      'e-commerce',
      'fashion',
      'health & beauty',
      'technology',
      'electronics',
      'professional services',
      'education',
      'real estate',
      'other',
    ],
  },
  ticketing: {
    value: 'ticketing',
    label: 'Ticketing',
    description: 'Create events, sell tickets and manage attendees across every channel.',
    legacyValues: [],
  },
  food: {
    value: 'food',
    label: 'Food & Restaurant',
    description: 'Digital menus, portions and bundles with food-specific delivery.',
    legacyValues: ['restaurant/food service'],
  },
};

const LEGACY_TO_V2_MAP: Map<string, V2BusinessType> = (() => {
  const map = new Map<string, V2BusinessType>();
  for (const info of Object.values(V2_BUSINESS_TYPE_INFO)) {
    map.set(info.value, info.value);
    for (const legacy of info.legacyValues) map.set(legacy, info.value);
  }
  return map;
})();

export const normalizeBusinessTypeString = (businessType: unknown): string =>
  typeof businessType === 'string'
    ? businessType
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\s*\/\s*/g, '/')
        .toLowerCase()
    : '';

/**
 * Resolve any business type (V2 enum value or legacy freeform string)
 * to one of the three V2 verticals. Unknown values fall back to 'retail'.
 */
export const toV2BusinessType = (businessType: unknown): V2BusinessType =>
  LEGACY_TO_V2_MAP.get(normalizeBusinessTypeString(businessType)) ?? 'retail';

export const isV2FoodBusiness = (businessType: unknown): boolean =>
  toV2BusinessType(businessType) === 'food';

export const isV2TicketingBusiness = (businessType: unknown): boolean =>
  toV2BusinessType(businessType) === 'ticketing';

export const isV2RetailBusiness = (businessType: unknown): boolean =>
  toV2BusinessType(businessType) === 'retail';

export const isValidV2Country = (country: unknown): country is V2Country =>
  typeof country === 'string' && (V2_COUNTRIES as readonly string[]).includes(country);

export const isValidV2BusinessType = (businessType: unknown): businessType is V2BusinessType =>
  typeof businessType === 'string' && (V2_BUSINESS_TYPES as readonly string[]).includes(businessType);

export const isValidV2BillingInterval = (interval: unknown): interval is V2BillingInterval =>
  typeof interval === 'string' && (V2_BILLING_INTERVALS as readonly string[]).includes(interval);

/**
 * Subscription plan tiers for the subscription model. Prices are placeholders
 * pending final Swiftree V2 pricing — tune here only.
 */
export interface V2PlanTier {
  id: 'starter' | 'growth' | 'pro';
  name: string;
  description: string;
  /** Base price per billing interval, in the store's local currency. */
  price: Record<V2BillingInterval, number>;
  recommended?: boolean;
  features: string[];
}

export const V2_PLAN_TIERS: V2PlanTier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'For new businesses still figuring things out',
    price: { quarterly: 15000, biannually: 27500, yearly: 50000 },
    features: [
      'Add & manage products',
      'Business website',
      'Send invoices/receipts',
      'Create discounts & coupons',
      'Simple business analytics',
    ],
  },
  {
    id: 'growth',
    name: 'Growth',
    description: 'For growing businesses with a small team & multiple locations',
    price: { quarterly: 30000, biannually: 55000, yearly: 100000 },
    recommended: true,
    features: [
      'Everything in Starter',
      'Add up to 3 staff accounts',
      'Manage up to 2 store locations',
      'Automated logistics rates at checkout',
      'Sales channel analytics',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'For large multi-location businesses and chains',
    price: { quarterly: 60000, biannually: 105000, yearly: 190000 },
    features: [
      'Everything in Growth',
      'Unlimited staff accounts',
      'Manage up to 5 store locations',
      'Priority support',
      'Advanced analytics',
    ],
  },
];

/** V2 onboarding selection carried through signup. */
export interface V2OnboardingSelection {
  businessType: V2BusinessType;
  country: V2Country;
  planModel: V2PlanModel;
  billingInterval?: V2BillingInterval;
  planTier?: V2PlanTier['id'];
}

/**
 * Serialize the V2 selection into business_details.metadata so the payload
 * stays backward-compatible with the current backend, which ignores
 * unknown metadata fields. When the V2 backend ships, these can be
 * promoted to top-level fields.
 */
export const v2SelectionToMetadata = (selection: V2OnboardingSelection) => ({
  v2: {
    business_type: selection.businessType,
    country: selection.country,
    plan_model: selection.planModel,
    ...(selection.billingInterval ? { billing_interval: selection.billingInterval } : {}),
    ...(selection.planTier ? { plan_tier: selection.planTier } : {}),
  },
});
