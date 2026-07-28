import type { Metadata } from "next";
import type { ReactElement } from "react";
import ProductDetail from "@/components/store/ProductDetail";
import ShopComingSoon from "@/components/store/ShopComingSoon";
import { isShopEnabled } from "@/lib/constants/featureFlags";
import { extractSquareItemIdFromSlug } from "@/lib/utils/slugify";
import { retrieveCatalogItem } from "@/lib/square/catalog";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if (!isShopEnabled()) {
    return { title: "Shop | Coastal Creations Studio" };
  }
  const { slug } = await params;
  const squareItemId = extractSquareItemIdFromSlug(slug);

  try {
    const item = await retrieveCatalogItem(squareItemId);
    if (item) {
      return {
        title: `${item.name} | Shop | Coastal Creations Studio`,
        description: item.descriptionHtml
          ? item.descriptionHtml.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
          : `${item.name} — available in the Coastal Creations Studio shop.`,
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
