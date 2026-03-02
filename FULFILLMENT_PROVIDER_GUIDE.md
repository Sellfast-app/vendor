# Frontend Integration Guide: Fulfillment Provider Expansion

## Overview

The fulfillment structure has been expanded to support **vendor self-delivery** in addition to the existing pickup and platform (Sendbox) delivery options.

**Key Point:** The `fulfillment_provider` is **determined server-side** based on what the store has enabled. Customers don't choose the fulfillment provider—instead, the backend automatically assigns it based on the store's configuration. The frontend adapts its UI and behavior based on the store's enabled fulfillment modes.

---

## 1. Fulfillment Provider Types

The system now supports three fulfillment modes:

| Provider     | Description                    | Address Required | Shipment Created | Use Case                                     |
| ------------ | ------------------------------ | ---------------- | ---------------- | -------------------------------------------- |
| **pickup**   | Customer picks up from store   | No               | No               | Customer collects order from store location  |
| **platform** | Third-party delivery (Sendbox) | Yes              | Yes              | Automated courier delivery with tracking     |
| **vendor**   | Vendor self-delivery           | Yes              | No               | Vendor handles delivery directly to customer |

---

## 2. Vendor Store Configuration

Before orders can use specific fulfillment modes, vendors must enable them for their store.

### Enable Fulfillment Modes for Store

**Endpoint:** `PATCH /api/stores/{storeId}`

**Request Body:**

```json
{
  "enabled_fulfillment_modes": ["pickup", "platform", "vendor"]
}
```

**Response:**

```json
{
  "status": "success",
  "message": "Store updated",
  "data": {
    "id": "store-uuid",
    "store_name": "My Store",
    "enabled_fulfillment_modes": ["pickup", "platform", "vendor"],
    ...
  }
}
```

### Common Configurations

**Pickup Only:**

```json
{
  "enabled_fulfillment_modes": ["pickup"]
}
```

**Pickup + Platform Delivery:**

```json
{
  "enabled_fulfillment_modes": ["pickup", "platform"]
}
```

**All Three Modes:**

```json
{
  "enabled_fulfillment_modes": ["pickup", "platform", "vendor"]
}
```

---

## 3. Checking Enabled Fulfillment Modes

**Endpoint:** `GET /api/stores/{storeId}`

**Response includes:**

```json
{
  "id": "store-uuid",
  "store_name": "My Store",
  "enabled_fulfillment_modes": ["pickup", "platform", "vendor"],
  ...
}
```

### Frontend Implementation

The frontend fetches the store details to see what fulfillment modes are available, then **adapts the UI accordingly**. The customer doesn't actively select a fulfillment provider—instead, the backend determines it based on store configuration.

```typescript
// Fetch store and check available fulfillment modes
const store = await fetch(`/api/stores/${storeId}`).then((r) => r.json());
const availableModes = store.enabled_fulfillment_modes;

// Display shipping options based on what's enabled
const shippingOptions = [];
if (availableModes.includes("pickup")) {
  shippingOptions.push({ label: "Pickup", value: "pickup" });
}
if (availableModes.includes("platform")) {
  shippingOptions.push({ label: "Courier Delivery", value: "platform" });
}

// Note: vendor mode is handled server-side; frontend doesn't display it as a choice
```

**Important:** The `fulfillment_provider` field is **automatically assigned by the backend** during order creation. The frontend cannot override it.

---

## 4. Creating Orders (Backend Assigns fulfillment_provider)

### Order Creation Endpoint

**Endpoint:** `POST /api/orders/create`

**Important:** Do NOT send `fulfillment_provider` in the request. The backend automatically determines it based on the store's `enabled_fulfillment_modes` and other factors.

### Request Fields

```json
{
  "store_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "price": 5000
    }
  ],
  "total_amount": 10000,
  "total_items": 2,
  "payment_method": "paystack|cash_on_delivery",
  "customer_info": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+234812345678",
    "address": "123 Main Street", // Required for platform & vendor
    "city": "Lagos",
    "state": "Lagos State",
    "post_code": "100001",
    "country": "NG"
  },
  "fulfillment_provider": "pickup|platform|vendor", // NEW: Specify fulfillment mode
  "delivery_method": "sendbox|pickup" // Only relevant for platform fulfillment
}
```

