/**
 * Square Catalog read service.
 * Provides BigInt-free DTOs (priceMoney.amount is converted via Number() here,
 * before any value crosses a JSON/React boundary).
 */
import { Client, Environment, ApiError } from "square/legacy";
import { moneyAmountToCents } from "@/lib/utils/moneyHelpers";

const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

const { catalogApi, inventoryApi } = squareClient;

const LOCATION_ID =
  process.env.SQUARE_LOCATION_ID ||
  process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ||
  "";

// Internal DTO types — BigInt-free, safe to serialize
export interface RawVariation {
  id: string;
  name: string;
  sku: string | null;
  ordinal: number;
  priceCents: number | null; // null = VARIABLE_PRICING
  variablePricing: boolean;
  trackInventory: boolean;
}

export interface RawCatalogItem {
  id: string;
  name: string;
  descriptionHtml?: string;
  isArchived: boolean;
  productType: string;
  categoryNames: string[];
  imageUrls: string[];
  variations: RawVariation[];
}

function variationPriceCents(
  vd: {
    priceMoney?: { amount?: bigint | null; currency?: string | null } | null;
    locationOverrides?: Array<{
      locationId?: string | null;
      priceMoney?: { amount?: bigint | null } | null;
    }> | null;
    pricingType?: string | null;
  } | null | undefined
): number | null {
  if (!vd) return null;
  const override = vd.locationOverrides?.find(
    (lo) => lo.locationId === LOCATION_ID
  )?.priceMoney;
  const raw = (override ?? vd.priceMoney)?.amount;
  return raw != null ? moneyAmountToCents(raw) : null;
}

function mapRelatedObjects(relatedObjects: unknown[]): {
  imageById: Map<string, string>;
  categoryById: Map<string, string>;
} {
  const imageById = new Map<string, string>();
  const categoryById = new Map<string, string>();

  for (const obj of relatedObjects) {
    const o = obj as {
      type?: string;
      id?: string;
      imageData?: { url?: string | null } | null;
      categoryData?: { name?: string | null } | null;
    };
    if (o.type === "IMAGE" && o.id && o.imageData?.url) {
      imageById.set(o.id, o.imageData.url);
    }
    if (o.type === "CATEGORY" && o.id && o.categoryData?.name) {
      categoryById.set(o.id, o.categoryData.name);
    }
  }

  return { imageById, categoryById };
}

function mapRawItem(
  obj: unknown,
  imageById: Map<string, string>,
  categoryById: Map<string, string>
): RawCatalogItem | null {
  const item = obj as {
    type?: string;
    id?: string | null;
    isDeleted?: boolean | null;
    itemData?: {
      name?: string | null;
      descriptionHtml?: string | null;
      isArchived?: boolean | null;
      productType?: string | null;
      categoryId?: string | null;
      imageIds?: (string | null)[] | null;
      variations?: unknown[] | null;
    } | null;
  };

  if (item.type !== "ITEM" || !item.id || item.isDeleted) return null;
  const d = item.itemData;
  if (!d) return null;

  const variations: RawVariation[] = (d.variations ?? []).map((v) => {
    const vObj = v as {
      id?: string | null;
      itemVariationData?: {
        name?: string | null;
        sku?: string | null;
        ordinal?: number | null;
        pricingType?: string | null;
        priceMoney?: { amount?: bigint | null } | null;
        locationOverrides?: Array<{
          locationId?: string | null;
          priceMoney?: { amount?: bigint | null } | null;
        }> | null;
        trackInventory?: boolean | null;
      } | null;
    };
    const vd = vObj.itemVariationData;
    const variablePricing = vd?.pricingType === "VARIABLE_PRICING";
    return {
      id: vObj.id ?? "",
      name: vd?.name ?? "",
      sku: vd?.sku ?? null,
      ordinal: vd?.ordinal ?? 0,
      priceCents: variablePricing ? null : variationPriceCents(vd),
      variablePricing,
      trackInventory: vd?.trackInventory ?? false,
    };
  });

  const imageUrls = (d.imageIds ?? [])
    .filter(Boolean)
    .map((id) => imageById.get(id as string))
    .filter(Boolean) as string[];

  const categoryNames: string[] = [];
  if (d.categoryId) {
    const name = categoryById.get(d.categoryId);
    if (name) categoryNames.push(name);
  }

  return {
    id: item.id,
    name: d.name ?? "",
    descriptionHtml: d.descriptionHtml ?? undefined,
    isArchived: d.isArchived ?? false,
    productType: d.productType ?? "REGULAR",
    categoryNames,
    imageUrls,
    variations,
  };
}

