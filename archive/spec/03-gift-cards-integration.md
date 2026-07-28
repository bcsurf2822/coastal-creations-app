# PRP: Gift Cards Integration with Square

## Goal
Implement a complete gift card system using Square Gift Cards API, allowing customers to purchase digital gift cards and redeem them at checkout for art classes, private events, and reservations.

## Why
- **Revenue Stream**: Gift cards are often purchased at 15-20% premium (buying $50 card for someone, they spend $65)
- **Customer Acquisition**: Gift recipients become new customers
- **Seasonal Revenue**: Major spike during holidays (Q4 can account for 40% of gift card sales)
- **Zero Marginal Cost**: Digital gift cards have no physical production costs
- **Cash Flow**: Money received upfront, services delivered later
- **Square Dashboard**: Business owner can track gift card sales and outstanding balances directly

## What
Build a gift card purchase flow, balance checking, and redemption system integrated with the existing payment checkout. Gift cards are stored and managed entirely by Square - we just interface with their API.

### Success Criteria
- [ ] Customers can purchase digital gift cards in preset amounts ($25, $50, $75, $100) or custom amounts
- [ ] Gift card delivered via email to recipient with unique code
- [ ] Balance check available without login
- [ ] Gift cards redeemable at checkout (full or partial balance)
- [ ] Split payments supported (gift card + credit card)
- [ ] Gift card activity visible in Square Dashboard
- [ ] Outstanding balances tracked by Square
- [ ] Admin can view all gift cards with balances, status, and activity history

## All Needed Context

### Documentation & References
```yaml
- url: https://developer.squareup.com/docs/gift-cards-api/using-gift-cards-api
  why: Core API documentation for gift card lifecycle
  critical: Understanding GAN (Gift Card Account Number) vs card ID

- url: https://developer.squareup.com/reference/square/gift-cards-api
  why: API reference for all gift card endpoints

- url: https://developer.squareup.com/docs/gift-cards-api/gift-card-activities
  why: Activity types (ACTIVATE, LOAD, REDEEM, etc.)
  critical: Must create ACTIVATE activity after creating card

- file: components/payment/PaymentProcessor.tsx
  why: Integrate gift card redemption into existing payment flow

- file: app/api/payments/route.ts
  why: Handle split payments (gift card + other source)
```

### Current Codebase Tree (relevant files)
```bash
coastal-creations-app/
├── components/
│   └── payment/
│       └── PaymentProcessor.tsx    # MODIFY - add gift card redemption
├── app/
│   ├── api/
│   │   └── payments/
│   │       └── route.ts            # MODIFY - support split payments
│   └── events/
│       └── [id]/
│           └── page.tsx            # Payment page
```

