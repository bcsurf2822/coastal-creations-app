import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextResponse } from "next/server";

// --- Mock auth + Square dependencies ---
const requireUser = vi.fn();
vi.mock("@/lib/auth/guards", () => ({
  requireUser: (...a: unknown[]) => requireUser(...a),
}));

const listCards = vi.fn();
const createCard = vi.fn();
const getCard = vi.fn();
const disableCard = vi.fn();
vi.mock("@/lib/square/cards", () => ({
  squareCardService: {
    listCards: (...a: unknown[]) => listCards(...a),
    createCard: (...a: unknown[]) => createCard(...a),
    getCard: (...a: unknown[]) => getCard(...a),
    disableCard: (...a: unknown[]) => disableCard(...a),
  },
}));

const resolveUserSquareCustomerId = vi.fn();
vi.mock("@/lib/square/userCustomer", () => ({
  resolveUserSquareCustomerId: (...a: unknown[]) =>
    resolveUserSquareCustomerId(...a),
}));

import { GET, POST } from "@/app/api/account/cards/route";
import { DELETE } from "@/app/api/account/cards/[cardId]/route";

const USER = { id: "user_1", email: "u@example.com", isAdmin: false, role: "customer" };
const UNAUTH = NextResponse.json({ error: "Unauthorized" }, { status: 401 });

function postReq(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/account/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  vi.clearAllMocks();
  requireUser.mockResolvedValue(USER);
});

describe("GET /api/account/cards", () => {
  it("401s when not signed in", async () => {
    requireUser.mockResolvedValue(UNAUTH);
    const res = await GET();
    expect(res.status).toBe(401);
    expect(listCards).not.toHaveBeenCalled();
  });

  it("returns an empty list when the user has no Square customer yet", async () => {
    resolveUserSquareCustomerId.mockResolvedValue(null);
    const res = await GET();
    const data = await res.json();
    expect(data.cards).toEqual([]);
    expect(listCards).not.toHaveBeenCalled();
  });

  it("lists the user's saved cards", async () => {
    resolveUserSquareCustomerId.mockResolvedValue("sqcust_1");
    listCards.mockResolvedValue([{ id: "ccof:1", brand: "VISA", last4: "1111" }]);
    const res = await GET();
    const data = await res.json();
    expect(listCards).toHaveBeenCalledWith("sqcust_1");
    expect(data.cards).toHaveLength(1);
  });
});

describe("POST /api/account/cards", () => {
  it("401s when not signed in", async () => {
    requireUser.mockResolvedValue(UNAUTH);
    const res = await POST(postReq({ sourceId: "cnon:x" }));
    expect(res.status).toBe(401);
    expect(createCard).not.toHaveBeenCalled();
  });

  it("400s when the card token is missing", async () => {
    const res = await POST(postReq({}));
    expect(res.status).toBe(400);
    expect(createCard).not.toHaveBeenCalled();
  });

  it("saves the card under the user's (created-if-missing) customer and passes the user id as reference", async () => {
    resolveUserSquareCustomerId.mockResolvedValue("sqcust_1");
    createCard.mockResolvedValue({ id: "ccof:1", brand: "VISA", last4: "1111" });

    const res = await POST(
      postReq({ sourceId: "cnon:x", verificationToken: "v1", cardholderName: "Pat" })
    );
    expect(res.status).toBe(201);
    expect(resolveUserSquareCustomerId).toHaveBeenCalledWith(USER, {
      createIfMissing: true,
    });
    const arg = createCard.mock.calls[0][0];
    expect(arg).toMatchObject({
      sourceId: "cnon:x",
      customerId: "sqcust_1",
      verificationToken: "v1",
      cardholderName: "Pat",
      referenceId: "user_1",
    });
  });
});

describe("DELETE /api/account/cards/[cardId]", () => {
  const ctx = (cardId: string) => ({ params: Promise.resolve({ cardId }) });

  it("401s when not signed in", async () => {
    requireUser.mockResolvedValue(UNAUTH);
    const res = await DELETE(new Request("http://localhost"), ctx("ccof:1"));
    expect(res.status).toBe(401);
    expect(disableCard).not.toHaveBeenCalled();
  });

  it("404s and does NOT disable a card owned by a different customer", async () => {
    resolveUserSquareCustomerId.mockResolvedValue("sqcust_1");
    getCard.mockResolvedValue({ id: "ccof:1", customerId: "sqcust_OTHER" });

    const res = await DELETE(new Request("http://localhost"), ctx("ccof:1"));
    expect(res.status).toBe(404);
    expect(disableCard).not.toHaveBeenCalled();
  });

  it("disables a card the user owns", async () => {
    resolveUserSquareCustomerId.mockResolvedValue("sqcust_1");
    getCard.mockResolvedValue({ id: "ccof:1", customerId: "sqcust_1" });
    disableCard.mockResolvedValue(true);

    const res = await DELETE(new Request("http://localhost"), ctx("ccof:1"));
    const data = await res.json();
    expect(data.success).toBe(true);
    expect(disableCard).toHaveBeenCalledWith("ccof:1");
  });
});
