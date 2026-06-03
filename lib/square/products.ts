/**
 * Square Product Service
 * Handles Square Catalog (items) + Inventory read operations for the storefront
 */
import { Client, Environment } from "square/legacy";

// Initialize Square client
const squareClient = new Client({
  accessToken: process.env.SQUARE_ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

const catalogApi = squareClient.catalogApi;
const inventoryApi = squareClient.inventoryApi;

// Types
export interface ProductVariation {
  id: string;
  name: string;
  sku: string | null;
  priceCents: number;
  currency: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  imageIds: string[];
  ecomAvailable: boolean;
  ecomVisibility: string;
  variations: ProductVariation[];
}

// Minimal shape of the Square legacy catalog objects we read from
interface RawVariation {
  id?: string | null;
  itemVariationData?: {
    name?: string | null;
    sku?: string | null;
    priceMoney?: { amount?: bigint | null; currency?: string | null } | null;
  } | null;
}

interface RawItem {
  id?: string | null;
  itemData?: {
    name?: string | null;
    description?: string | null;
    imageIds?: (string | null)[] | null;
    ecomAvailable?: boolean | null;
    ecomVisibility?: string | null;
    variations?: RawVariation[] | null;
  } | null;
}

export class ProductService {
  private locationId: string;

  constructor() {
    this.locationId =
      process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ||
      process.env.SQUARE_LOCATION_ID ||
      "";
  }

  /**
   * List all catalog items with their variations and current stock counts
   */
  async listProducts(): Promise<{ products: Product[] }> {
    console.log("[PRODUCTS-listProducts] Fetching catalog items");

    const items = await this.fetchAllItems();
    const variationIds = items.flatMap((item) =>
      (item.itemData?.variations || []).map((v) => v.id).filter(Boolean)
    ) as string[];

    const quantities = await this.fetchInventory(variationIds);

    const products = items.map((item) => this.mapItem(item, quantities));

    console.log("[PRODUCTS-listProducts] Returning", products.length, "products");
    return { products };
  }

  /**
   * Page through all ITEM objects in the catalog
   */
  private async fetchAllItems(): Promise<RawItem[]> {
    const items: RawItem[] = [];
    let cursor: string | undefined;

    do {
      const response = await catalogApi.searchCatalogObjects({
        objectTypes: ["ITEM"],
        cursor,
      });
      items.push(...((response.result.objects || []) as RawItem[]));
      cursor = response.result.cursor;
    } while (cursor);

    return items;
  }

  /**
   * Retrieve current stock counts keyed by variation id
   */
  private async fetchInventory(
    variationIds: string[]
  ): Promise<Map<string, number>> {
    const quantities = new Map<string, number>();
    if (variationIds.length === 0) return quantities;

    const response = await inventoryApi.batchRetrieveInventoryCounts({
      catalogObjectIds: variationIds,
      locationIds: this.locationId ? [this.locationId] : undefined,
    });

    for (const count of response.result.counts || []) {
      if (count.state === "IN_STOCK" && count.catalogObjectId) {
        quantities.set(count.catalogObjectId, Number(count.quantity || 0));
      }
    }

    return quantities;
  }

  /**
   * Map a raw Square item into the storefront Product shape
   */
  private mapItem(item: RawItem, quantities: Map<string, number>): Product {
    const data = item.itemData;
    const variations: ProductVariation[] = (data?.variations || []).map((v) => {
      const vData = v.itemVariationData;
      return {
        id: v.id || "",
        name: vData?.name || "",
        sku: vData?.sku || null,
        priceCents: Number(vData?.priceMoney?.amount || 0),
        currency: vData?.priceMoney?.currency || "USD",
        quantity: quantities.get(v.id || "") ?? 0,
      };
    });

    return {
      id: item.id || "",
      name: data?.name || "",
      description: data?.description || "",
      imageIds: (data?.imageIds || []).filter(Boolean) as string[],
      ecomAvailable: data?.ecomAvailable ?? false,
      ecomVisibility: data?.ecomVisibility || "",
      variations,
    };
  }
}

// Export singleton instance
export const productService = new ProductService();
