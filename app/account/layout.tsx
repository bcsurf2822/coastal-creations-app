import type { ReactElement, ReactNode } from "react";
import { requireUserPage } from "@/lib/auth/guards";
import AccountNav from "@/components/account/AccountNav";
import { Separator } from "@/components/ui/shadcn/separator";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/shadcn/avatar";

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

export default async function AccountLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactElement> {
  const user = await requireUserPage();

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <header className="flex items-center gap-4">
        <Avatar className="size-12">
          {user.image ? (
            <AvatarImage src={user.image} alt={user.name ?? user.email} />
          ) : null}
          <AvatarFallback>{initialsFrom(user.name, user.email)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          {user.name ? (
            <h1 className="truncate text-xl font-semibold">{user.name}</h1>
          ) : (
            <h1 className="truncate text-xl font-semibold">My Account</h1>
          )}
          <p className="truncate text-sm text-muted-foreground">{user.email}</p>
        </div>
      </header>

      <div className="mt-6">
        <AccountNav />
      </div>

      <Separator className="my-6" />

      <main>{children}</main>
    </div>
  );
}
