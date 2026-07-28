# Gift Card Feature Implementation

## Overview

Square Gift Cards integration for purchasing and redeeming digital gift cards through Coastal Creations Studio.

## Architecture

### Key Files
- `lib/square/gift-cards.ts` - Gift card service (create, activate, redeem, list)
- `app/api/gift-cards/route.ts` - Purchase endpoint (POST)
- `app/api/gift-cards/balance/route.ts` - Balance check endpoint
- `app/api/gift-cards/redeem/route.ts` - Redemption endpoint
- `app/api/gift-cards/list/route.ts` - Admin list endpoint
- `components/gift-cards/GiftCardPurchase.tsx` - Purchase UI
- `components/gift-cards/GiftCardBalance.tsx` - Balance check UI
- `components/payment/GiftCardRedemption.tsx` - Redemption during checkout

## Square Gift Card Flow (Critical)

Square requires a specific order-based flow for selling gift cards through custom checkout:

### Purchase Flow (4 Steps)
1. **Create Order** with `GIFT_CARD` line item type
2. **Process Payment** linked to the order via `orderId`
3. **Create Gift Card** (starts in `PENDING` state)
4. **Activate Gift Card** with order reference (changes to `ACTIVE` state)

### Key Implementation Details

#### 1. Line Item UID Must Come From Order Response
Square assigns its own UID to line items. You cannot use a self-generated UUID:

```typescript
// WRONG - Square ignores this UID
const lineItemUid = randomUUID();
order: { lineItems: [{ uid: lineItemUid, ... }] }

// CORRECT - Get UID from order response
const order = orderResponse.result.order;
const lineItemUid = order.lineItems[0].uid;
```

#### 2. Activation Requires Order Reference (Not Amount)
When using Square Orders API, do NOT provide `amountMoney` in activation - Square gets it from the order:

```typescript
// WRONG - Causes "Provide either order_id and line_item_uid OR amount and buyer_payment_instrument_id" error
activateActivityDetails: {
  amountMoney: { amount: BigInt(5000), currency: "USD" },
  orderId: orderId,
  lineItemUid: lineItemUid,
}

// CORRECT - Let Square get amount from order
activateActivityDetails: {
  orderId: orderId,
  lineItemUid: lineItemUid,
}
```

#### 3. Payment Must Reference Order
Link payment to order for proper gift card activation:

```typescript
await paymentsApi.createPayment({
  sourceId: sourceId,
  amountMoney: { amount: BigInt(amountCents), currency: "USD" },
  orderId: orderId,  // Required for gift card activation
  locationId: this.locationId,
});
```

## Environment Variables Required

```env
SQUARE_LOCATION_ID=LY4J6D8KMKFJS
SQUARE_ENVIRONMENT=sandbox  # or production
ACCESS_TOKEN=your_square_access_token
```

Note: The service checks both `NEXT_PUBLIC_SQUARE_LOCATION_ID` and `SQUARE_LOCATION_ID`.

## API Endpoints

### POST /api/gift-cards
Creates and activates a gift card with payment processing.

**Request:**
```json
{
  "sourceId": "card_token_from_square_form",
  "amountCents": 5000,
  "recipientEmail": "recipient@example.com",
  "recipientName": "John Doe",
  "senderName": "Jane Doe",
  "personalMessage": "Happy Birthday!",
  "purchaserEmail": "purchaser@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "gan": "7783-3200-0000-0000",
  "giftCardId": "gftc_xxx",
  "amount": 5000
}
```

### POST /api/gift-cards/balance
Check gift card balance by GAN.

### POST /api/gift-cards/redeem
Redeem gift card during checkout.

### GET /api/gift-cards/list
Admin endpoint to list all gift cards.

## Gift Card States
- `PENDING` - Created but not yet activated
- `ACTIVE` - Ready for use
- `DEACTIVATED` - Disabled
- `BLOCKED` - Temporarily blocked

## Redemption Integration

Gift cards can be used as partial or full payment during checkout via the split payment system in `/api/payments`.

## Email Notifications

After successful purchase:
1. Recipient receives gift card email with GAN
2. Purchaser receives confirmation (if different from recipient)

Templates: `components/email-templates/GiftCardEmailTemplate.tsx`

## Troubleshooting

### "Square location ID is not configured"
- Ensure `SQUARE_LOCATION_ID` is set in `.env`
- Restart dev server after adding env vars

### "Provide either order_id and line_item_uid OR amount and buyer_payment_instrument_id"
- Use the line item UID from the order response, not a self-generated one
- Remove `amountMoney` from activation when using order reference
- Ensure payment is linked to order via `orderId`

### Gift card created but not active
- Verify the ACTIVATE activity was called after card creation
- Check order state is COMPLETED before activation