/**
 * List catalog items.
 * If squareItemIds is provided, fetches only those items (batch).
 * Otherwise pages through the entire catalog.
 */
export async function listCatalogItems(
  squareItemIds?: string[]
): Promise<RawCatalogItem[]> {
  console.log(
    "[CATALOG-listCatalogItems] Fetching items",
    squareItemIds ? `(${squareItemIds.length} ids)` : "(all)"
  );

  try {
    let rawObjects: unknown[] = [];
    let relatedObjects: unknown[] = [];

    if (squareItemIds && squareItemIds.length > 0) {
      const response = await catalogApi.batchRetrieveCatalogObjects({
        objectIds: squareItemIds,
        includeRelatedObjects: true,
      });
      rawObjects = (response.result.objects ?? []) as unknown[];
      relatedObjects = (response.result.relatedObjects ?? []) as unknown[];
    } else {
      let cursor: string | undefined;
      do {
        const response = await catalogApi.searchCatalogObjects({
          objectTypes: ["ITEM"],
          includeRelatedObjects: true,
          includeDeletedObjects: false,
          limit: 200,
          cursor,
        });
        rawObjects.push(...((response.result.objects ?? []) as unknown[]));
        relatedObjects.push(
          ...((response.result.relatedObjects ?? []) as unknown[])
        );
        cursor = response.result.cursor ?? undefined;
      } while (cursor);
    }

    const { imageById, categoryById } = mapRelatedObjects(relatedObjects);
    const items = rawObjects
      .map((obj) => mapRawItem(obj, imageById, categoryById))
      .filter((item): item is RawCatalogItem => item !== null);

    console.log("[CATALOG-listCatalogItems] Returning", items.length, "items");
    return items;
  } catch (e) {
    if (e instanceof ApiError) {
      throw new Error(
        e.result?.errors?.[0]?.detail ?? "Square catalog error"
      );
    }
    throw e;
  }
}

/**
 * Retrieve a single catalog item by Square item id.
 * Returns null if not found or not an ITEM type.
 */
export async function retrieveCatalogItem(
  squareItemId: string
): Promise<RawCatalogItem | null> {
  console.log("[CATALOG-retrieveCatalogItem] Fetching item", squareItemId);

  try {
    const response = await catalogApi.retrieveCatalogObject(squareItemId, true);
    const obj = response.result.object;
    const related = (response.result.relatedObjects ?? []) as unknown[];

    if (!obj) return null;

    const { imageById, categoryById } = mapRelatedObjects(related);
    return mapRawItem(obj as unknown, imageById, categoryById);
  } catch (e) {
    if (e instanceof ApiError) {
      const status = e.statusCode;
      if (status === 404) return null;
      throw new Error(
        e.result?.errors?.[0]?.detail ?? "Square catalog error"
      );
    }
    throw e;
  }
}

/**
 * Fetch current IN_STOCK counts for a list of variation ids.
 * Returns a Map from variationId → quantity.
 * Variations not in the map have no inventory record (treat as available when trackInventory=false).
 */
export async function getInventoryCounts(
  variationIds: string[]
): Promise<Map<string, number>> {
  const quantities = new Map<string, number>();
  if (variationIds.length === 0) return quantities;

  console.log(
    "[CATALOG-getInventoryCounts] Fetching counts for",
    variationIds.length,
    "variations"
  );

  try {
    const response = await inventoryApi.batchRetrieveInventoryCounts({
      catalogObjectIds: variationIds,
      locationIds: LOCATION_ID ? [LOCATION_ID] : undefined,
      states: ["IN_STOCK"],
    });

    for (const count of response.result.counts ?? []) {
      if (count.catalogObjectId && count.quantity != null) {
        quantities.set(count.catalogObjectId, Number(count.quantity));
      }
    }

    return quantities;
  } catch (e) {
    if (e instanceof ApiError) {
      throw new Error(
        e.result?.errors?.[0]?.detail ?? "Square inventory error"
      );
    }
    throw e;
  }
}
