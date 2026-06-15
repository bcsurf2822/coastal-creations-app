import { describe, it, expect, vi, beforeEach } from "vitest";
import { createHmac } from "crypto";
import { verifySquareWebhookSignature } from "@/lib/utils/webhookHelpers";
import { computeTaxCents, getTaxRateForState, taxLabel } from "@/lib/utils/taxHelpers";

// ─── hoisted mocks — all constructor-safe classes defined here ───────────────

const mocks = vi.hoisted(() => {
  const transactionsCreate = vi.fn();
  const findOne = vi.fn();
  const findByIdAndUpdate = vi.fn();
  const connectMongo = vi.fn().mockResolvedValue(undefined);
  const render = vi.fn().mockResolvedValue("<html>email</html>");
  const resendSend = vi.fn().mockResolvedValue({ id: "email-id" });

  class MockShippo {
    transactions = { create: transactionsCreate };
  }

  class MockResend {
    emails = { send: resendSend };
  }

  return {
    transactionsCreate,
    findOne,
    findByIdAndUpdate,
    connectMongo,
    render,
    resendSend,
    MockShippo,
    MockResend,
  };
});

vi.mock("@/lib/mongoose", () => ({ connectMongo: mocks.connectMongo }));
vi.mock("@react-email/render", () => ({ render: mocks.render }));
vi.mock("@/components/email-templates/ShippingConfirmationEmail", () => ({
  ShippingConfirmationEmail: vi.fn(),
}));
vi.mock("@/lib/models/Order", () => ({
  default: {
    findOne: (...args: unknown[]) => mocks.findOne(...args),
    findByIdAndUpdate: (...args: unknown[]) => mocks.findByIdAndUpdate(...args),
  },
}));
vi.mock("resend", () => ({ Resend: mocks.MockResend }));
vi.mock("shippo", () => ({ Shippo: mocks.MockShippo }));

import { POST } from "@/app/api/webhooks/square/route";

// ─── verifySquareWebhookSignature ────────────────────────────────────────────

describe("verifySquareWebhookSignature", () => {
  const KEY = "test-signing-key";
  const URL = "https://example.com/api/webhooks/square";
  const BODY = JSON.stringify({ type: "payment.completed" });

  function validSig(key: string, url: string, body: string): string {
    return createHmac("sha256", key).update(url + body).digest("base64");
  }

  it("returns true for a valid signature", () => {
    expect(verifySquareWebhookSignature(BODY, validSig(KEY, URL, BODY), URL, KEY)).toBe(true);
  });

  it("returns false for a tampered body", () => {
    expect(verifySquareWebhookSignature(BODY + "x", validSig(KEY, URL, BODY), URL, KEY)).toBe(false);
  });

  it("returns false for a wrong signing key", () => {
    expect(verifySquareWebhookSignature(BODY, validSig("wrong", URL, BODY), URL, KEY)).toBe(false);
  });

  it("returns false when signature header is null", () => {
    expect(verifySquareWebhookSignature(BODY, null, URL, KEY)).toBe(false);
  });

  it("returns true (bypass) when signing key env var is not set", () => {
    expect(verifySquareWebhookSignature(BODY, "garbage", URL, undefined)).toBe(true);
  });

  it("returns false when URL used in signing differs from expected URL", () => {
    const sig = validSig(KEY, "https://other.com/api/webhooks/square", BODY);
    expect(verifySquareWebhookSignature(BODY, sig, URL, KEY)).toBe(false);
  });
});

// ─── tax helpers ─────────────────────────────────────────────────────────────

describe("getTaxRateForState", () => {
  it("returns correct rate for NJ", () => expect(getTaxRateForState("NJ")).toBe(0.06625));
  it("returns correct rate for TX", () => expect(getTaxRateForState("TX")).toBe(0.0625));
  it("returns 0 for OR (no sales tax)", () => expect(getTaxRateForState("OR")).toBe(0));
  it("returns 0 for unknown state code", () => expect(getTaxRateForState("XX")).toBe(0));
  it("is case-insensitive", () => expect(getTaxRateForState("nj")).toBe(0.06625));
});

describe("computeTaxCents", () => {
  it("NJ: 6.625% on $100.00 → 663¢", () => expect(computeTaxCents(10000, "NJ")).toBe(663));
  it("TX: 6.25% on $24.99 → 156¢", () => expect(computeTaxCents(2499, "TX")).toBe(156));
  it("OR: 0% → $0 tax", () => expect(computeTaxCents(10000, "OR")).toBe(0));
  it("returns 0 for zero subtotal", () => expect(computeTaxCents(0, "NJ")).toBe(0));
});

describe("taxLabel", () => {
  it("formats NJ correctly", () => expect(taxLabel("NJ")).toBe("NJ 6.625%"));
  it("formats TX correctly", () => expect(taxLabel("TX")).toBe("TX 6.25%"));
  it("formats OR correctly (no tax)", () => expect(taxLabel("OR")).toBe("OR 0%"));
});

// ─── POST /api/webhooks/square ────────────────────────────────────────────────

const WEBHOOK_URL = "https://example.com/api/webhooks/square";
const SIGNING_KEY = "test-key";

function makeRequest(body: unknown, sig?: string): Request {
  const raw = JSON.stringify(body);
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (sig !== undefined) headers["x-square-hmacsha256-signature"] = sig;
  return new Request(WEBHOOK_URL, { method: "POST", headers, body: raw });
}

function validSig(body: unknown): string {
  const raw = JSON.stringify(body);
  return createHmac("sha256", SIGNING_KEY).update(WEBHOOK_URL + raw).digest("base64");
}

