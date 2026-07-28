/**
 * TEMPORARY dev seed script — replaced by the Phase B0 admin product-management UI.
 *
 * Flags every REGULAR (physical goods) Square catalog item as isOnlineSellable so the
 * /store page has products to display during development and acceptance testing.
 *
 * Usage (Node 20.6+):
 *   node --env-file .env.local --import tsx/esm scripts/seed-store-products.ts
 *
 * Or with older Node / tsx:
 *   env $(cat .env.local | xargs) npx tsx scripts/seed-store-products.ts
 *
 * Requires MONGODB_URI, SQUARE_ACCESS_TOKEN, and SQUARE_LOCATION_ID
 */

import "dotenv/config";
import mongoose from "mongoose";
import { listCatalogItems } from "../lib/square/catalog";
import { isSellablePhysicalGood } from "../lib/utils/catalogHelpers";
import { DEFAULT_PARCEL_PRESET } from "../lib/models/StoreProductSettings";

async function seed(): Promise<void> {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is not set");

  console.log("[SEED] Connecting to MongoDB…");
  await mongoose.connect(mongoUri);

  // Lazy-import the model after mongoose is connected so hot-reload guard works
  const { default: StoreProductSettings } = await import(
    "../lib/models/StoreProductSettings"
  );

  console.log("[SEED] Fetching all Square catalog items…");
  const allItems = await listCatalogItems();
  const physicalItems = allItems.filter(isSellablePhysicalGood);

  console.log(
    `[SEED] Found ${physicalItems.length} physical goods out of ${allItems.length} total catalog items`
  );

  let upserted = 0;
  for (const item of physicalItems) {
    await StoreProductSettings.findOneAndUpdate(
      { squareItemId: item.id },
      {
        $setOnInsert: {
          squareItemId: item.id,
          isOnlineSellable: true,
          parcelPreset: DEFAULT_PARCEL_PRESET,
        },
      },
      { upsert: true, new: true }
    );
    upserted++;
    console.log(`[SEED]   ✓ ${item.name} (${item.id})`);
  }

  console.log(`[SEED] Done — upserted ${upserted} StoreProductSettings documents`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("[SEED] Error:", err);
  process.exit(1);
});
