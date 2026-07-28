import type { Metadata } from "next";
import type { ReactElement } from "react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth/guards";
import LoginForm from "@/components/authentication/LoginForm";

export const metadata: Metadata = {
  title: "Sign In | Coastal Creations Studio",
  description:
    "Sign in to view your Coastal Creations Studio bookings and orders.",
};

export default async function LoginPage(): Promise<ReactElement> {
  // Already signed in? Send them where they belong.
  const user = await getSessionUser();
  if (user) redirect(user.isAdmin ? "/admin/dashboard" : "/account");

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-16">
      <LoginForm />
    </div>
  );
}