### Desired Codebase Tree
```bash
coastal-creations-app/
├── lib/
│   └── square/
│       └── gift-cards.ts           # NEW - Gift card service
├── components/
│   ├── payment/
│   │   ├── PaymentProcessor.tsx    # MODIFY - gift card redemption
│   │   └── GiftCardRedemption.tsx  # NEW - redemption input UI
│   ├── gift-cards/
│   │   ├── GiftCardPurchase.tsx    # NEW - purchase form
│   │   ├── GiftCardPreview.tsx     # NEW - card preview/email preview
│   │   └── GiftCardBalance.tsx     # NEW - balance checker
│   └── dashboard/
│       └── gift-cards/
│           ├── GiftCardsTable.tsx  # NEW - admin gift cards table
│           └── GiftCardDetails.tsx # NEW - gift card detail modal/view
├── app/
│   ├── api/
│   │   ├── payments/
│   │   │   └── route.ts            # MODIFY - split payments
│   │   └── gift-cards/
│   │       ├── route.ts            # NEW - create/activate cards
│   │       ├── list/
│   │       │   └── route.ts        # NEW - list all gift cards (admin)
│   │       ├── [gan]/
│   │       │   └── route.ts        # NEW - get card by GAN
│   │       ├── balance/
│   │       │   └── route.ts        # NEW - check balance
│   │       └── redeem/
│   │           └── route.ts        # NEW - redeem card
│   ├── admin/
│   │   └── dashboard/
│   │       └── gift-cards/
│   │           └── page.tsx        # NEW - admin gift cards page
│   └── gift-cards/
│       ├── page.tsx                # NEW - purchase gift cards page
│       └── balance/
│           └── page.tsx            # NEW - check balance page
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Gift card lifecycle
// 1. CreateGiftCard - creates card in PENDING state
// 2. CreateGiftCardActivity(ACTIVATE) - activates with initial balance
// Card must be ACTIVATED before it can be used

// CRITICAL: GAN vs Gift Card ID
// GAN (Gift Card Account Number) - 16-digit number customer sees/enters
// Gift Card ID - Square's internal ID (like "gftc_xxx")
// Use GAN for customer-facing operations
// Use ID for API calls after retrieval

// GOTCHA: Gift card numbers are formatted as XXXX-XXXX-XXXX-XXXX
// Store without dashes, display with dashes

// GOTCHA: Redeem creates negative activity
// LOAD adds funds, REDEEM subtracts funds
// Both are "activities" on the card

// GOTCHA: Partial redemption
// If card has $50 and order is $75:
// - Redeem $50 from gift card
// - Charge $25 to credit card
// Must handle this split payment flow

// PATTERN: Use idempotency keys for all create operations
// Prevents duplicate cards on network retry

// GOTCHA: Gift cards don't expire by default
// Square handles all balance tracking
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// lib/square/types/gift-cards.ts

export interface GiftCardPurchaseInput {
  amountCents: number;           // Amount in cents (5000 = $50.00)
  recipientEmail: string;        // Where to send the gift card
  recipientName: string;         // "To: [name]"
  senderName: string;            // "From: [name]"
  personalMessage?: string;      // Optional message
  purchaserEmail: string;        // Buyer's email for receipt
}

export interface GiftCard {
  id: string;                    // Square gift card ID
  gan: string;                   // 16-digit account number
  state: "PENDING" | "ACTIVE" | "DEACTIVATED" | "BLOCKED";
  balanceMoney: {
    amount: number;              // Balance in cents
    currency: string;
  };
  createdAt: string;
}

export interface GiftCardRedemption {
  giftCardId: string;
  amountToRedeem: number;        // In cents
  orderId?: string;
  locationId: string;
}

export interface SplitPayment {
  giftCardAmount: number;        // Amount from gift card (cents)
  giftCardGan: string;           // Gift card to charge
  cardTokenAmount: number;       // Amount from credit card (cents)
  cardToken: string;             // Credit card token
  totalAmount: number;           // Total order amount (cents)
}
```

### List of Tasks

