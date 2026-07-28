import { getSquareClient } from "@/lib/square/client";
import { randomUUID } from "crypto";

/**
 * Square Cards on File service (v44 native `cards` API).
 *
 * Card data NEVER touches our server: the Web Payments SDK tokenizes the card
 * (intent STORE) into a one-time `sourceId`; `CreateCard` exchanges it for a
 * durable card id (`ccof:...`) on the customer's Square profile. We persist only
 * the id + display metadata. Charging a saved card later is a normal
 * `payments.create` with `sourceId = card id` + `customerId` (see the checkout routes).
 */

// Display-safe view of a saved card. No PAN — last4/brand/expiry only.
export interface SavedCard {
  id: string;
  brand: string; // e.g. "VISA", "MASTERCARD"
  last4: string;
  expMonth: number;
  expYear: number;
  cardholderName?: string;
}

export interface CreateCardInput {
  sourceId: string; // one-time nonce from the Web Payments SDK
  customerId: string; // Square customer the card is filed under
  cardholderName?: string;
  verificationToken?: string; // from verifyBuyer (SCA), when present
  referenceId?: string; // our user id, for cross-referencing
}

const client = getSquareClient();

function mapCard(card: {
  id?: string | null;
  cardBrand?: string | null;
  last4?: string | null;
  expMonth?: bigint | null;
  expYear?: bigint | null;
  cardholderName?: string | null;
}): SavedCard {
  return {
    id: card.id ?? "",
    brand: card.cardBrand ?? "CARD",
    last4: card.last4 ?? "",
    expMonth: card.expMonth != null ? Number(card.expMonth) : 0,
    expYear: card.expYear != null ? Number(card.expYear) : 0,
    cardholderName: card.cardholderName ?? undefined,
  };
}

export class SquareCardService {
  /** Save a card on file for a customer. Throws if Square returns no card. */
  async createCard(input: CreateCardInput): Promise<SavedCard> {
    const response = await client.cards.create({
      idempotencyKey: randomUUID(),
      sourceId: input.sourceId,
      verificationToken: input.verificationToken,
      card: {
        customerId: input.customerId,
        cardholderName: input.cardholderName,
        referenceId: input.referenceId,
      },
    });

    if (!response.card) {
      throw new Error("Failed to save card in Square");
    }
    return mapCard(response.card);
  }

  /** Enabled saved cards for a customer, newest activity first (Square order). */
  async listCards(customerId: string): Promise<SavedCard[]> {
    const cards: SavedCard[] = [];
    try {
      const page = await client.cards.list({
        customerId,
        includeDisabled: false,
        // Explicit: the v44 client serializes an omitted sortOrder as an empty
        // string, which Square's API rejects (INVALID_ENUM_VALUE). Newest first.
        sortOrder: "DESC",
      });
      for await (const card of page) {
        if (card.enabled === false) continue;
        const mapped = mapCard(card);
        if (mapped.id) cards.push(mapped);
        if (cards.length >= 50) break; // sane cap — a customer won't have this many
      }
    } catch (error) {
      console.error("[SQUARE-CARDS-listCards] Error:", error);
    }
    return cards;
  }

  /**
   * A single card by id, including the owning customerId (used for ownership
   * checks before disabling). Null if it does not exist.
   */
  async getCard(
    cardId: string
  ): Promise<(SavedCard & { customerId?: string }) | null> {
    try {
      const response = await client.cards.get({ cardId });
      if (!response.card) return null;
      return {
        ...mapCard(response.card),
        customerId: response.card.customerId ?? undefined,
      };
    } catch (error) {
      console.error("[SQUARE-CARDS-getCard] Error:", error);
      return null;
    }
  }

  /** Disable (remove) a saved card. Idempotent in Square. */
  async disableCard(cardId: string): Promise<boolean> {
    try {
      await client.cards.disable({ cardId });
      return true;
    } catch (error) {
      console.error("[SQUARE-CARDS-disableCard] Error:", error);
      return false;
    }
  }
}

export const squareCardService = new SquareCardService();