### Field Requirements by Provider

### Field Requirements by Provider

#### **pickup**

```json
{
  "customer_info": {
    "name": "John Doe",
    "phone": "+234812345678",
    "email": "john@example.com"
    // address is OPTIONAL for pickup
  },
  "delivery_method": "pickup"
}
```

#### **platform** (Sendbox)

```json
{
  "delivery_method": "sendbox",
  "customer_info": {
    "name": "John Doe",
    "phone": "+234812345678",
    "email": "john@example.com",
    "address": "123 Main Street", // REQUIRED
    "city": "Lagos",
    "state": "Lagos State",
    "post_code": "100001",
    "country": "NG",
    "lng": 3.1234, // Optional: coordinates
    "lat": 6.5678
  }
}
```

#### **vendor** (Self-delivery)

```json
{
  "customer_info": {
    "name": "John Doe",
    "phone": "+234812345678",
    "email": "john@example.com",
    "address": "123 Main Street", // REQUIRED
    "city": "Lagos",
    "state": "Lagos State",
    "post_code": "100001",
    "country": "NG"
  }
  // Note: fulfillment_provider is auto-assigned by backend
}
```

---

## 4. Complete Request Examples

### Example 1: Pickup Order

```typescript
const pickupOrder = {
  store_id: "550e8400-e29b-41d4-a716-446655440000",
  items: [
    {
      product_id: "660e8400-e29b-41d4-a716-446655440111",
      quantity: 2,
      price: 5000,
    },
  ],
  total_amount: 10000,
  total_items: 2,
  payment_method: "cash_on_delivery",
  customer_info: {
    name: "John Doe",
    phone: "+234812345678",
    email: "john@example.com",
    // No address needed for pickup
  },
  delivery_method: "pickup",
  // Note: fulfillment_provider is auto-assigned by backend as "pickup"
};

const response = await fetch("/api/orders/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(pickupOrder),
});
```

### Example 2: Platform (Sendbox) Order

```typescript
const platformOrder = {
  store_id: "550e8400-e29b-41d4-a716-446655440000",
  items: [
    {
      product_id: "660e8400-e29b-41d4-a716-446655440111",
      quantity: 1,
      price: 15000,
    },
  ],
  total_amount: 15000,
  total_items: 1,
  payment_method: "paystack",
  customer_info: {
    name: "Jane Smith",
    phone: "+234819876543",
    email: "jane@example.com",
    address: "456 Oak Avenue",
    city: "Abuja",
    state: "FCT",
    post_code: "900001",
    country: "NG",
  },
  delivery_method: "sendbox",
  // Note: fulfillment_provider is auto-assigned by backend as "platform"
};

const response = await fetch("/api/orders/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(platformOrder),
});
```

### Example 3: Vendor Self-Delivery Order

```typescript
const vendorOrder = {
  store_id: "550e8400-e29b-41d4-a716-446655440000",
  items: [
    {
      product_id: "660e8400-e29b-41d4-a716-446655440111",
      quantity: 3,
      price: 8000,
    },
    {
      product_id: "770e8400-e29b-41d4-a716-446655440222",
      quantity: 1,
      price: 12000,
    },
  ],
  total_amount: 36000,
  total_items: 4,
  payment_method: "paystack",
  customer_info: {
    name: "Michael Johnson",
    phone: "+234907654321",
    email: "michael@example.com",
    address: "789 Pine Road",
    city: "Lagos",
    state: "Lagos State",
    post_code: "100002",
    country: "NG",
  },
  // Note: fulfillment_provider is auto-assigned by backend
  // It may be "vendor" if enabled, otherwise "platform"
};

const response = await fetch("/api/orders/create", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(vendorOrder),
});
```

---

## 5. Response Handling

### Successful Response (200 OK)

```json
{
  "status": "success",
  "message": "Order created successfully",
  "data": {
    "id": "order-uuid",
    "order_number": "ORD-ABC-001",
    "fulfillment_provider": "vendor",
    "order_status": "pending",
    "payment_status": "pending",
    "total_amount": 36000,
    "customer_info": {
      "name": "Michael Johnson",
      "phone": "+234907654321",
      "address": "789 Pine Road"
    },
    "payment_reference": "paystack-ref-12345"
  }
}
```