```yaml
Task 1:
CREATE lib/square/gift-cards.ts:
  - Implement GiftCardService class
  - createGiftCard() - creates card in PENDING state
  - activateGiftCard() - activates with initial balance
  - getGiftCardByGan() - retrieve by account number
  - getBalance() - check current balance
  - redeemGiftCard() - create REDEEM activity
  - listGiftCards() - list all gift cards with pagination (admin)
  - getGiftCardActivities() - get activity history for a card (admin)
  - PATTERN: Use existing Square client

Task 2:
CREATE app/api/gift-cards/route.ts:
  - POST: Create and activate new gift card
  - Combines create + activate in single endpoint
  - Sends email to recipient (use existing email service or SendGrid)
  - Returns GAN for confirmation

Task 3:
CREATE app/api/gift-cards/balance/route.ts:
  - GET: Check balance by GAN query param
  - No authentication required
  - Return balance and card status

Task 4:
CREATE app/api/gift-cards/redeem/route.ts:
  - POST: Redeem gift card amount
  - Validate sufficient balance
  - Create REDEEM activity
  - Return remaining balance

Task 5:
CREATE components/gift-cards/GiftCardPurchase.tsx:
  - Form for purchasing gift cards
  - Amount selection (preset + custom)
  - Recipient info fields
  - Personal message textarea
  - Preview before purchase
  - Integrate with Square payment

Task 6:
CREATE components/gift-cards/GiftCardBalance.tsx:
  - Simple form to check balance
  - Enter GAN, see balance
  - No login required

Task 7:
CREATE components/payment/GiftCardRedemption.tsx:
  - Input for gift card number at checkout
  - Apply button to check and apply balance
  - Show amount being applied
  - Show remaining to pay by card

Task 8:
MODIFY components/payment/PaymentProcessor.tsx:
  - FIND: Payment form section
  - INJECT: GiftCardRedemption component above payment
  - MODIFY: Handle split payment when gift card applied
  - Calculate remaining amount for card payment

Task 9:
MODIFY app/api/payments/route.ts:
  - FIND: Payment creation logic
  - INJECT: Handle gift card redemption first
  - INJECT: Then charge remaining to card
  - PATTERN: Two-step payment for split scenarios

Task 10:
CREATE app/gift-cards/page.tsx:
  - Public page to purchase gift cards
  - Include GiftCardPurchase component
  - Link from main navigation

Task 11:
CREATE app/gift-cards/balance/page.tsx:
  - Public page to check balance
  - Include GiftCardBalance component

Task 12:
CREATE app/api/gift-cards/list/route.ts:
  - GET: List all gift cards (admin only, protected)
  - Support pagination via cursor
  - Filter by state (ACTIVE, PENDING, etc.)
  - Return cards with balances and creation dates

Task 13:
CREATE app/api/gift-cards/[id]/activities/route.ts:
  - GET: List activity history for a specific gift card
  - Shows ACTIVATE, LOAD, REDEEM activities
  - Includes timestamps and amounts

Task 14:
CREATE components/dashboard/gift-cards/GiftCardsTable.tsx:
  - Table displaying all gift cards
  - Columns: GAN (last 4), Status, Balance, Created Date, Actions
  - Pagination support
  - Filter by status dropdown
  - Click row to view details/activities

Task 15:
CREATE components/dashboard/gift-cards/GiftCardDetails.tsx:
  - Modal or slide-out panel showing full card details
  - Display full GAN (admin only)
  - Show activity history timeline
  - Display total loaded, total redeemed, current balance

Task 16:
CREATE app/admin/dashboard/gift-cards/page.tsx:
  - Admin page for gift card management
  - Include GiftCardsTable component
  - Summary stats at top (total cards, total outstanding balance, etc.)
  - Protected by NextAuth (admin only)
```

### Task 1 Pseudocode: Gift Card Service

```typescript
// lib/square/gift-cards.ts
import { Client, ApiError } from "square";
import { randomUUID } from "crypto";
import { getSquareClient } from "./client";

export class GiftCardService {
  private client: Client;
  private locationId: string;

  constructor() {
    this.client = getSquareClient();
    this.locationId = process.env.SQUARE_LOCATION_ID!;
  }

  // Create and activate gift card in one operation
  async createAndActivateGiftCard(
    amountCents: number,
    buyerEmail: string
  ): Promise<{ gan: string; giftCardId: string }> {
    // Step 1: Create gift card (PENDING state)
    const createResponse = await this.client.giftCardsApi.createGiftCard({
      idempotencyKey: randomUUID(),
      locationId: this.locationId,
      giftCard: {
        type: "DIGITAL",
      },
    });

    const giftCard = createResponse.result.giftCard!;
    const giftCardId = giftCard.id!;
    const gan = giftCard.gan!;

    // Step 2: Activate with initial balance
    // CRITICAL: Must activate before card can be used
    await this.client.giftCardActivitiesApi.createGiftCardActivity({
      idempotencyKey: randomUUID(),
      giftCardActivity: {
        type: "ACTIVATE",
        locationId: this.locationId,
        giftCardId: giftCardId,
        activateActivityDetails: {
          amountMoney: {
            amount: BigInt(amountCents),
            currency: "USD",
          },
          buyerPaymentInstrumentIds: [], // Will link to payment later
        },
      },
    });

    return { gan, giftCardId };
  }

  // Get gift card by GAN (customer-entered number)
  async getByGan(gan: string): Promise<GiftCard | null> {
    // Remove any dashes from input
    const cleanGan = gan.replace(/-/g, "");

    try {
      const response = await this.client.giftCardsApi.retrieveGiftCardFromGAN({
        gan: cleanGan,
      });
      return response.result.giftCard || null;
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  // Check balance
  async getBalance(gan: string): Promise<{ balance: number; status: string } | null> {
    const card = await this.getByGan(gan);
    if (!card) return null;

    return {
      balance: Number(card.balanceMoney?.amount || 0),
      status: card.state || "UNKNOWN",
    };
  }

  // Redeem gift card (subtract from balance)
  async redeem(
    giftCardId: string,
    amountCents: number,
    referenceId?: string
  ): Promise<{ newBalance: number }> {
    const response = await this.client.giftCardActivitiesApi.createGiftCardActivity({
      idempotencyKey: randomUUID(),
      giftCardActivity: {
        type: "REDEEM",
        locationId: this.locationId,
        giftCardId: giftCardId,
        redeemActivityDetails: {
          amountMoney: {
            amount: BigInt(amountCents),
            currency: "USD",
          },
          referenceId: referenceId, // Link to order
        },
      },
    });

    const activity = response.result.giftCardActivity!;
    return {
      newBalance: Number(activity.giftCardBalanceMoney?.amount || 0),
    };
  }

  // Format GAN for display (XXXX-XXXX-XXXX-XXXX)
  formatGan(gan: string): string {
    const clean = gan.replace(/-/g, "");
    return clean.match(/.{1,4}/g)?.join("-") || gan;
  }
}
```

