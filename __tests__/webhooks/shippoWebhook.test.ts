import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const orderFindOne = vi.fn();
const orderFindByIdAndUpdate = vi.fn();
vi.mock("@/lib/models/Order", () => ({
  default: {
    findOne: (...a: unknown[]) => orderFindOne(...a),
    findByIdAndUpdate: (...a: unknown[]) => orderFindByIdAndUpdate(...a),
  },
}));

vi.mock("@/lib/mongoose", () => ({ connectMongo: vi.fn() }));
vi.mock("@react-email/render", () => ({ render: vi.fn().mockResolvedValue("<html></html>") }));

const emailSend = vi.fn();
vi.mock("resend", () => ({
  Resend: class {
    emails = { send: (...a: unknown[]) => emailSend(...a) };
  },
}));

import { POST } from "@/app/api/webhooks/shippo/route";

const SECRET = "whsec_test";

function makeOrder(overrides: Record<string, unknown> = {}) {
  return {
    _id: "order_1",
    orderNumber: "CC-TEST-1",
    status: "label_created",
    shippedAt: undefined,
    deliveredAt: undefined,
    customer: { firstName: "Pat", lastName: "Buyer", email: "buyer@example.com" },
    shippo: { carrier: "USPS", trackingNumber: "TRK1", trackingUrlProvider: "https://track" },
    ...overrides,
  };
}

function req(opts: { token?: string; header?: string; body: unknown }): Request {
  const url = opts.token
    ? `http://localhost/api/webhooks/shippo?token=${opts.token}`
    : "http://localhost/api/webhooks/shippo";
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.header) headers["Shippo-Webhook-Secret"] = opts.header;
  return new Request(url, { method: "POST", headers, body: JSON.stringify(opts.body) });
}

const trackEvent = (status: string) => ({
  event: "track_updated",
  data: { tracking_number: "TRK1", carrier: "USPS", tracking_status: { status } },
});

beforeEach(() => {
  vi.clearAllMocks();
  vi.stubEnv("SHIPPO_WEBHOOK_SECRET", SECRET);
  vi.stubEnv("VERCEL_ENV", "production");
  vi.stubEnv("STUDIO_EMAIL", "studio@coastal.com");
  orderFindByIdAndUpdate.mockResolvedValue({});
  emailSend.mockResolvedValue({});
});

afterEach(() => vi.unstubAllEnvs());

describe("POST /api/webhooks/shippo — auth", () => {
  it("rejects an invalid token (401)", async () => {
    const res = await POST(req({ token: "wrong", body: trackEvent("TRANSIT") }));
    expect(res.status).toBe(401);
    expect(orderFindOne).not.toHaveBeenCalled();
  });

  it("accepts a valid token in the query string", async () => {
    orderFindOne.mockResolvedValue(makeOrder());
    const res = await POST(req({ token: SECRET, body: trackEvent("TRANSIT") }));
    expect(res.status).toBe(200);
  });

  it("accepts a valid token in the header", async () => {
    orderFindOne.mockResolvedValue(makeOrder());
    const res = await POST(req({ header: SECRET, body: trackEvent("TRANSIT") }));
    expect(res.status).toBe(200);
  });

  it("fails closed (401) when SHIPPO_WEBHOOK_SECRET is not configured", async () => {
    vi.stubEnv("SHIPPO_WEBHOOK_SECRET", "");
    const res = await POST(req({ token: "anything", body: trackEvent("TRANSIT") }));
    expect(res.status).toBe(401);
    expect(orderFindOne).not.toHaveBeenCalled();
  });
});

describe("POST /api/webhooks/shippo — payload handling", () => {
  it("acknowledges non-track_updated events without touching orders", async () => {
    const res = await POST(req({ token: SECRET, body: { event: "transaction_created", data: {} } }));
    expect(res.status).toBe(200);
    expect(orderFindOne).not.toHaveBeenCalled();
  });

  it("400s on a missing tracking number", async () => {
    const res = await POST(
      req({ token: SECRET, body: { event: "track_updated", data: { tracking_status: { status: "TRANSIT" } } } })
    );
    expect(res.status).toBe(400);
  });

  it("acknowledges (200) when no order matches the tracking number", async () => {
    orderFindOne.mockResolvedValue(null);
    const res = await POST(req({ token: SECRET, body: trackEvent("TRANSIT") }));
    expect(res.status).toBe(200);
    expect(orderFindByIdAndUpdate).not.toHaveBeenCalled();
  });
});

