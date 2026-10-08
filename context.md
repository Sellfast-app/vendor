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

## Food inventory (Daash reference, October 8)

### UI and routes

- Inventory expands to Items (/inventory/items), Categories (/inventory/categories)
  and Units (/inventory/units). No Sub-recipes or Purchase logging in this scope.
- The existing food Products view now opens the Inventory items UI. Retail products
  remain unchanged. Inventory routes stay accessible for frontend review without
  a successful store API response; business-specific navigation requires authoritative
  store context when API integration begins.
- Three right-side drawers replace the food inventory creation experience:
  Add item, Create category and Create unit.
- Item fields: name, optional 200-character description, quantity, unit, price 1,
  optional price 2, derived total, optional category, low-stock toggle and threshold.
- Preserve multiple image selection with thumbnails below the picker. Maximum
  five images, each PNG/JPG/GIF up to 10 MB before client compression.
- Category fields: name, description, apply-to-all-branches.
- Unit fields: name, optional abbreviation (10 characters maximum), description,
  apply-to-all-branches.
- Platform units currently displayed: Pack, Pieces, Kg, Gram, Litre, Gallon.
  They cannot be edited or deleted through the custom-unit UI.

### Required dropdown relationships

Categories created by the vendor MUST appear in the item category dropdown.
Custom units MUST appear alongside platform-defined units in the item unit dropdown.
Use stable category/unit IDs, not display names, in saved item payloads.
After a successful create/edit, invalidate or update dependent option queries
immediately; no reload should be needed. Preserve existing selected IDs on edit.
Do not duplicate options after pagination/refetch. Enforce case-insensitive names
and non-conflicting unit abbreviations on the server.
The unit dropdown is required; category can be No category.
Disallow deleting a unit/category referenced by an item unless the backend defines
an explicit reassignment/archive policy. Renaming must not break references.

### API contract to agree

- Store/branch-scoped list/create/update/archive endpoints for items, categories,
  custom units, plus platform unit retrieval. Paths are not yet assumed.
- Server authorization must enforce store ownership, branch scope and staff
  inventory permissions. Apply-to-all-branches must be a server operation with
  defined semantics for existing versus future branches.
- Quantity supports fractional amounts for measured units. Define precision,
  conversions and allowed decimal places server-side.
- Total inventory value currently previews quantity times price 1. Confirm whether
  this represents purchase cost or selling price. Price 2's meaning (alternate,
  wholesale or cost price) is not defined by the screenshots: do not use it for
  checkout until agreed. Both prices remain base values, never compounded markup.
- Clarify whether these are raw stock ingredients or sellable food items; Daash's
  Inventory is distinct from Menu. This UI does not delete the legacy customizable,
  portion, add-on or bundle domain models. Map those explicitly before replacing
  their production endpoints or feeding this inventory directly to the storefront.
- Low-stock threshold defaults to 4 when enabled. The preview shows stock status;
  actual notifications, delivery channels and deduplication are backend work.
- Persist uploaded asset IDs/URLs and order; first image is the primary image.
  Handle compression, upload progress, failed retry, removal and abandoned uploads.
  Local base64 storage is only for preview, not the production upload contract.
- Add pagination/search/category/status filters and aggregate stats server-side.
  Inventory import needs a validated, documented schema; no pretend import action
  is included. Current export is a JSON preview backup, not a production import format.

### Preview boundaries

Records are stored under swiftree:food-inventory-preview:<store_id or demo>.
Create/edit/delete, search, filters, pagination, category/unit relationships and
image previews work locally. Cross-device sync, real branch propagation, stock
deduction and storefront publishing are not implemented. The all-branches flag
is captured but does not fabricate branches. Existing API product payloads are
not rewritten. Saved malformed data is not silently overwritten.

## Single-branch storefront shopping

### Agreed customer flow
- One branch per cart; no All branches catalogue.
- Initial selection: valid branch link (?branch=id), then remembered branch,
  then the vendor's default online branch. If a cart already exists, its branch
  takes precedence until the customer confirms clearing it.
- Display Shopping from on retail and food storefronts and checkout.
- A branch controls products, option prices, availability, stock and fulfillment.
- Empty cart: switch immediately. Nonempty cart: Keep current branch or
  Clear cart and switch. No silent repricing or partial cart transfer.
- Clear checkout quotes, coupon reservations/validation, chosen shipping rates,
  pickup selection and stale product snapshots when switching.
- Location may suggest a branch but must not silently switch or change prices.
- Out-of-coverage addresses must prompt the customer, not auto-switch the cart.

### Vendor/API requirements
- Add default_online_branch_id using existing branch records, not duplicate
  pickup addresses. Require one enabled default; handle disabled/deleted branches.
- Shared products retain base prices. Branch records hold availability, stock,
  and optional price overrides at product/variant/portion/serving-option level.
- No override means inherit base price. Resolve branch override FIRST, then
  monetization markup exactly once. Price 2 is not a branch override.
- Read enabled branches with stable IDs, names, addresses, default flag, currency,
  hours and fulfillment capabilities; expose only public fields to customers.
- Catalogue/search/product-detail requests must include branch_id and return
  effective prices, stock and a pricing version for that branch.
- Cart, quote, coupon validation, shipping quote and order must include branch_id.
  Server must reject cross-store branches and mixed-branch items, and validate
  stock, price, coupon eligibility, address coverage and pickup ownership.
- Existing delivery-rate and pickup APIs must filter by branch. Do not attach
  an unrelated branch's address or fees to the selected branch.
- Reserve inventory per branch and decrement only after successful order/payment.
  Record immutable branch/pricing snapshots on orders for vendor fulfillment.
- Bind persisted carts to store_id + branch_id + pricing version. Revalidate
  old carts and handle cross-tab/device changes and expired quote/reservation state.
- Branch switching must release any server reservations idempotently.
- Tenant authorization, inventory permissions, audit logs, cache invalidation
  and concurrency protection must be enforced server-side.

### Current frontend preview and remaining integration
- Selector applies ONLY to mock retail/food storefronts; live stores and ticketing
  are unchanged. Two fixed preview branches demonstrate different prices and
  catalogue availability. They are not real vendor branches.
- Retail product detail resolves the same branch catalogue as listing.
- Food portions/serving prices use branch data; add-ons are not marked up again.
- Selected branch survives refresh; shared links support ?branch=main or lagos.
- Switching returns to the storefront catalogue and resets checkout draft/cart.
- Food pickup display uses the selected preview branch address.
- Vendor default-branch editing, per-branch inventory/price editing, real pickup
  and shipping eligibility are still API integration work, not synchronized here.
- No geolocation permission prompt, automatic nearest-branch selection or
  multi-branch checkout is introduced.