### Task 7 Pseudocode: Gift Card Redemption Component

```typescript
// components/payment/GiftCardRedemption.tsx
"use client";

import React, { useState } from "react";

interface GiftCardRedemptionProps {
  totalAmount: number;  // Order total in cents
  onApply: (redemption: {
    giftCardId: string;
    gan: string;
    amountToApply: number;
    remainingBalance: number;
  }) => void;
  onRemove: () => void;
  appliedCard: {
    gan: string;
    amountApplied: number;
  } | null;
}

export const GiftCardRedemption: React.FC<GiftCardRedemptionProps> = ({
  totalAmount,
  onApply,
  onRemove,
  appliedCard,
}) => {
  const [gan, setGan] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleApply = async () => {
    setLoading(true);
    setError(null);

    try {
      // Check balance
      const response = await fetch(
        `/api/gift-cards/balance?gan=${encodeURIComponent(gan)}`
      );
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid gift card");
        return;
      }

      if (data.status !== "ACTIVE") {
        setError("This gift card is not active");
        return;
      }

      if (data.balance <= 0) {
        setError("This gift card has no remaining balance");
        return;
      }

      // Calculate amount to apply (min of balance and total)
      const amountToApply = Math.min(data.balance, totalAmount);

      onApply({
        giftCardId: data.giftCardId,
        gan: gan,
        amountToApply,
        remainingBalance: data.balance - amountToApply,
      });
    } catch (err) {
      setError("Failed to check gift card. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Format input as user types (XXXX-XXXX-XXXX-XXXX)
  const handleGanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, "");
    const formatted = value.match(/.{1,4}/g)?.join("-") || value;
    setGan(formatted.slice(0, 19)); // 16 digits + 3 dashes
  };

  if (appliedCard) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <p className="font-medium text-green-800">Gift Card Applied</p>
            <p className="text-sm text-green-600">
              Card ending in {appliedCard.gan.slice(-4)}
            </p>
          </div>
          <div className="text-right">
            <p className="font-bold text-green-800">
              -${(appliedCard.amountApplied / 100).toFixed(2)}
            </p>
            <button
              onClick={onRemove}
              className="text-sm text-red-600 hover:text-red-800"
            >
              Remove
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-lg p-4 mb-4">
      <h3 className="font-medium text-gray-800 mb-3">Have a gift card?</h3>
      <div className="flex gap-2">
        <input
          type="text"
          value={gan}
          onChange={handleGanChange}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-transparent"
          maxLength={19}
        />
        <button
          onClick={handleApply}
          disabled={gan.replace(/-/g, "").length !== 16 || loading}
          className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Checking..." : "Apply"}
        </button>
      </div>
      {error && <p className="text-red-600 text-sm mt-2">{error}</p>}
    </div>
  );
};
```

