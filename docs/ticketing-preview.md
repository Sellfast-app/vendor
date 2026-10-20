# Ticketing API Handoff

## Implemented in V2

- Vendor event creation/editing reads and writes backend event records, including
  paid, free and invite-only ticket types and optional fixed/percentage discounts.
- Ticket orders are read from the backend order/admission records with event,
  customer, status, payment and pagination filters. There are no local preview
  bookings in the vendor orders UI.
- The attendee scanner validates opaque ticket tokens through the API and checks
  in only a valid, paid/free, confirmed admission for the selected event.
- Check-in writes an immutable vendor audit entry.
- API schema requirements: migrations `036_ticketing_admissions.sql` and
  `041_v2_ticket_event_management.sql` must be applied.

## Still Required for Ticket Sales

- A storefront ticket catalogue and checkout that requests authoritative quotes,
  checks capacity and per-customer limits, and creates an idempotent order.
- Paid-ticket payment initialization and webhook-confirmed settlement. A client
  callback alone must never issue admissions.
- Free-ticket booking without a gateway, while still reserving capacity safely.
- Atomic admission/QR token issuance after verified payment or free booking,
  followed by customer email delivery and authorized ticket retrieval/resend.
- Release expired/failed payment reservations and prevent overselling under
  concurrent checkout.
- Vendor attendee listing with event-scoped filters and pagination.
- Cancellation/refund processing that revokes the affected admissions after the
  provider confirms the refund. No ticket purchase or refund flow is implied by
  the current order-list/scanner endpoints.

## Operational Notes

- A ticket order list that returns no rows is valid until the purchase flow is
  implemented; do not generate fixture data to fill it.
- Configure `VENDOR_DASHBOARD_URL` or `FRONTEND_URL` on the API so staff
  invitation emails resolve to this vendor app.
- Camera use requires HTTPS (localhost is supported); manual QR token entry is
  available when camera permission is unavailable.
