import type { ReactElement } from "react";
import Image from "next/image";
import { requireUserPage } from "@/lib/auth/guards";

function initialsFrom(name?: string | null, email?: string): string {
  if (name) {
    const parts = name.trim().split(/\s+/);
    const first = parts[0]?.[0] ?? "";
    const last = parts.length > 1 ? parts[parts.length - 1][0] : "";
    const combined = `${first}${last}`.toUpperCase();
    if (combined) return combined;
  }
  return (email?.[0] ?? "?").toUpperCase();
}

export default async function ProfilePage(): Promise<ReactElement> {
  const user = await requireUserPage();

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Profile</h1>
      <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200">
          <h2 className="text-base font-semibold text-gray-800">
            Account details
          </h2>
        </div>
        <div className="space-y-4 px-5 py-5">
          <div className="flex items-center gap-4">
            {user.image ? (
              <Image
                src={user.image}
                alt={user.name ?? user.email}
                width={64}
                height={64}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-700 text-lg font-semibold">
                {initialsFrom(user.name, user.email)}
              </span>
            )}
            <div className="min-w-0">
              {user.name ? (
                <p className="truncate text-lg font-medium text-gray-800">
                  {user.name}
                </p>
              ) : null}
              <p className="truncate text-sm text-gray-500">{user.email}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Signed in with Google or a magic link.
          </p>
        </div>
      </div>
    </div>
  );
}
