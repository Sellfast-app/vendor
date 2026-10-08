import { V2BusinessType, V2BillingInterval, V2PlanModel, V2_MARKUP_LISTING_PAD } from "./v2";

export interface BillingPreview {
  businessType: V2BusinessType;
  model: V2PlanModel;
  interval: V2BillingInterval;
  expiresAt: string | null;
  pendingMarkup: boolean;
}
export const billingPreviewDefault: BillingPreview = {
  businessType: "retail", model: "subscription", interval: "quarterly",
  expiresAt: null, pendingMarkup: false,
};
export function activeSubscription(state: BillingPreview, now = Date.now()) {
  return state.model === "subscription" && !!state.expiresAt && Date.parse(state.expiresAt) > now;
}
export function effectiveModel(state: BillingPreview, now = Date.now()): V2PlanModel {
  if (state.businessType === "ticketing") return "markup";
  if (state.pendingMarkup && state.expiresAt && Date.parse(state.expiresAt) <= now) return "markup";
  return state.model;
}
export function switchToMarkup(state: BillingPreview, now = Date.now()): BillingPreview {
  return activeSubscription(state, now) && state.businessType !== "ticketing"
    ? { ...state, pendingMarkup: true }
    : { ...state, model: "markup", pendingMarkup: false, expiresAt: null };
}
export function listingPrice(base: number, state: BillingPreview, now = Date.now()) {
  if (!Number.isFinite(base) || base < 0) throw new Error("Enter a valid base price.");
  const markup = effectiveModel(state, now) === "markup" ? V2_MARKUP_LISTING_PAD : 0;
  return { base, markup, total: base + markup };
}
export function billingPreviewKey() {
  return "swiftree:billing-preview:" + (localStorage.getItem("store_id") || "demo");
}
export function readBillingPreview(): BillingPreview {
  const raw = localStorage.getItem(billingPreviewKey());
  if (!raw) return billingPreviewDefault;
  const value = JSON.parse(raw) as BillingPreview;
  if (!["retail", "food", "ticketing"].includes(value.businessType) ||
      !["subscription", "markup"].includes(value.model) ||
      !["quarterly", "biannually", "yearly"].includes(value.interval) ||
      typeof value.pendingMarkup !== "boolean" ||
      !(value.expiresAt === null || (typeof value.expiresAt === "string" && Number.isFinite(Date.parse(value.expiresAt))))) {
    throw new Error("Saved billing preview is invalid.");
  }
  return value;
}
export function saveBillingPreview(state: BillingPreview) {
  localStorage.setItem(billingPreviewKey(), JSON.stringify(state));
  window.dispatchEvent(new Event("swiftree-billing-preview"));
}
