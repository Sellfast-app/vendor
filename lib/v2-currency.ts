import { V2_COUNTRY_INFO, type V2Country } from './v2';

export function getCurrencySymbol(currency: string): string {
  try {
    return new Intl.NumberFormat('en', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 0,
    }).formatToParts(0).find((part) => part.type === 'currency')?.value || currency;
  } catch {
    return currency;
  }
}

export function formatStoreCurrency(value: number, currency: string): string {
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(value);
}

export function getStoreCurrency(store: unknown): string {
  if (!store || typeof store !== 'object') return 'NGN';
  const data = store as { metadata?: { v2?: { currency?: string; country?: string } } };
  const v2 = data.metadata?.v2;
  if (v2?.currency) return v2.currency;
  const country = v2?.country as V2Country | undefined;
  if (country && country in V2_COUNTRY_INFO) return V2_COUNTRY_INFO[country].currency;
  return 'NGN';
}
