import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

/**
 * Deterministic access-matrix / regression gate.
 *
 * Rather than booting every admin route (each pulls in heavy Mongo/Square/Resend deps at
 * import time), we assert the security PROPERTIES at the source level:
 *  - every admin route delegates to requireAdmin (which guards.test.ts proves rejects
 *    customers with 403 and unauthenticated with 401),
 *  - no admin route still carries the NODE_ENV dev-bypass,
 *  - the admin dashboard shell enforces requireAdminPage.
 * If someone adds a new admin route without the guard, add it here and this test fails.
 */

const root = process.cwd();
const read = (p: string): string => readFileSync(join(root, p), "utf8");

const ADMIN_ROUTES = [
  "app/api/admin/store/orders/route.ts",
  "app/api/admin/store/orders/[id]/route.ts",
  "app/api/admin/store/products/route.ts",
  "app/api/admin/store/products/[id]/route.ts",
  "app/api/store/shipping-label/route.ts",
  "app/api/gift-cards/list/route.ts",
  "app/api/gift-cards/[id]/activities/route.ts",
  "app/api/event/[id]/route.ts",
  "app/api/reservations/[id]/route.ts",
  "app/api/square/customers/route.ts",
  "app/api/square/customers/[id]/route.ts",
  "app/api/square/customers/migrate/route.ts",
  "app/api/send/route.ts",
];

describe("admin route hardening", () => {
  it.each(ADMIN_ROUTES)("%s enforces requireAdmin", (file) => {
    expect(read(file)).toContain("requireAdmin");
  });

  it.each(ADMIN_ROUTES)("%s has no NODE_ENV auth bypass", (file) => {
    expect(read(file)).not.toMatch(/NODE_ENV !== "development"/);
  });

  it("admin dashboard shell enforces requireAdminPage", () => {
    const layout = read("app/admin/dashboard/layout.tsx");
    expect(layout).toContain("requireAdminPage");
    expect(layout).not.toMatch(/NODE_ENV !== "development"/);
  });
});
