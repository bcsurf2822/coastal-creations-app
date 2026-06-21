import type { ReactElement } from "react";
import { requireUserPage } from "@/lib/auth/guards";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/shadcn/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";

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
      <h1 className="text-lg font-semibold">Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="size-16">
              {user.image ? (
                <AvatarImage src={user.image} alt={user.name ?? user.email} />
              ) : null}
              <AvatarFallback>
                {initialsFrom(user.name, user.email)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              {user.name ? (
                <p className="truncate text-lg font-medium">{user.name}</p>
              ) : null}
              <p className="truncate text-sm text-muted-foreground">
                {user.email}
              </p>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Signed in with Google or a magic link.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