describe("POST /api/webhooks/shippo — status transitions + idempotency", () => {
  it("marks shipped and emails customer + admin on first TRANSIT", async () => {
    orderFindOne.mockResolvedValue(makeOrder());
    await POST(req({ token: SECRET, body: trackEvent("TRANSIT") }));
    expect(orderFindByIdAndUpdate).toHaveBeenCalledWith(
      "order_1",
      expect.objectContaining({ status: "shipped" })
    );
    expect(emailSend).toHaveBeenCalledTimes(2);
  });

  it("is a no-op on a duplicate TRANSIT (already shipped)", async () => {
    orderFindOne.mockResolvedValue(makeOrder({ status: "shipped", shippedAt: new Date() }));
    await POST(req({ token: SECRET, body: trackEvent("TRANSIT") }));
    expect(orderFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(emailSend).not.toHaveBeenCalled();
  });

  it("marks delivered and emails the customer on DELIVERED", async () => {
    orderFindOne.mockResolvedValue(makeOrder({ status: "shipped", shippedAt: new Date() }));
    await POST(req({ token: SECRET, body: trackEvent("DELIVERED") }));
    expect(orderFindByIdAndUpdate).toHaveBeenCalledWith(
      "order_1",
      expect.objectContaining({ status: "delivered" })
    );
    expect(emailSend).toHaveBeenCalledTimes(1);
  });

  it("backfills shippedAt when DELIVERED arrives without a prior TRANSIT", async () => {
    orderFindOne.mockResolvedValue(makeOrder({ status: "label_created", shippedAt: undefined }));
    await POST(req({ token: SECRET, body: trackEvent("DELIVERED") }));
    const update = orderFindByIdAndUpdate.mock.calls[0][1];
    expect(update.status).toBe("delivered");
    expect(update.shippedAt).toBeInstanceOf(Date);
    expect(update.deliveredAt).toBeInstanceOf(Date);
  });

  it("is a no-op on a duplicate DELIVERED", async () => {
    orderFindOne.mockResolvedValue(makeOrder({ status: "delivered", deliveredAt: new Date() }));
    await POST(req({ token: SECRET, body: trackEvent("DELIVERED") }));
    expect(orderFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(emailSend).not.toHaveBeenCalled();
  });

  it("alerts admin only and does NOT change status on FAILURE", async () => {
    orderFindOne.mockResolvedValue(makeOrder({ status: "shipped", shippedAt: new Date() }));
    await POST(req({ token: SECRET, body: trackEvent("FAILURE") }));
    expect(orderFindByIdAndUpdate).not.toHaveBeenCalled();
    expect(emailSend).toHaveBeenCalledTimes(1);
    expect(emailSend.mock.calls[0][0].to).toEqual(["studio@coastal.com"]);
  });
});

describe("POST /api/webhooks/shippo — email routing", () => {
  it("in production, emails the real customer + STUDIO_EMAIL", async () => {
    orderFindOne.mockResolvedValue(makeOrder());
    await POST(req({ token: SECRET, body: trackEvent("TRANSIT") }));
    const recipients = emailSend.mock.calls.map((c) => c[0].to[0]);
    expect(recipients).toContain("buyer@example.com");
    expect(recipients).toContain("studio@coastal.com");
  });

  it("in dev/stage, redirects all mail to DEV_EMAIL", async () => {
    vi.stubEnv("VERCEL_ENV", "preview");
    vi.stubEnv("DEV_EMAIL", "dev@coastal.com");
    orderFindOne.mockResolvedValue(makeOrder());
    await POST(req({ token: SECRET, body: trackEvent("TRANSIT") }));
    for (const call of emailSend.mock.calls) {
      expect(call[0].to).toEqual(["dev@coastal.com"]);
    }
  });
});
