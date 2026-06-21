# NextAuth v4 + MongoDB adapter: magic-link via Resend, DB-backed roles

Curated implementation notes for THIS repo (NextAuth **v4** — `next-auth` package, `getServerSession`, `@auth/mongodb-adapter`, `session.strategy = "database"`). Auth.js v5 (`authjs.dev`) docs differ in import paths; translate carefully.

## 1. EmailProvider (magic link) with a custom Resend sender — v4

NextAuth v4 ships `EmailProvider` from `next-auth/providers/email`. It defaults to **nodemailer/SMTP**, which we do NOT want. Override `sendVerificationRequest` to send through Resend (we already use `resend` + `RESEND_API_KEY`).

```ts
import EmailProvider from "next-auth/providers/email";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

EmailProvider({
  // `server` and `from` are required by the type but unused when we override sendVerificationRequest.
  server: { host: "unused", port: 587, auth: { user: "unused", pass: "unused" } },
  from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
  maxAge: 10 * 60, // token TTL in SECONDS. Default is 24h — we want ~10 min.
  async sendVerificationRequest({ identifier, url, provider }) {
    // identifier = the email; url = the magic link with token+callback already embedded.
    const html = await render(MagicLinkEmail({ url })); // reuse components/email-templates shell
    await resend.emails.send({
      from: provider.from,
      to: [identifier.toLowerCase()],
      subject: "Your sign-in link — Coastal Creations Studio",
      html,
    });
  },
});
```

### Gotchas
- **Adapter required.** EmailProvider needs a database adapter; tokens persist in the `verification_tokens` collection (already created by `@auth/mongodb-adapter`, currently unused). No schema work.
- **Do NOT hand-build the URL.** `url` already contains the token + callbackUrl. Just send it. (See nextauthjs/next-auth discussion #6982 — hand-rebuilding the URL breaks verification.)
- **Account is created on first verify**, not on request — fine for our "anyone can sign up" model.
- **maxAge is seconds.** Set ~600 for a 10-min link.
- **Rate-limit yourself.** NextAuth does not rate-limit magic-link requests. Add a small per-email + per-IP limiter in `sendVerificationRequest` (or the signin route) to prevent inbox bombing.
- In dev/stage we still send the link to the REAL address (the user needs their own link) — only *store* emails redirect to `DEV_EMAIL`.

## 2. DB-backed roles with the `database` session strategy

With `session.strategy = "database"` there is **no JWT** and the **`jwt` callback never runs**. The `session` callback signature is `{ session, user }` where `user` is the DB user doc. This repo already does:

```ts
async session({ session, user }) {
  session.user.id = user.id;
  session.user.isAdmin = user.isAdmin || false;
  return session;
}
```
Add `role`:
```ts
session.user.role = (user as { role?: "customer" | "admin" }).role ?? "customer";
session.user.isAdmin = session.user.role === "admin";
```
Extend `types/next-auth.d.ts` `Session.user` and `User` with `role`.

`signIn({ user })` flip (allow everyone; seed admin from ADMIN_EMAILS once):
```ts
async signIn({ user }) {
  const email = user.email?.toLowerCase();
  if (!email) return false;
  const db = (await clientPromise).db();
  const seedAdmins = (process.env.ADMIN_EMAILS ?? "").toLowerCase().split(",").map(s=>s.trim()).filter(Boolean);
  const existing = await db.collection("users").findOne({ email });
  const shouldBeAdmin = seedAdmins.includes(email) || existing?.role === "admin";
  await db.collection("users").updateOne(
    { email },
    { $set: { role: shouldBeAdmin ? "admin" : (existing?.role ?? "customer"), isAdmin: shouldBeAdmin } },
    { upsert: false } // adapter creates the user; we only annotate
  );
  return true; // <-- the key change: never return false for non-admins
}
```
> ADMIN_EMAILS is now a **seed only**. Ongoing grants/revokes are DB writes (ship a small script). Never gate live authz on the env list at request time.

## 3. Authorization enforcement — guards, NOT middleware

CRITICAL (confirmed by Auth.js RBAC guide + discussion #9609): **middleware-based RBAC requires the JWT strategy.** With the **database** strategy, Edge `middleware.ts` cannot read the session/role from MongoDB. Therefore:
- Authorization MUST live in **route handlers** (`getServerSession(authOptions)` → check `isAdmin`/`role`) and **server components** (`requireAdminPage()` redirect).
- `middleware.ts` may only do a **coarse cookie-presence redirect** for UX — it is NOT a security boundary. Do not switch the whole app to JWT just to use middleware; database sessions are otherwise fine and already in use.

## Sources
- NextAuth v4 Email provider: https://next-auth.js.org/providers/email
- Auth.js Resend guide: https://authjs.dev/guides/configuring-resend and https://authjs.dev/getting-started/providers/resend
- Auth.js RBAC guide: https://authjs.dev/guides/role-based-access-control
- Middleware RBAC needs JWT (discussion): https://github.com/nextauthjs/next-auth/discussions/9609
- Custom sendVerificationRequest url gotcha: https://github.com/nextauthjs/next-auth/discussions/6982
