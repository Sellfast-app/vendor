# Ticketing preview and backend handoff

## Current scope

This is a frontend-only implementation on the v2 branch, not a production ticketing system.
No payment is collected, email sent, inventory reserved, or live admission authorized.
The existing checkout price calculation remains a preview calculation, not an authoritative quote.

## Preview workflow

1. In storefront, open /storefront/mockevent, select tickets and continue to checkout.
2. Enter first name, last name, email and WhatsApp number. There is no delivery step.
3. Simulate payment success or failure; free tickets use Confirm free test booking.
4. Success saves one booking and generates a separate test QR code for each admission.
5. Download preview booking. My tickets (/storefront/mockevent/tickets) recovers saved bookings after refresh.
6. In vendor, open Orders > Ticket orders (/orders/tickets) and import the booking JSON.
7. Open Events > Attendees & check-in (/events/attendees), select the event, and scan or enter a ticket code.
8. Review the attendee and confirm check-in. Repeated scans are rejected.

Booking imports are intentional: localStorage is not shared between storefront and vendor origins.
These files contain customer information and should only contain test data.
Re-importing a booking does not overwrite cancellation or check-in history.
Records are local to the browser and are lost if site data is cleared.
Cross-tab check-ins use Web Locks when available; this does not protect multiple devices.
The camera needs permission and HTTPS (localhost is supported). Manual code entry is available.
Retail and food checkout/order tables are unchanged.

## Production contract required

Agree actual endpoint paths with the backend; none are invented or called here.

- Quote/reserve: store, event, ticket type quantities and customer details; return authoritative prices,
  fees, availability, reservation ID and expiry. Enforce capacity and per-customer limits server-side.
- Create order/initialize payment: reservation plus idempotency key; return order ID and payment action.
  Do not issue tickets on a client-side payment callback.
- Verified gateway webhook: atomically settle the order, consume capacity and issue unique admissions.
  Retry safely without duplicate tickets or emails. Expired/failed payments release reservations.
- Free orders: atomically validate capacity and issue tickets without a gateway.
- Order status and ticket retrieval: authorize the buyer via a signed/expiring link or authenticated session.
- Email delivery: send the event, venue/time, ticket type and unique QR per admission; record delivery
  status and support authorized resend. Email delivery failure must not recreate the order.
- Vendor order/attendee lists: tenant- and event-scoped search, pagination, payment and attendance status.
- Validate QR: an opaque or signed token resolved server-side; enforce store, event, payment,
  cancellation/refund state and event admission window.
- Confirm admission: atomic unused-to-checked-in transition with an idempotency key.
  Return explicit valid, already-used, wrong-event, invalid and cancelled outcomes.
- Permissions: separate view-orders, view-attendees, check-in and resend capabilities; verify server-side.
- Audit: record staff identity, event, admission, timestamp and prior/new state.
- Refund/cancel: revoke affected admissions. A single order may contain multiple independent tickets.

Remove preview import/simulated payment controls when integrating production.
Do not use test QR payloads, browser storage or imported files as live admission authority.
Offline check-in and QR transfer protection are not implemented.

## Verification

Run node --test tests/ticket-preview.test.cjs and npx tsc --noEmit in each repository.
Tests cover valid/free bookings, malformed imports, duplicate tokens, wrong-event and cancelled
tickets, duplicate admission, immutable check-in updates and re-import preservation.
Camera scanning and responsive browser inspection still require manual testing.