### Error: Invalid Fulfillment Provider (400)

```json
{
  "status": "fail",
  "message": "Invalid fulfillment_provider. Allowed values: pickup, platform, vendor",
  "data": null
}
```

### Error: Provider Not Enabled (400)

```json
{
  "status": "fail",
  "message": "Fulfillment provider 'vendor' is not enabled for this store",
  "data": null
}
```

### Error: Missing Required Address (400)

```json
{
  "status": "fail",
  "message": "Address is required for vendor fulfillment",
  "data": null
}
```

---

## 6. Frontend UI Flow

### Shipping/Delivery Options Component

```typescript
import React, { useState, useEffect } from 'react';

function DeliveryOptions({ storeId }) {
  const [availableModes, setAvailableModes] = useState([]);
  const [selectedDelivery, setSelectedDelivery] = useState('pickup');
  const [showAddress, setShowAddress] = useState(false);

  useEffect(() => {
    // Fetch store and check available fulfillment modes
    fetch(`/api/stores/${storeId}`)
      .then(r => r.json())
      .then(store => {
        setAvailableModes(store.enabled_fulfillment_modes);
        // Default to pickup if available, otherwise platform
        const defaultMode = store.enabled_fulfillment_modes.includes('pickup') ? 'pickup' : 'platform';
        setSelectedDelivery(defaultMode);
        setShowAddress(defaultMode === 'platform');
      });
  }, [storeId]);

  const handleDeliveryChange = (method) => {
    setSelectedDelivery(method);
    // Show address form for platform delivery only
    setShowAddress(method === 'sendbox');
  };

  return (
    <div className="delivery-options">
      <h3>Delivery Method</h3>

      {availableModes.includes('pickup') && (
        <label>
          <input
            type="radio"
            name="delivery"
            value="pickup"
            checked={selectedDelivery === 'pickup'}
            onChange={(e) => handleDeliveryChange(e.target.value)}
          />
          <span>🏪 Pick up from store (Free)</span>
        </label>
      )}

      {availableModes.includes('platform') && (
        <label>
          <input
            type="radio"
            name="delivery"
            value="sendbox"
            checked={selectedDelivery === 'sendbox'}
            onChange={(e) => handleDeliveryChange(e.target.value)}
          />
          <span>🚚 Courier Delivery</span>
        </label>
      )}

      {/* Note: vendor mode is NOT shown to customers - it's auto-assigned by backend */}

      {showAddress && (
        <AddressForm required={true} />
      )}
    </div>
  );
}
```

**Key Points:**

- Only display "Pickup" if `enabled_fulfillment_modes` includes "pickup"
- Only display "Courier Delivery" if `enabled_fulfillment_modes` includes "platform"
- **Do not display "Vendor Delivery" as an option**—vendor mode is auto-assigned by the backend when appropriate
- Show address form only for courier delivery (sendbox)

---

## 7. Key Behaviors & Constraints

### Immutability After Payment ⚠️

Once an order is paid (`payment_status: 'completed'`), the `fulfillment_provider` **cannot be changed**. This ensures consistent delivery expectations.

### Address Validation

- **pickup**: Address is optional
- **platform**: Address is **required** for Sendbox delivery quote
- **vendor**: Address is **required** to deliver to customer

### Shipment Tracking

- **pickup**: No shipment record created
- **platform**: Shipment record created with Sendbox tracking
- **vendor**: No shipment record created (vendor manages delivery)

### Delivery Fee

- **pickup**: No delivery fee
- **platform**: Delivery fee calculated by Sendbox API
- **vendor**: No delivery fee (vendor handles cost)

---

## 8. Integration Checklist