### Task 9 Pseudocode: Split Payment Handler

```typescript
// app/api/payments/route.ts - Modifications for split payments

import { GiftCardService } from "@/lib/square/gift-cards";

// Add to existing POST handler
async function handleSplitPayment(body: {
  giftCard?: {
    giftCardId: string;
    amountToRedeem: number;  // cents
  };
  cardToken?: string;
  cardAmount?: number;  // cents
  totalAmount: number;  // cents
}) {
  const giftCardService = new GiftCardService();
  const results = {
    giftCardRedemption: null as any,
    cardPayment: null as any,
  };

  // Step 1: Redeem gift card if provided
  if (body.giftCard && body.giftCard.amountToRedeem > 0) {
    const redemption = await giftCardService.redeem(
      body.giftCard.giftCardId,
      body.giftCard.amountToRedeem,
      `order-${Date.now()}`
    );
    results.giftCardRedemption = {
      amountRedeemed: body.giftCard.amountToRedeem,
      newBalance: redemption.newBalance,
    };
  }

  // Step 2: Charge remaining to card if needed
  const remainingAmount = body.cardAmount || 0;
  if (remainingAmount > 0 && body.cardToken) {
    // Use existing payment creation logic
    const cardPayment = await createSquarePayment({
      sourceId: body.cardToken,
      amountMoney: {
        amount: BigInt(remainingAmount),
        currency: "USD",
      },
      // ... other existing fields
    });
    results.cardPayment = cardPayment;
  }

  return results;
}
```

### Task 12-13 Pseudocode: Admin API Routes

```typescript
// app/api/gift-cards/list/route.ts
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { GiftCardService } from "@/lib/square/gift-cards";

export async function GET(request: Request): Promise<Response> {
  // Verify admin session
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const cursor = searchParams.get("cursor") || undefined;
  const state = searchParams.get("state") || undefined;

  const giftCardService = new GiftCardService();
  const result = await giftCardService.listGiftCards({ cursor, state });

  return Response.json(result);
}

// app/api/gift-cards/[id]/activities/route.ts
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<Response> {
  const session = await getServerSession(authOptions);
  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const giftCardService = new GiftCardService();
  const activities = await giftCardService.getGiftCardActivities(params.id);

  return Response.json({ activities });
}
```

### Task 1 Additions: Admin Methods for GiftCardService

```typescript
// Add to lib/square/gift-cards.ts

  // List all gift cards (admin)
  async listGiftCards(options?: {
    cursor?: string;
    state?: string;
    limit?: number;
  }): Promise<{
    giftCards: GiftCard[];
    cursor?: string;
    totalOutstandingBalance: number;
  }> {
    const response = await this.client.giftCardsApi.listGiftCards({
      cursor: options?.cursor,
      state: options?.state,
      limit: options?.limit || 50,
    });

    const giftCards = response.result.giftCards || [];

    // Calculate total outstanding balance
    const totalOutstandingBalance = giftCards.reduce((sum, card) => {
      if (card.state === "ACTIVE") {
        return sum + Number(card.balanceMoney?.amount || 0);
      }
      return sum;
    }, 0);

    return {
      giftCards: giftCards.map(card => ({
        id: card.id!,
        gan: card.gan!,
        state: card.state as GiftCard["state"],
        balanceMoney: {
          amount: Number(card.balanceMoney?.amount || 0),
          currency: card.balanceMoney?.currency || "USD",
        },
        createdAt: card.createdAt!,
      })),
      cursor: response.result.cursor,
      totalOutstandingBalance,
    };
  }

  // Get activity history for a gift card
  async getGiftCardActivities(giftCardId: string): Promise<GiftCardActivity[]> {
    const response = await this.client.giftCardActivitiesApi.listGiftCardActivities({
      giftCardId,
    });

    return (response.result.giftCardActivities || []).map(activity => ({
      id: activity.id!,
      type: activity.type!,
      locationId: activity.locationId!,
      createdAt: activity.createdAt!,
      giftCardBalanceMoney: {
        amount: Number(activity.giftCardBalanceMoney?.amount || 0),
        currency: activity.giftCardBalanceMoney?.currency || "USD",
      },
      // Include activity-specific details
      ...(activity.activateActivityDetails && {
        activateDetails: {
          amount: Number(activity.activateActivityDetails.amountMoney?.amount || 0),
        },
      }),
      ...(activity.loadActivityDetails && {
        loadDetails: {
          amount: Number(activity.loadActivityDetails.amountMoney?.amount || 0),
        },
      }),
      ...(activity.redeemActivityDetails && {
        redeemDetails: {
          amount: Number(activity.redeemActivityDetails.amountMoney?.amount || 0),
          referenceId: activity.redeemActivityDetails.referenceId,
        },
      }),
    }));
  }
```

