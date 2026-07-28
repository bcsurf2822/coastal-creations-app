import type { ReactElement, ReactNode } from "react";
import { requireUserPage } from "@/lib/auth/guards";
import AccountNav from "@/components/account/AccountNav";

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const user = await requireUserPage();

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">My Account</h1>
        <p className="mt-1 text-gray-600">
          Manage your orders, bookings, and profile.
        </p>
      </div>

      <div className="flex flex-col gap-6 md:flex-row">
        <aside className="md:sticky md:top-6 md:w-64 md:shrink-0 md:self-start">
          <AccountNav
            name={user.name}
            email={user.email}
            image={user.image}
          />
        </aside>
        <main className="min-w-0 flex-1">{children}</main>
      </div>
    </div>
  );
}
