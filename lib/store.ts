/**
 * Legacy business-type helpers.
 *
 * V2 replaces freeform business types with the three-vertical model
 * (retail | ticketing | food). Use the helpers in `@/lib/v2` for all
 * new code; these exports remain for existing call sites and keep
 * working against both legacy and V2 values.
 */
import { isV2FoodBusiness } from './v2';

/** @deprecated Use `isV2FoodBusiness` from `@/lib/v2` instead. */
export const normalizeBusinessType = (businessType: unknown) =>
  typeof businessType === 'string'
    ? businessType
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\s*\/\s*/g, '/')
        .toLowerCase()
    : '';

/** @deprecated Use `isV2FoodBusiness` from `@/lib/v2` instead. */
export const isFoodBusinessType = (businessType: unknown) =>
  isV2FoodBusiness(businessType);