- [ ] **Vendor Setup**: Vendors can enable fulfillment modes via `PATCH /api/stores/{storeId}`
- [ ] **Fetch Store Config**: Get store details to check `enabled_fulfillment_modes`
- [ ] **Display Shipping Options**: Show delivery options based on enabled modes (pickup + platform only)
- [ ] **Hide Vendor Option**: Do NOT show vendor delivery as a customer-selectable option
- [ ] **Address Form**: Show/hide based on delivery method (required for sendbox)
- [ ] **Order Creation**: Send order without `fulfillment_provider` field (backend assigns it)
- [ ] **Handle Responses**: Capture returned `fulfillment_provider` in order confirmation
- [ ] **Test Flows**:
  - [ ] Pickup only store
  - [ ] Pickup + Platform store
  - [ ] Store with all modes enabled (vendor auto-assigned server-side)
- [ ] **Order History**: Display order fulfillment method in order details

---

## 9. Testing Scenarios

### Test Case 1: Pickup-Only Store

1. Store has only `enabled_fulfillment_modes: ["pickup"]`
2. Frontend shows only "Pickup" option
3. Customer cannot select courier delivery
4. Order created with auto-assigned `fulfillment_provider: "pickup"`
5. No shipment record created

### Test Case 2: Pickup + Platform Store

1. Store has `enabled_fulfillment_modes: ["pickup", "platform"]`
2. Frontend shows "Pickup" and "Courier Delivery" options
3. If customer selects courier, address is required
4. Order created with auto-assigned `fulfillment_provider: "platform"`
5. Shipment record created with tracking

### Test Case 3: All Modes Enabled (Vendor Auto-Assignment)

1. Store has `enabled_fulfillment_modes: ["pickup", "platform", "vendor"]`
2. Frontend shows "Pickup" and "Courier Delivery" (vendor NOT shown as option)
3. Based on internal logic, backend may assign `fulfillment_provider: "vendor"`
4. Customer doesn't know it's vendor delivery—they just see the order
5. No shipment record created (vendor handles it)

### Test Case 4: Address Validation

1. Customer selects courier delivery but doesn't provide address
2. Request rejected with error "Address is required for platform fulfillment"
3. Frontend catches and requires address before submission

### Test Case 5: Update Store Modes

1. Vendor patches store to change `enabled_fulfillment_modes: ["platform", "vendor"]`
2. Store no longer accepts pickup orders
3. Frontend immediately reflects changes on next store fetch

---

## 10. Troubleshooting

### Problem: Address field not required for platform

**Solution**: The backend enforces address validation. Ensure your form catches this before submission.

### Problem: "Fulfillment provider not enabled" error

**Solution**: Check the store's `enabled_fulfillment_modes` array. Only show options that are present in this array.

### Problem: No delivery fee calculated for platform

**Solution**: Ensure valid address is provided (street, city, state, country). Sendbox needs complete address for quote.

### Problem: Order payment not completing

**Solution**: Verify fulfillment provider is enabled for the store. Invalid providers will be rejected at order creation, not payment.

---

## 11. API Reference Summary

| Endpoint                | Method | Purpose                                                        |
| ----------------------- | ------ | -------------------------------------------------------------- |
| `/api/stores/{storeId}` | GET    | Get store details (includes `enabled_fulfillment_modes`)       |
| `/api/stores/{storeId}` | PATCH  | Update store (including `enabled_fulfillment_modes`)           |
| `/api/orders/create`    | POST   | Create new order (backend auto-assigns `fulfillment_provider`) |
| `/api/orders/{orderId}` | GET    | Get order details (shows assigned `fulfillment_provider`)      |

---

## 12. Key Takeaways for Frontend

✅ **Vendor enables modes** via `PATCH /api/stores/{storeId}` with `enabled_fulfillment_modes`

✅ **Frontend displays options** based on what's enabled (pickup + platform only)

✅ **Customers don't select fulfillment_provider** — only delivery method (pickup or sendbox)

✅ **Backend auto-assigns fulfillment_provider** based on store config and delivery method

✅ **Vendor delivery is never shown** to customers as an option

✅ **Order response includes** the auto-assigned `fulfillment_provider` for your records

---

## Questions?

For backend API documentation, see [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md)

For database schema details, see the migrations:

- `migrations/024_add_fulfillment_provider_to_orders.sql`
- `migrations/025_add_enabled_fulfillment_modes_to_stores.sql`
