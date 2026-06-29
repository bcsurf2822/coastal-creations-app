import { describe, it, expect, vi, beforeEach } from "vitest";

// Capture the filters passed to the models so we can prove every account query is scoped
// to the caller's email (and never anything else).
const { findMock, findOneMock, customerFindMock } = vi.hoisted(() => ({
  findMock: vi.fn(),
  findOneMock: vi.fn(),
  customerFindMock: vi.fn(),
}));

vi.mock("@/lib/mongoose", () => ({ connectMongo: vi.fn() }));
vi.mock("@/lib/models/Order", () => ({
  default: { find: findMock, findOne: findOneMock },
}));
vi.mock("@/lib/models/Customer", () => ({
  default: { find: customerFindMock },
}));

import {
  getMyOrders,
  getMyOrderByNumber,
  getMyBookings,
  getLatestOrderForPrefill,
} from "@/lib/account/queries";

// .sort() may be followed by .lean() (orders) or .populate().lean() (bookings).
const sortable = (result: unknown) => ({
  sort: () => ({
    lean: () => Promise.resolve(result),
    populate: () => ({ lean: () => Promise.resolve(result) }),
  }),
});
const leanable = (result: unknown) => ({ lean: () => Promise.resolve(result) });

describe("account queries are scoped to the session email", () => {
  beforeEach(() => {
    findMock.mockReset();
    findOneMock.mockReset();
    customerFindMock.mockReset();
  });

  it("getMyOrders filters orders by the lowercased, case-insensitive email", async () => {
    findMock.mockReturnValue(sortable([]));
    await getMyOrders("USER@Example.com");
    const filter = findMock.mock.calls[0][0];
    expect(filter["customer.email"].$options).toBe("i");
    expect(filter["customer.email"].$regex).toBe("^user@example\\.com$");
  });

  it("getMyBookings filters bookings by the user's email only", async () => {
    customerFindMock.mockReturnValue(sortable([]));
    await getMyBookings("Person@Mail.com");
    const filter = customerFindMock.mock.calls[0][0];
    expect(filter["billingInfo.emailAddress"].$options).toBe("i");
    expect(filter["billingInfo.emailAddress"].$regex).toBe("^person@mail\\.com$");
  });

  it("getMyOrderByNumber requires BOTH the order number AND the user's email", async () => {
    findOneMock.mockReturnValue(leanable(null));
    await getMyOrderByNumber("owner@x.com", "CC-ABC-123");
    const filter = findOneMock.mock.calls[0][0];
    expect(filter.orderNumber).toBe("CC-ABC-123");
    expect(filter["customer.email"].$regex).toBe("^owner@x\\.com$");
  });

  it("getMyOrderByNumber returns null for an order that is not the user's", async () => {
    findOneMock.mockReturnValue(leanable(null)); // DB finds nothing for this email+number
    const result = await getMyOrderByNumber("notmine@x.com", "CC-SOMEONE-ELSE");
    expect(result).toBeNull();
  });

  it("getMyOrders matches the stamped userId OR the email when a userId is given", async () => {
    findMock.mockReturnValue(sortable([]));
    await getMyOrders("USER@Example.com", "u123");
    const filter = findMock.mock.calls[0][0];
    // Owns the order via either the durable userId stamp or a legacy/guest email match.
    expect(filter.$or).toHaveLength(2);
    expect(filter.$or[0]).toEqual({ userId: "u123" });
    expect(filter.$or[1]["customer.email"].$regex).toBe("^user@example\\.com$");
  });

  it("getMyOrderByNumber scopes by orderNumber AND (userId OR email)", async () => {
    findOneMock.mockReturnValue(leanable(null));
    await getMyOrderByNumber("owner@x.com", "CC-ABC-123", "u9");
    const filter = findOneMock.mock.calls[0][0];
    expect(filter.orderNumber).toBe("CC-ABC-123");
    expect(filter.$or[0]).toEqual({ userId: "u9" });
    expect(filter.$or[1]["customer.email"].$regex).toBe("^owner@x\\.com$");
  });

  it("getLatestOrderForPrefill matches userId OR email, scoped to the caller", async () => {
    findOneMock.mockReturnValue(sortable(null));
    await getLatestOrderForPrefill("p@x.com", "u1");
    const filter = findOneMock.mock.calls[0][0];
    expect(filter.$or[0]).toEqual({ userId: "u1" });
    expect(filter.$or[1]["customer.email"].$regex).toBe("^p@x\\.com$");
  });
});
