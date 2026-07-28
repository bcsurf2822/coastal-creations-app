import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock the Square v44 client's cards API. The service instantiates the client at
// import time, so the mock must be in place before importing the service.
const cardsCreate = vi.fn();
const cardsList = vi.fn();
const cardsGet = vi.fn();
const cardsDisable = vi.fn();

vi.mock("@/lib/square/client", () => ({
  getSquareClient: () => ({
    cards: {
      create: (...a: unknown[]) => cardsCreate(...a),
      list: (...a: unknown[]) => cardsList(...a),
      get: (...a: unknown[]) => cardsGet(...a),
      disable: (...a: unknown[]) => cardsDisable(...a),
    },
  }),
}));

import { squareCardService } from "@/lib/square/cards";

// An async-iterable page like the SDK returns from cards.list().
function asyncPage<T>(items: T[]): AsyncIterable<T> {
  return {
    async *[Symbol.asyncIterator]() {
      for (const item of items) yield item;
    },
  };
}

const SQUARE_CARD = {
  id: "ccof:abc123",
  cardBrand: "VISA",
  last4: "1111",
  expMonth: BigInt(4),
  expYear: BigInt(2027),
  cardholderName: "Pat Buyer",
  customerId: "sqcust_1",
  enabled: true,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("squareCardService.createCard", () => {
  it("saves the card under the customer and returns display-safe metadata", async () => {
    cardsCreate.mockResolvedValue({ card: SQUARE_CARD });

    const card = await squareCardService.createCard({
      sourceId: "cnon:nonce",
      customerId: "sqcust_1",
      cardholderName: "Pat Buyer",
      verificationToken: "verif_1",
      referenceId: "user_1",
    });

    const req = cardsCreate.mock.calls[0][0];
    expect(req.sourceId).toBe("cnon:nonce");
    expect(req.verificationToken).toBe("verif_1");
    expect(req.card.customerId).toBe("sqcust_1");
    expect(req.card.referenceId).toBe("user_1");
    expect(req.idempotencyKey).toBeTruthy();

    // bigint expiry mapped to number; no PAN exposed.
    expect(card).toEqual({
      id: "ccof:abc123",
      brand: "VISA",
      last4: "1111",
      expMonth: 4,
      expYear: 2027,
      cardholderName: "Pat Buyer",
    });
  });

  it("throws when Square returns no card", async () => {
    cardsCreate.mockResolvedValue({ card: undefined });
    await expect(
      squareCardService.createCard({ sourceId: "x", customerId: "sqcust_1" })
    ).rejects.toThrow(/failed to save card/i);
  });
});

describe("squareCardService.listCards", () => {
  it("returns enabled cards for the customer and skips disabled ones", async () => {
    cardsList.mockResolvedValue(
      asyncPage([
        SQUARE_CARD,
        { ...SQUARE_CARD, id: "ccof:disabled", enabled: false },
        { ...SQUARE_CARD, id: "ccof:second", last4: "4242" },
      ])
    );

    const cards = await squareCardService.listCards("sqcust_1");

    expect(cardsList.mock.calls[0][0]).toMatchObject({
      customerId: "sqcust_1",
      includeDisabled: false,
    });
    expect(cards.map((c) => c.id)).toEqual(["ccof:abc123", "ccof:second"]);
  });

  it("returns an empty list (never throws) when Square errors", async () => {
    cardsList.mockRejectedValue(new Error("Square down"));
    const cards = await squareCardService.listCards("sqcust_1");
    expect(cards).toEqual([]);
  });
});

describe("squareCardService.getCard", () => {
  it("includes the owning customerId for ownership checks", async () => {
    cardsGet.mockResolvedValue({ card: SQUARE_CARD });
    const card = await squareCardService.getCard("ccof:abc123");
    expect(card?.customerId).toBe("sqcust_1");
    expect(card?.last4).toBe("1111");
  });

  it("returns null when the card does not exist", async () => {
    cardsGet.mockRejectedValue(new Error("not found"));
    expect(await squareCardService.getCard("ccof:nope")).toBeNull();
  });
});

describe("squareCardService.disableCard", () => {
  it("returns true on success and false on failure", async () => {
    cardsDisable.mockResolvedValue({ card: { ...SQUARE_CARD, enabled: false } });
    expect(await squareCardService.disableCard("ccof:abc123")).toBe(true);

    cardsDisable.mockRejectedValue(new Error("boom"));
    expect(await squareCardService.disableCard("ccof:abc123")).toBe(false);
  });
});
