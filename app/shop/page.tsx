import type { ReactElement } from "react";
import PageHeader from "@/components/classes/PageHeader";
import Store from "@/components/store/Store";
import StoreCartButton from "@/components/store/StoreCartButton";
import ShopGiftCardCTA from "@/components/store/ShopGiftCardCTA";
import ShopComingSoon from "@/components/store/ShopComingSoon";
import { isShopEnabled } from "@/lib/constants/featureFlags";
import { FaShoppingBag } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export const metadata = {
  title: "Shop | Coastal Creations Studio",
  description:
    "Browse art kits, workbooks, stickers, mosaics, and more from Coastal Creations Studio.",
};

export default function StorePage(): ReactElement {
  if (!isShopEnabled()) {
    return <ShopComingSoon />;
  }
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Shop"
        subtitle="Take a piece of the studio home. Browse our art kits, workbooks, mosaics, stickers, and more — shipped right to your door."
        leftIcon={<FaShoppingBag />}
        rightIcon={<GiPaintBrush />}
      />
      <Store />
      <ShopGiftCardCTA />
      {/* Store-only: keep the cart reachable at all times while shopping. */}
      <StoreCartButton />
    </div>
  );
}
