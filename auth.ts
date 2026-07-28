import NextAuth, { type AuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import EmailProvider from "next-auth/providers/email";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import clientPromise from "@/lib/mongodb";
import { MagicLinkEmail } from "@/components/email-templates/MagicLinkEmail";
import { parseAdminSeed, resolveRole } from "@/lib/auth/roles";

if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
  throw new Error("Missing Google OAuth credentials");
}

const resend = new Resend(process.env.RESEND_API_KEY);
const MAGIC_FROM =
  "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>";

// DB-backed magic-link throttle — works across serverless instances (shared Mongo),
// unlike an in-memory limiter. Returns false when the email is over the limit.
async function withinMagicLinkRateLimit(email: string): Promise<boolean> {
  const db = (await clientPromise).db();
  const col = db.collection("magic_link_throttle");
  // Idempotent; TTL auto-cleans old throttle records.
  await col.createIndex({ at: 1 }, { expireAfterSeconds: 3600 });
  const since = new Date(Date.now() - 60_000); // 1-minute window
  const recent = await col.countDocuments({ email, at: { $gte: since } });
  if (recent >= 3) return false;
  await col.insertOne({ email, at: new Date() });
  return true;
}

export const authOptions: AuthOptions = {
  adapter: MongoDBAdapter(clientPromise),

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    EmailProvider({
      // `server`/`from` are required by the type but unused — we fully override sendVerificationRequest
      // to send via Resend instead of SMTP.
      server: { host: "localhost", port: 587, auth: { user: "unused", pass: "unused" } },
      from: MAGIC_FROM,
      maxAge: 10 * 60, // SECONDS — 10-minute single-use link (NextAuth default is 24h)
      async sendVerificationRequest({ identifier, url }) {
        const email = identifier.toLowerCase();
        if (!(await withinMagicLinkRateLimit(email))) {
          throw new Error(
            "Too many sign-in requests. Please wait a minute and try again."
          );
        }
        const html = await render(React.createElement(MagicLinkEmail, { url }));
        await resend.emails.send({
          from: MAGIC_FROM,
          to: [email],
          subject: "Your sign-in link — Coastal Creations Studio",
          html,
        });
        console.log("[AUTH-sendVerificationRequest] magic link sent");
      },
    }),
  ],

  session: {
    strategy: "database",
  },

  events: {
    // Stamp the initial role when the adapter first creates a user. Reliable for brand-new
    // accounts (the signIn callback runs BEFORE the user row exists).
    async createUser({ user }) {
      if (!user.email) return;
      const role = resolveRole(user.email, parseAdminSeed(process.env.ADMIN_EMAILS));
      const db = (await clientPromise).db();
      await db
        .collection("users")
        .updateOne(
          { email: user.email },
          { $set: { role, isAdmin: role === "admin" } }
        );
    },
  },

  callbacks: {
    // Allow ANY successful sign-in (customers + admins). Promote existing users that were
    // added to the admin seed. Never returns false for non-admins.
    async signIn({ user }) {
      const email = user.email?.toLowerCase();
      if (!email) return false;
      if (parseAdminSeed(process.env.ADMIN_EMAILS).includes(email)) {
        const db = (await clientPromise).db();
        await db
          .collection("users")
          .updateOne(
            { email: user.email },
            { $set: { role: "admin", isAdmin: true } },
            { upsert: false }
          );
      }
      return true;
    },

    async session({ session, user }) {
      if (session.user) {
        session.user.id = user.id;
        const dbRole = (user as { role?: "customer" | "admin" }).role;
        // Fallback so a seeded admin is never locked out before the role write is observed.
        const role = resolveRole(
          session.user.email,
          parseAdminSeed(process.env.ADMIN_EMAILS),
          dbRole
        );
        session.user.role = role;
        session.user.isAdmin = role === "admin";
      }
      return session;
    },
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