### Task 14-16 Pseudocode: Admin Components

```typescript
// components/dashboard/gift-cards/GiftCardsTable.tsx
"use client";

import React, { useState, useEffect } from "react";
import { GiftCardDetails } from "./GiftCardDetails";

interface GiftCard {
  id: string;
  gan: string;
  state: string;
  balanceMoney: { amount: number; currency: string };
  createdAt: string;
}

export const GiftCardsTable: React.FC = () => {
  const [giftCards, setGiftCards] = useState<GiftCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [cursor, setCursor] = useState<string | undefined>();
  const [stateFilter, setStateFilter] = useState<string>("ACTIVE");
  const [selectedCard, setSelectedCard] = useState<GiftCard | null>(null);
  const [totalOutstanding, setTotalOutstanding] = useState(0);

  const fetchGiftCards = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (cursor) params.set("cursor", cursor);
    if (stateFilter) params.set("state", stateFilter);

    const response = await fetch(`/api/gift-cards/list?${params}`);
    const data = await response.json();

    setGiftCards(data.giftCards);
    setCursor(data.cursor);
    setTotalOutstanding(data.totalOutstandingBalance);
    setLoading(false);
  };

  useEffect(() => {
    fetchGiftCards();
  }, [stateFilter]);

  const formatGan = (gan: string): string => {
    // Show only last 4 digits in table
    return `****-****-****-${gan.slice(-4)}`;
  };

  return (
    <div>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Total Gift Cards</p>
          <p className="text-2xl font-bold">{giftCards.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <p className="text-sm text-gray-500">Outstanding Balance</p>
          <p className="text-2xl font-bold">${(totalOutstanding / 100).toFixed(2)}</p>
        </div>
      </div>

      {/* Filter */}
      <div className="mb-4">
        <select
          value={stateFilter}
          onChange={(e) => setStateFilter(e.target.value)}
          className="px-3 py-2 border rounded-md"
        >
          <option value="">All States</option>
          <option value="ACTIVE">Active</option>
          <option value="PENDING">Pending</option>
          <option value="DEACTIVATED">Deactivated</option>
        </select>
      </div>

      {/* Table */}
      <table className="w-full bg-white rounded-lg shadow">
        <thead>
          <tr className="border-b">
            <th className="px-4 py-3 text-left">Card Number</th>
            <th className="px-4 py-3 text-left">Status</th>
            <th className="px-4 py-3 text-right">Balance</th>
            <th className="px-4 py-3 text-left">Created</th>
            <th className="px-4 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {giftCards.map((card) => (
            <tr
              key={card.id}
              className="border-b hover:bg-gray-50 cursor-pointer"
              onClick={() => setSelectedCard(card)}
            >
              <td className="px-4 py-3 font-mono">{formatGan(card.gan)}</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded text-sm ${
                  card.state === "ACTIVE" ? "bg-green-100 text-green-800" :
                  card.state === "PENDING" ? "bg-yellow-100 text-yellow-800" :
                  "bg-gray-100 text-gray-800"
                }`}>
                  {card.state}
                </span>
              </td>
              <td className="px-4 py-3 text-right">
                ${(card.balanceMoney.amount / 100).toFixed(2)}
              </td>
              <td className="px-4 py-3">
                {new Date(card.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <button className="text-blue-600 hover:underline">
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {cursor && (
        <button
          onClick={() => fetchGiftCards()}
          className="mt-4 px-4 py-2 bg-gray-100 rounded hover:bg-gray-200"
        >
          Load More
        </button>
      )}

      {/* Details Modal */}
      {selectedCard && (
        <GiftCardDetails
          giftCard={selectedCard}
          onClose={() => setSelectedCard(null)}
        />
      )}
    </div>
  );
};
```

```typescript
// components/dashboard/gift-cards/GiftCardDetails.tsx
"use client";

