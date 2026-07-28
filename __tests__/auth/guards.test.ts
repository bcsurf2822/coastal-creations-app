import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock NextAuth's session reader and the heavy @/auth module (Resend/Mongo side effects).
const { getServerSessionMock } = vi.hoisted(() => ({
  getServerSessionMock: vi.fn(),
}));
vi.mock("next-auth", () => ({ getServerSession: getServerSessionMock }));
vi.mock("@/auth", () => ({ authOptions: {} }));

import { requireAdmin, requireUser, getSessionUser } from "@/lib/auth/guards";

const CUSTOMER = {
  user: { id: "u1", email: "cust@example.com", isAdmin: false, role: "customer" },
};
const ADMIN = {
  user: { id: "a1", email: "admin@example.com", isAdmin: true, role: "admin" },
};

describe("getSessionUser", () => {
  beforeEach(() => getServerSessionMock.mockReset());

  it("returns null when unauthenticated", async () => {
    getServerSessionMock.mockResolvedValue(null);
    expect(await getSessionUser()).toBeNull();
  });

  it("lowercases email and defaults role to customer", async () => {
    getServerSessionMock.mockResolvedValue({
      user: { id: "x", email: "MiXeD@Example.com" },
    });
    expect(await getSessionUser()).toMatchObject({
      id: "x",
      email: "mixed@example.com",
      isAdmin: false,
      role: "customer",
    });
  });
});

describe("requireAdmin", () => {
  beforeEach(() => getServerSessionMock.mockReset());

  it("returns 401 when unauthenticated", async () => {
    getServerSessionMock.mockResolvedValue(null);
    const r = await requireAdmin();
    expect((r as Response).status).toBe(401);
  });

  it("returns 403 for a signed-in customer", async () => {
    getServerSessionMock.mockResolvedValue(CUSTOMER);
    const r = await requireAdmin();
    expect((r as Response).status).toBe(403);
  });

  it("passes through for an admin", async () => {
    getServerSessionMock.mockResolvedValue(ADMIN);
    const r = await requireAdmin();
    expect(r).toMatchObject({ isAdmin: true, role: "admin" });
  });
});

describe("requireUser", () => {
  beforeEach(() => getServerSessionMock.mockReset());

  it("returns 401 when unauthenticated", async () => {
    getServerSessionMock.mockResolvedValue(null);
    expect(((await requireUser()) as Response).status).toBe(401);
  });

  it("passes for any authenticated user (including a customer)", async () => {
    getServerSessionMock.mockResolvedValue(CUSTOMER);
    expect(await requireUser()).toMatchObject({ role: "customer" });
  });
});
