import type { Metadata } from "next";
import type { ReactElement } from "react";
import ProductDetail from "@/components/store/ProductDetail";
import ShopComingSoon from "@/components/store/ShopComingSoon";
import { isShopEnabled } from "@/lib/constants/featureFlags";
import { extractSquareItemIdFromSlug } from "@/lib/utils/slugify";
import { retrieveCatalogItem } from "@/lib/square/catalog";

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ variation?: string }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: Props): Promise<Metadata> {
  if (!isShopEnabled()) {
    return { title: "Shop | Coastal Creations Studio" };
  }
  const { slug } = await params;
  const { variation: variationId } = await searchParams;
  const squareItemId = extractSquareItemIdFromSlug(slug);

  try {
    const item = await retrieveCatalogItem(squareItemId);
    if (item) {
      // The grid always links here with ?variation=<id> for multi-variation
      // items — use that flavor's own name so e.g. "Mini Beach Art Kit"
      // doesn't show a browser tab / search-result title of the generic
      // "Mini Travel Art Kits" item name it belongs to. Guarded to items
      // with more than one variation: a single-SKU item's lone variation is
      // often Square's generic internal placeholder name ("Regular"), which
      // must never replace the item's real, customer-facing name.
      const variationName =
        variationId && item.variations.length > 1
          ? item.variations.find((v) => v.id === variationId)?.name
          : undefined;
      const displayName = variationName ?? item.name;
      return {
        title: `${displayName} | Shop | Coastal Creations Studio`,
        description: item.descriptionHtml
          ? item.descriptionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
          : `${displayName} — available in the Coastal Creations Studio shop.`,
      };
    }
  } catch {
    // Fall through to default
  }

  return { title: "Product | Shop | Coastal Creations Studio" };
}

export default async function StoreProductPage({
  params,
}: Props): Promise<ReactElement> {
  if (!isShopEnabled()) {
    return <ShopComingSoon />;
  }
  const { slug } = await params;
  const squareItemId = extractSquareItemIdFromSlug(slug);

  return <ProductDetail squareItemId={squareItemId} />;
}
