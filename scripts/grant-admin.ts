/**
 * Grant (or revoke) admin on a user — the DB-backed replacement for editing ADMIN_EMAILS.
 *
 * Usage:
 *   node --env-file=.env -r ts-node/register scripts/grant-admin.ts <email> [--revoke]
 *   (or) pnpm tsx scripts/grant-admin.ts <email> [--revoke]
 *
 * The user must have signed in at least once (so the account row exists) before being granted.
 */
import { MongoClient } from "mongodb";

async function main(): Promise<void> {
  const email = process.argv[2];
  const revoke = process.argv[3] === "--revoke";

  if (!email) {
    console.error("Usage: grant-admin <email> [--revoke]");
    process.exit(1);
  }
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error(
      "[grant-admin] MONGODB_URI not set. Run with: node --env-file=.env scripts/grant-admin.ts <email>"
    );
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    const role = revoke ? "customer" : "admin";
    // Case-insensitive exact match (stored emails may differ in case).
    const escaped = email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const result = await client
      .db()
      .collection("users")
      .updateOne(
        { email: { $regex: `^${escaped}$`, $options: "i" } },
        { $set: { role, isAdmin: !revoke } }
      );

    console.log(
      `[grant-admin] ${email} -> ${role} (matched ${result.matchedCount}, modified ${result.modifiedCount})`
    );
    if (result.matchedCount === 0) {
      console.warn(
        "[grant-admin] No user with that email yet — they must sign in once before being granted."
      );
    }
  } finally {
    await client.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