const PAYMENT_EVENT = {
  type: "payment.completed",
  event_id: "evt_001",
  data: { object: { payment: { id: "sq_pay_abc", status: "COMPLETED" } } },
};

beforeEach(() => {
  vi.resetAllMocks();
  mocks.render.mockResolvedValue("<html>email</html>");
  mocks.resendSend.mockResolvedValue({ id: "email-id" });
  mocks.connectMongo.mockResolvedValue(undefined);
  process.env.SQUARE_WEBHOOK_SIGNATURE_KEY = SIGNING_KEY;
  process.env.SQUARE_WEBHOOK_URL = WEBHOOK_URL;
  process.env.VERCEL_ENV = "development";
  process.env.DEV_EMAIL = "dev@example.com";
});

describe("POST /api/webhooks/square", () => {
  it("returns 401 for an invalid signature", async () => {
    const req = makeRequest(PAYMENT_EVENT, "bad-sig");
    const res = await POST(req);
    expect(res.status).toBe(401);
  });

  it("returns 400 for malformed JSON", async () => {
    const raw = "not-json";
    const sig = createHmac("sha256", SIGNING_KEY).update(WEBHOOK_URL + raw).digest("base64");
    const req = new Request(WEBHOOK_URL, {
      method: "POST",
      headers: { "x-square-hmacsha256-signature": sig },
      body: raw,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("acknowledges unhandled event types without querying the DB", async () => {
    const body = { type: "refund.created", event_id: "evt_002", data: { object: {} } };
    const res = await POST(makeRequest(body, validSig(body)));
    expect(res.status).toBe(200);
    expect((await res.json()).received).toBe(true);
    expect(mocks.findOne).not.toHaveBeenCalled();
  });

  it("returns 200 when the payment belongs to a non-store flow (no matching order)", async () => {
    mocks.findOne.mockResolvedValue(null);
    const res = await POST(makeRequest(PAYMENT_EVENT, validSig(PAYMENT_EVENT)));
    expect(res.status).toBe(200);
    expect(mocks.transactionsCreate).not.toHaveBeenCalled();
  });

  it("skips label creation when order is already past 'paid' (idempotency)", async () => {
    mocks.findOne.mockResolvedValue({
      _id: "oid",
      orderNumber: "CC-001",
      status: "label_created",
      shippo: { rateId: "rate_abc", carrier: "UPS" },
      customer: { firstName: "Jane", lastName: "Doe", email: "jane@test.com" },
    });
    const res = await POST(makeRequest(PAYMENT_EVENT, validSig(PAYMENT_EVENT)));
    expect(res.status).toBe(200);
    expect(mocks.transactionsCreate).not.toHaveBeenCalled();
  });

  it("skips label creation when order has no Shippo rateId", async () => {
    mocks.findOne.mockResolvedValue({
      _id: "oid",
      orderNumber: "CC-002",
      status: "paid",
      shippo: {},
      customer: { firstName: "Jane", lastName: "Doe", email: "jane@test.com" },
    });
    const res = await POST(makeRequest(PAYMENT_EVENT, validSig(PAYMENT_EVENT)));
    expect(res.status).toBe(200);
    expect(mocks.transactionsCreate).not.toHaveBeenCalled();
  });

  it("creates label, updates order, and sends 2 emails on the happy path", async () => {
    mocks.findOne.mockResolvedValue({
      _id: "oid",
      orderNumber: "CC-003",
      status: "paid",
      shippo: { rateId: "rate_xyz", carrier: "FedEx" },
      customer: { firstName: "John", lastName: "Smith", email: "john@test.com" },
    });
    mocks.findByIdAndUpdate.mockResolvedValue(null);
    mocks.transactionsCreate.mockResolvedValue({
      status: "SUCCESS",
      objectId: "txn_001",
      labelUrl: "https://label.pdf",
      trackingNumber: "1Z999AA10123456784",
      trackingUrlProvider: "https://tracking.url",
      messages: [],
    });

    const res = await POST(makeRequest(PAYMENT_EVENT, validSig(PAYMENT_EVENT)));

    expect(res.status).toBe(200);
    expect(mocks.transactionsCreate).toHaveBeenCalledWith({ rate: "rate_xyz", async: false });
    expect(mocks.findByIdAndUpdate).toHaveBeenCalledWith("oid", {
      "shippo.transactionId": "txn_001",
      "shippo.labelUrl": "https://label.pdf",
      "shippo.trackingNumber": "1Z999AA10123456784",
      "shippo.trackingUrlProvider": "https://tracking.url",
      status: "label_created",
    });
    expect(mocks.resendSend).toHaveBeenCalledTimes(2);
  });

  it("returns 200 even when Shippo returns an error (prevents Square retries)", async () => {
    mocks.findOne.mockResolvedValue({
      _id: "oid",
      orderNumber: "CC-004",
      status: "paid",
      shippo: { rateId: "rate_bad", carrier: "UPS" },
      customer: { firstName: "Jane", lastName: "Doe", email: "jane@test.com" },
    });
    mocks.transactionsCreate.mockResolvedValue({
      status: "ERROR",
      messages: [{ text: "Rate expired" }],
    });

    const res = await POST(makeRequest(PAYMENT_EVENT, validSig(PAYMENT_EVENT)));
    expect(res.status).toBe(200);
    expect(mocks.findByIdAndUpdate).not.toHaveBeenCalled();
    expect(mocks.resendSend).not.toHaveBeenCalled();
  });
});
