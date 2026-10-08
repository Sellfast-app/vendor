# Swiftree V2 integration context

## Scope and status

The v2 branch is a frontend preview. Do not treat localStorage, simulated plan
changes, preview prices or test tickets as authoritative billing/payment data.
Do not port these preview controls into main/staging production integrations.
Preserve Swiftree branding and the existing retail/food purchase flows.

## Monetization rules

- Retail and food support Subscription or Markup.
- Ticketing requires Markup; subscription cannot be selected.
- Subscription intervals: quarterly, bi-annually, yearly. No monthly plans.
- Subscription adds no product markup. Transaction fees still apply:
  retail 3%, food 5%.
- Markup has no upfront subscription charge. Add NGN 500 to each product/ticket
  unit price. Transaction fees: retail 3%, food 5%, ticketing 5%.
- For a base price of NGN 5,000, markup customer price is NGN 5,500.
  Two units cost NGN 11,000 before delivery, discounts and other approved charges.
- Markup split: platform receives markup plus the transaction percentage of the
  base price; vendor receives base minus that percentage. Delivery is separate.
  Do not charge the transaction percentage again to the buyer without an agreed rule.
- Subscription tier names/prices currently in lib/v2.ts are placeholders, not
  approved billing prices. Finance intentionally does not present them as payable.
- Nigeria rates are defined above. Do not interpret NGN 500 as GBP/KES/GHS/RWF 500.
  Obtain authoritative currency-specific pricing before localization.

## Switching an active subscription to markup

1. Vendor selects the Markup card in Settings > Finance & Billings.
2. Fetch current billing state and the exact paid-period end timestamp.
3. Show a confirmation: the subscription stays active until that timestamp,
   will not renew, and markup begins on all product prices only after it expires.
4. Cancelling the modal does nothing.
5. On confirmation, schedule the change atomically and disable renewal with the
   billing provider. Only acknowledge success after the server records the change.
6. Keep effective model Subscription and markup zero throughout the paid period.
7. Show current plan, paid-through date, non-renewal state, scheduled model and date.
8. At expiry, the server activates Markup for all existing and newly added listings.
   This must happen even if the vendor never opens the app again.
9. Permit cancelling the scheduled switch before expiry. Backend must confirm both
   removal of the scheduled change and restoration of renewal authorization.
10. No active paid subscription: allow immediate Markup after server confirmation.
    An unknown/loading billing state is NOT proof that there is no active subscription.

Do not revoke prepaid access, apply markup early or promise a refund/proration.
Confirm provider cancellation semantics, failed renewal handling and cutover races.
Switching back from Markup to Subscription takes effect only after verified
subscription payment, never on a client-side click or redirect.

## Pricing and checkout integration

- Store the vendor's base price separately from customer-facing effective price.
- Derive effective unit price from the server-authoritative effective plan.
- Never bulk-increment stored base prices or accept client-supplied markup totals.
- Repeated uploads/edits, retries and model switches must not compound the markup.
- Subscription views omit the markup row entirely.
- Apply the selected variant/portion/serving base price, then markup once per
  sellable unit. Never add markup independently to every food add-on.
- Confirm how bundles, free tickets/products, sale prices and coupons interact
  with markup before shipping. The preview calculator is not the final quote engine.
- Quote every channel (website, web chat, WhatsApp) using the same pricing service.
- Revalidate cart/quote at plan cutover. Version and expire quotes; agree whether
  an already-reserved order keeps its prior price. Never silently change a charged order.
- Persist base amount, markup, quantity, discounts, fees, delivery, effective model,
  pricing version and settlement split on each order for reconciliation.

## Implemented preview

- Finance: Subscription/Markup cards, permitted intervals, confirmation dialog,
  scheduled change/cancellation, transaction fee copy and a price calculator.
- Explicit Preview scenario controls select business type and paid-through date.
  These are test inputs, not real subscriptions.
- Preview is stored under swiftree:billing-preview:<store_id or demo>.
- Product base-price, food portion and customizable serving-price inputs show a
  derived markup preview only for effective Markup. Saved product payloads are unchanged.
- Other product surfaces, variant tables, ticket editors and customer storefront
  totals are not yet wired to this preview model. Do not claim catalog-wide live pricing.
- Signup already serializes selections in business_details.metadata.v2. Finance
  is not yet hydrated from signup/server metadata; use preview controls for now.
- Preview expiry is evaluated in the browser; it does not schedule any server task.
- Subscription selection in the preview does not activate or charge a subscription.

## Backend contract to agree (no endpoint paths assumed)

- Read store-scoped billing: business type, currency, effective model, subscription
  status, tier, interval, paid-through time, renewal status and pending change.
- Read approved plan catalogue/prices and currency-specific markup/fee rules.
- Initialize/verify subscription payment, with webhook-confirmed activation.
- Schedule/cancel model changes with idempotency keys, optimistic concurrency,
  authoritative timestamps, finance permissions and audit history.
- Background expiry transition with retries and reconciliation to the billing provider.
- Server quote/split pricing and storefront effective-price responses/cache invalidation.
- Include validation, permission denied, stale state, loading, retry and provider failure states.
- Tenant isolation is mandatory; browser-selected store IDs are not authorization.

## Acceptance checks

- Active Subscription -> schedule Markup: no price change until expiry.
- Confirm twice/retry: one pending change and one eventual transition.
- Cancel before expiry: remain Subscription, restore renewal only after confirmation.
- At expiry: base + 500, exactly once, for old and new listings.
- Subscription: no markup row; no monthly interval.
- Ticketing: only Markup.
- Refresh preserves preview; malformed preview storage must not mutate live prices.
- Backend cutover, concurrent edits, failed payments, quantity, coupons, multiple
  currencies and all sales channels require integration tests before production.

## Ticketing context

See docs/ticketing-preview.md for checkout, emailed QR issuance, permissions,
atomic admission validation, and the boundary between preview and production.
