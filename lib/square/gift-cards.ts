/**
 * Square Gift Card Service
 * Handles all Square Gift Cards API operations
 */
import { Client, Environment, ApiError } from "square/legacy";
import { randomUUID } from "crypto";

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

// Extract APIs with type assertions for methods that may not be fully typed
const giftCardsApi = squareClient.giftCardsApi;
const giftCardActivitiesApi = squareClient.giftCardActivitiesApi;
const ordersApi = squareClient.ordersApi;
const paymentsApi = squareClient.paymentsApi;

// Types
export interface GiftCard {
  id: string;
  gan: string;
  state: "PENDING" | "ACTIVE" | "DEACTIVATED" | "BLOCKED";
  balanceMoney: {
    amount: number;
    currency: string;
  };
  createdAt: string;
}

export interface GiftCardActivity {
  id: string;
  type: string;
  locationId: string;
  createdAt: string;
  giftCardBalanceMoney: {
    amount: number;
    currency: string;
  };
  activateDetails?: {
    amount: number;
  };
  loadDetails?: {
    amount: number;
  };
  redeemDetails?: {
    amount: number;
    referenceId?: string;
  };
}

export interface GiftCardPurchaseInput {
  amountCents: number;
  recipientEmail: string;
  recipientName: string;
  senderName: string;
  personalMessage?: string;
  purchaserEmail: string;
}

export class GiftCardService {
  private locationId: string;

  constructor() {
    this.locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID || process.env.SQUARE_LOCATION_ID || "";
  }

  /**
   * Create and activate a gift card with payment processing
   * Uses Square's order-based flow (recommended for custom checkout):
   * 1. Create Order with GIFT_CARD line item
   * 2. Process payment for the order
   * 3. Create gift card (PENDING state)
   * 4. Activate with order reference (ACTIVE state)
   *
   * @param amountCents - Gift card amount in cents
   * @param sourceId - Card token from Square payment form
   * @param customerId - Optional Square customer ID to link payment
   */
  async createAndActivateGiftCard(
    amountCents: number,
    sourceId?: string,
    customerId?: string
  ): Promise<{ gan: string; giftCardId: string; orderId: string; paymentId?: string }> {
    console.log("[GIFT-CARDS-createAndActivate] Creating gift card for amount:", amountCents);
    console.log("[GIFT-CARDS-createAndActivate] Location ID:", this.locationId);
    console.log("[GIFT-CARDS-createAndActivate] Environment:", process.env.SQUARE_ENVIRONMENT);

    if (!this.locationId) {
      throw new Error("Square location ID is not configured");
    }

    // Step 1: Create Order with GIFT_CARD line item
    console.log("[GIFT-CARDS-createAndActivate] Step 1: Creating order...");
    const orderResponse = await ordersApi.createOrder({
      idempotencyKey: randomUUID(),
      order: {
        locationId: this.locationId,
        lineItems: [
          {
            name: "Digital Gift Card",
            quantity: "1",
            itemType: "GIFT_CARD",
            basePriceMoney: {
              amount: BigInt(amountCents),
              currency: "USD",
            },
          },
        ],
      },
    });

    const order = orderResponse.result.order;
    if (!order || !order.id || !order.lineItems || order.lineItems.length === 0) {
      console.error("[GIFT-CARDS-createAndActivate] Order response:", JSON.stringify(orderResponse.result, null, 2));
      throw new Error("Failed to create order for gift card");
    }

    const orderId = order.id;
    // Get the actual line item UID assigned by Square
    const lineItemUid = order.lineItems[0].uid;
    console.log("[GIFT-CARDS-createAndActivate] Order created:", orderId, "Line item UID:", lineItemUid);

    // Step 2: Process payment for the order (if sourceId provided)
    let paymentId: string | undefined;
    if (sourceId) {
      console.log("[GIFT-CARDS-createAndActivate] Step 2: Processing payment...");
      if (customerId) {
        console.log("[GIFT-CARDS-createAndActivate] Linking payment to customer:", customerId);
      }
      const paymentResponse = await paymentsApi.createPayment({
        idempotencyKey: randomUUID(),
        sourceId: sourceId,
        amountMoney: {
          amount: BigInt(amountCents),
          currency: "USD",
        },
        orderId: orderId,
        locationId: this.locationId,
        customerId: customerId,
      });

      const payment = paymentResponse.result.payment;
      if (!payment || payment.status !== "COMPLETED") {
        console.error("[GIFT-CARDS-createAndActivate] Payment failed:", payment?.status);
        throw new Error(`Payment failed with status: ${payment?.status || "unknown"}`);
      }

      paymentId = payment.id;
      console.log("[GIFT-CARDS-createAndActivate] Payment completed:", paymentId);
    }

    // Step 3: Create gift card (PENDING state)
    console.log("[GIFT-CARDS-createAndActivate] Step 3: Creating gift card...");
    const createResponse = await giftCardsApi.createGiftCard({
      idempotencyKey: randomUUID(),
      locationId: this.locationId,
      giftCard: {
        type: "DIGITAL",
      },
    });

    const giftCard = createResponse.result.giftCard;
    if (!giftCard || !giftCard.id || !giftCard.gan) {
      console.error("[GIFT-CARDS-createAndActivate] Create response:", JSON.stringify(createResponse.result, null, 2));
      throw new Error("Failed to create gift card - missing card data");
    }

    const giftCardId = giftCard.id;
    const gan = giftCard.gan;

    console.log("[GIFT-CARDS-createAndActivate] Step 4: Activating gift card with order reference...");
    console.log("[GIFT-CARDS-createAndActivate] Using orderId:", orderId, "lineItemUid:", lineItemUid);

    // Step 4: Activate with order reference
    // When using Square Orders API, amount comes from the order line item
    await giftCardActivitiesApi.createGiftCardActivity({
      idempotencyKey: randomUUID(),
      giftCardActivity: {
        type: "ACTIVATE",
        locationId: this.locationId,
        giftCardId: giftCardId,
        activateActivityDetails: {
          orderId: orderId,
          lineItemUid: lineItemUid,
        },
      },
    });

    console.log("[GIFT-CARDS-createAndActivate] Gift card activated:", gan);

    return { gan, giftCardId, orderId, paymentId };
  }

