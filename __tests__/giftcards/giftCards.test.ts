import { describe, it, expect, vi, beforeEach } from "vitest";

const getBalance = vi.fn();
const getById = vi.fn();
const redeem = vi.fn();
vi.mock("@/lib/square/gift-cards", () => ({
  giftCardService: {
    getBalance: (...a: unknown[]) => getBalance(...a),
    getById: (...a: unknown[]) => getById(...a),
    redeem: (...a: unknown[]) => redeem(...a),
  },
}));

import { GET as balanceGET } from "@/app/api/gift-cards/balance/route";
import { POST as redeemPOST } from "@/app/api/gift-cards/redeem/route";

function balanceReq(gan?: string): Request {
  const url = gan
    ? `http://localhost/api/gift-cards/balance?gan=${encodeURIComponent(gan)}`
    : "http://localhost/api/gift-cards/balance";
  return new Request(url);
}

function redeemReq(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/gift-cards/redeem", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => vi.clearAllMocks());

describe("GET /api/gift-cards/balance", () => {
  it("400s when no GAN is provided", async () => {
    const res = await balanceGET(balanceReq());
    expect(res.status).toBe(400);
    expect(getBalance).not.toHaveBeenCalled();
  });

  it("400s on a malformed GAN (not 16 digits)", async () => {
    const res = await balanceGET(balanceReq("1234"));
    expect(res.status).toBe(400);
    expect(getBalance).not.toHaveBeenCalled();
  });

  it("strips dashes and returns balance for a valid GAN", async () => {
    getBalance.mockResolvedValue({ balance: 5000, status: "ACTIVE", giftCardId: "gc_1" });
    const res = await balanceGET(balanceReq("1234-5678-9012-3456"));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(getBalance).toHaveBeenCalledWith("1234567890123456");
    expect(data.balance).toBe(5000);
    expect(data.formattedBalance).toBe("$50.00");
  });

  it("404s when the gift card is not found", async () => {
    getBalance.mockResolvedValue(null);
    const res = await balanceGET(balanceReq("1111222233334444"));
    expect(res.status).toBe(404);
  });
});

describe("POST /api/gift-cards/redeem", () => {
  it("400s without a gift card id", async () => {
    const res = await redeemPOST(redeemReq({ amountCents: 100 }));
    expect(res.status).toBe(400);
  });

  it("400s on a non-positive amount", async () => {
    const res = await redeemPOST(redeemReq({ giftCardId: "gc_1", amountCents: 0 }));
    expect(res.status).toBe(400);
  });

  it("404s when the card does not exist", async () => {
    getById.mockResolvedValue(null);
    const res = await redeemPOST(redeemReq({ giftCardId: "gc_x", amountCents: 100 }));
    expect(res.status).toBe(404);
  });

  it("400s when the card is not ACTIVE", async () => {
    getById.mockResolvedValue({ state: "DEACTIVATED", balanceMoney: { amount: 5000 } });
    const res = await redeemPOST(redeemReq({ giftCardId: "gc_1", amountCents: 100 }));
    expect(res.status).toBe(400);
    expect(redeem).not.toHaveBeenCalled();
  });

  it("400s when the requested amount exceeds the balance", async () => {
    getById.mockResolvedValue({ state: "ACTIVE", balanceMoney: { amount: 500 } });
    const res = await redeemPOST(redeemReq({ giftCardId: "gc_1", amountCents: 1000 }));
    expect(res.status).toBe(400);
    expect(redeem).not.toHaveBeenCalled();
  });

  it("redeems and returns the new balance for a valid active card", async () => {
    getById.mockResolvedValue({ state: "ACTIVE", balanceMoney: { amount: 5000 } });
    redeem.mockResolvedValue({ newBalance: 4000 });
    const res = await redeemPOST(redeemReq({ giftCardId: "gc_1", amountCents: 1000, referenceId: "order-1" }));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(redeem).toHaveBeenCalledWith("gc_1", 1000, "order-1");
    expect(data.newBalance).toBe(4000);
    expect(data.formattedNewBalance).toBe("$40.00");
  });
});
