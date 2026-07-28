"use client";

import { useState, type ReactElement, type FormEvent } from "react";
import { signIn } from "next-auth/react";
import { FcGoogle } from "react-icons/fc";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/shadcn/card";
import { Button } from "@/components/ui/shadcn/button";
import { Input } from "@/components/ui/shadcn/input";
import { isValidEmail } from "@/lib/utils/validation";

/**
 * Customer sign-in: Google OAuth + passwordless magic link (Resend).
 * No passwords. On success NextAuth redirects to /account.
 */
export default function LoginForm(): ReactElement {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMagicLink = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();
    if (!email) return;
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await signIn("email", {
        email,
        callbackUrl: "/account",
        redirect: false,
      });
      if (res?.error) {
        setError("Could not send the link. Please try again in a moment.");
      } else {
        setSent(true);
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Sign in</CardTitle>
        <CardDescription>
          Access your bookings and orders. No password needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {sent ? (
          <div className="rounded-md bg-muted p-4 text-center text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Check your email</p>
            <p className="mt-1">
              We sent a sign-in link to <strong>{email}</strong>. It expires in
              10 minutes.
            </p>
          </div>
        ) : (
          <>
            <Button
              type="button"
              variant="outline"
              className="w-full gap-2"
              onClick={() => signIn("google", { callbackUrl: "/account" })}
            >
              <FcGoogle className="h-5 w-5" />
              Continue with Google
            </Button>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="h-px flex-1 bg-border" />
              or
              <span className="h-px flex-1 bg-border" />
            </div>

            <form onSubmit={handleMagicLink} className="flex flex-col gap-3">
              <Input
                type="email"
                required
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                aria-label="Email address"
              />
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Email me a sign-in link"}
              </Button>
            </form>

            {error && <p className="text-sm text-destructive">{error}</p>}
          </>
        )}
      </CardContent>
    </Card>
  );
}