  /**
   * Get gift card by GAN (Gift Card Account Number)
   * GAN is the 16-digit number customer sees/enters
   */
  async getByGan(gan: string): Promise<GiftCard | null> {
    // Remove any dashes from input
    const cleanGan = gan.replace(/-/g, "");

    try {
      const response = await giftCardsApi.retrieveGiftCardFromGAN({
        gan: cleanGan,
      });

      const card = response.result.giftCard;
      if (!card) return null;

      return this.mapGiftCard(card);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Get gift card by Square ID
   */
  async getById(giftCardId: string): Promise<GiftCard | null> {
    try {
      const response = await giftCardsApi.retrieveGiftCard(giftCardId);
      const card = response.result.giftCard;
      if (!card) return null;

      return this.mapGiftCard(card);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  /**
   * Check balance by GAN
   */
  async getBalance(gan: string): Promise<{ balance: number; status: string; giftCardId: string } | null> {
    const card = await this.getByGan(gan);
    if (!card) return null;

    return {
      balance: card.balanceMoney.amount,
      status: card.state,
      giftCardId: card.id,
    };
  }

  /**
   * Redeem gift card (subtract from balance)
   * Creates a REDEEM activity on the card
   */
  async redeem(
    giftCardId: string,
    amountCents: number,
    referenceId?: string
  ): Promise<{ newBalance: number }> {
    console.log("[GIFT-CARDS-redeem] Redeeming", amountCents, "cents from card:", giftCardId);

    const response = await giftCardActivitiesApi.createGiftCardActivity({
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
          referenceId: referenceId,
        },
      },
    });

    const activity = response.result.giftCardActivity;
    const newBalance = Number(activity?.giftCardBalanceMoney?.amount || 0);

    console.log("[GIFT-CARDS-redeem] Redemption complete, new balance:", newBalance);

    return { newBalance };
  }

  /**
   * List all gift cards (admin)
   * Supports pagination and filtering by state
   */
  async listGiftCards(options?: {
    cursor?: string;
    state?: string;
    limit?: number;
  }): Promise<{
    giftCards: GiftCard[];
    cursor?: string;
    totalOutstandingBalance: number;
  }> {
    // Square SDK listGiftCards takes positional params: (type?, state?, limit?, cursor?, customerId?)
    const response = await giftCardsApi.listGiftCards(
      undefined, // type
      options?.state,
      options?.limit || 50,
      options?.cursor,
      undefined // customerId
    );

    const giftCards = (response.result.giftCards || []) as Array<{
      id?: string | null;
      gan?: string | null;
      state?: string | null;
      balanceMoney?: { amount?: bigint | null; currency?: string | null } | null;
      createdAt?: string | null;
    }>;

    // Calculate total outstanding balance for active cards
    const totalOutstandingBalance = giftCards.reduce((sum, card) => {
      if (card.state === "ACTIVE") {
        return sum + Number(card.balanceMoney?.amount || 0);
      }
      return sum;
    }, 0);

    return {
      giftCards: giftCards.map((card) => this.mapGiftCard(card)),
      cursor: response.result.cursor || undefined,
      totalOutstandingBalance,
    };
  }

  /**
   * Get activity history for a gift card (admin)
   */
  async getGiftCardActivities(giftCardId: string): Promise<GiftCardActivity[]> {
    // Square SDK listGiftCardActivities takes positional params:
    // (giftCardId?, type?, locationId?, beginTime?, endTime?, limit?, cursor?, sortOrder?)
    const response = await giftCardActivitiesApi.listGiftCardActivities(
      giftCardId,
      undefined, // type
      undefined, // locationId
      undefined, // beginTime
      undefined, // endTime
      100, // limit
      undefined, // cursor
      undefined // sortOrder
    );

    // Type the activities properly
    type SquareActivity = {
      id?: string | null;
      type?: string | null;
      locationId?: string | null;
      createdAt?: string | null;
      giftCardBalanceMoney?: { amount?: bigint | null; currency?: string | null } | null;
      activateActivityDetails?: { amountMoney?: { amount?: bigint | null } | null } | null;
      loadActivityDetails?: { amountMoney?: { amount?: bigint | null } | null } | null;
      redeemActivityDetails?: { amountMoney?: { amount?: bigint | null } | null; referenceId?: string | null } | null;
    };

    const activities = (response.result.giftCardActivities || []) as SquareActivity[];

    return activities.map((activity) => {
      const result: GiftCardActivity = {
        id: activity.id || "",
        type: activity.type || "",
        locationId: activity.locationId || "",
        createdAt: activity.createdAt || "",
        giftCardBalanceMoney: {
          amount: Number(activity.giftCardBalanceMoney?.amount || 0),
          currency: activity.giftCardBalanceMoney?.currency || "USD",
        },
      };

      if (activity.activateActivityDetails) {
        result.activateDetails = {
          amount: Number(activity.activateActivityDetails.amountMoney?.amount || 0),
        };
      }

      if (activity.loadActivityDetails) {
        result.loadDetails = {
          amount: Number(activity.loadActivityDetails.amountMoney?.amount || 0),
        };
      }

      if (activity.redeemActivityDetails) {
        result.redeemDetails = {
          amount: Number(activity.redeemActivityDetails.amountMoney?.amount || 0),
          referenceId: activity.redeemActivityDetails.referenceId || undefined,
        };
      }

      return result;
    });
  }

  /**
   * Format GAN for display (XXXX-XXXX-XXXX-XXXX)
   */
  formatGan(gan: string): string {
    const clean = gan.replace(/-/g, "");
    return clean.match(/.{1,4}/g)?.join("-") || gan;
  }

  /**
   * Map Square API gift card to our GiftCard interface
   */
  private mapGiftCard(card: {
    id?: string | null;
    gan?: string | null;
    state?: string | null;
    balanceMoney?: {
      amount?: bigint | null;
      currency?: string | null;
    } | null;
    createdAt?: string | null;
  }): GiftCard {
    return {
      id: card.id || "",
      gan: card.gan || "",
      state: (card.state as GiftCard["state"]) || "PENDING",
      balanceMoney: {
        amount: Number(card.balanceMoney?.amount || 0),
        currency: card.balanceMoney?.currency || "USD",
      },
      createdAt: card.createdAt || "",
    };
  }
}

// Export singleton instance
export const giftCardService = new GiftCardService();