import React, { useState, useEffect } from "react";

interface GiftCardActivity {
  id: string;
  type: string;
  createdAt: string;
  giftCardBalanceMoney: { amount: number };
  activateDetails?: { amount: number };
  loadDetails?: { amount: number };
  redeemDetails?: { amount: number; referenceId?: string };
}

interface GiftCardDetailsProps {
  giftCard: {
    id: string;
    gan: string;
    state: string;
    balanceMoney: { amount: number };
    createdAt: string;
  };
  onClose: () => void;
}

export const GiftCardDetails: React.FC<GiftCardDetailsProps> = ({
  giftCard,
  onClose,
}) => {
  const [activities, setActivities] = useState<GiftCardActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      const response = await fetch(`/api/gift-cards/${giftCard.id}/activities`);
      const data = await response.json();
      setActivities(data.activities);
      setLoading(false);
    };
    fetchActivities();
  }, [giftCard.id]);

  const formatGan = (gan: string): string => {
    return gan.match(/.{1,4}/g)?.join("-") || gan;
  };

  const getActivityAmount = (activity: GiftCardActivity): number => {
    if (activity.activateDetails) return activity.activateDetails.amount;
    if (activity.loadDetails) return activity.loadDetails.amount;
    if (activity.redeemDetails) return activity.redeemDetails.amount;
    return 0;
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-xl font-bold">Gift Card Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              Close
            </button>
          </div>

          {/* Card Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-500">Card Number</p>
            <p className="font-mono text-lg">{formatGan(giftCard.gan)}</p>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p className="font-medium">{giftCard.state}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Balance</p>
                <p className="font-bold text-lg">
                  ${(giftCard.balanceMoney.amount / 100).toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          {/* Activity History */}
          <h3 className="font-semibold mb-3">Activity History</h3>
          {loading ? (
            <p>Loading activities...</p>
          ) : (
            <div className="space-y-3">
              {activities.map((activity) => (
                <div
                  key={activity.id}
                  className="border-l-4 pl-4 py-2 border-gray-200"
                >
                  <div className="flex justify-between">
                    <span className={`font-medium ${
                      activity.type === "REDEEM" ? "text-red-600" :
                      activity.type === "ACTIVATE" || activity.type === "LOAD" ? "text-green-600" :
                      "text-gray-600"
                    }`}>
                      {activity.type}
                    </span>
                    <span className="font-mono">
                      {activity.type === "REDEEM" ? "-" : "+"}
                      ${(getActivityAmount(activity) / 100).toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(activity.createdAt).toLocaleString()}
                  </p>
                  {activity.redeemDetails?.referenceId && (
                    <p className="text-xs text-gray-400">
                      Ref: {activity.redeemDetails.referenceId}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
```

```typescript
// app/admin/dashboard/gift-cards/page.tsx
import { GiftCardsTable } from "@/components/dashboard/gift-cards/GiftCardsTable";

export default function AdminGiftCardsPage(): React.ReactElement {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Gift Cards</h1>
      <GiftCardsTable />
    </div>
  );
}
```

### Integration Points
```yaml
EMAIL_SERVICE:
  - integrate with: existing email service or add SendGrid
  - template: Gift card delivery email with GAN and message
  - include: Recipient name, sender name, amount, message, GAN

SQUARE_DASHBOARD:
  - Gift cards appear in: Square Dashboard > Gift Cards
  - Track: Outstanding balances, redemptions, activations
  - Reports: Gift card sales and liability

NAVIGATION:
  - add to: Main navigation or footer
  - links: "Buy Gift Card", "Check Gift Card Balance"

ADMIN_NAVIGATION:
  - add to: Admin dashboard sidebar
  - link: "Gift Cards" (app/admin/dashboard/gift-cards)
```

## Validation Loop

### Level 1: Syntax & Style
```bash
cd /Users/benjamincorbett/code/cedesigns/coastal-creations-app

npx eslint lib/square/gift-cards.ts --fix
npx eslint components/gift-cards/*.tsx --fix
npx eslint components/payment/GiftCardRedemption.tsx --fix
npx eslint components/dashboard/gift-cards/*.tsx --fix
npx eslint app/admin/dashboard/gift-cards/page.tsx --fix
npx tsc --noEmit

# Expected: No errors
```

### Level 2: Unit Tests
```typescript
// __tests__/lib/square/gift-cards.test.ts
import { GiftCardService } from "@/lib/square/gift-cards";

describe("GiftCardService", () => {
  const service = new GiftCardService();

  test("formatGan adds dashes correctly", () => {
    expect(service.formatGan("1234567890123456")).toBe("1234-5678-9012-3456");
  });

  test("formatGan handles already formatted input", () => {
    expect(service.formatGan("1234-5678-9012-3456")).toBe("1234-5678-9012-3456");
  });

  // Integration tests require sandbox environment
  test.skip("createAndActivateGiftCard creates active card", async () => {
    const result = await service.createAndActivateGiftCard(5000, "test@example.com");
    expect(result.gan).toHaveLength(16);
    expect(result.giftCardId).toBeDefined();

    const balance = await service.getBalance(result.gan);
    expect(balance?.balance).toBe(5000);
    expect(balance?.status).toBe("ACTIVE");
  });
});
```

```bash
npm run test -- __tests__/lib/square/gift-cards.test.ts
```

### Level 3: Integration Test
```bash
# Test gift card purchase flow
curl -X POST http://localhost:3000/api/gift-cards \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 5000,
    "recipientEmail": "recipient@example.com",
    "recipientName": "Jane",
    "senderName": "John",
    "message": "Happy Birthday!"
  }'

# Expected: {"gan": "1234-5678-9012-3456", "giftCardId": "gftc_xxx"}

# Test balance check
curl "http://localhost:3000/api/gift-cards/balance?gan=1234567890123456"

# Expected: {"balance": 5000, "status": "ACTIVE", "giftCardId": "gftc_xxx"}

# Test redemption
curl -X POST http://localhost:3000/api/gift-cards/redeem \
  -H "Content-Type: application/json" \
  -d '{
    "giftCardId": "gftc_xxx",
    "amount": 2500
  }'

# Expected: {"newBalance": 2500}

# Test admin list gift cards (requires auth cookie)
curl "http://localhost:3000/api/gift-cards/list?state=ACTIVE" \
  -H "Cookie: next-auth.session-token=..."

# Expected: {"giftCards": [...], "totalOutstandingBalance": 5000, "cursor": "..."}

# Test admin gift card activities
curl "http://localhost:3000/api/gift-cards/gftc_xxx/activities" \
  -H "Cookie: next-auth.session-token=..."

# Expected: {"activities": [{"type": "ACTIVATE", ...}, {"type": "REDEEM", ...}]}
```

## Final Validation Checklist
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Gift card purchase creates active card
- [ ] Gift card email delivered to recipient
- [ ] Balance check works with GAN
- [ ] Redemption subtracts from balance
- [ ] Split payment (gift card + credit card) works
- [ ] Gift cards visible in Square Dashboard
- [ ] Partial redemption leaves correct balance
- [ ] Invalid/empty cards show appropriate errors
- [ ] Admin can view all gift cards at /admin/dashboard/gift-cards
- [ ] Admin gift card list shows correct balances and statuses
- [ ] Admin can filter gift cards by status
- [ ] Admin can view activity history for individual cards
- [ ] Admin page is protected (requires authentication)
- [ ] Total outstanding balance calculated correctly

---

## Anti-Patterns to Avoid
- DO NOT skip the ACTIVATE step after CREATE - card won't work
- DO NOT store GANs in plain text in logs - treat as sensitive
- DO NOT allow redemption greater than balance - validate first
- DO NOT create duplicate cards on retry - use idempotency keys
- DO NOT assume card is active - always check status before redemption
- DO NOT display full GAN in UI after purchase - show last 4 only
