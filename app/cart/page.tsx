import type { Metadata } from "next";
import type { ReactElement } from "react";
import CartPage from "@/components/store/CartPage";
import ShopComingSoon from "@/components/store/ShopComingSoon";
import { isShopEnabled } from "@/lib/constants/featureFlags";

export const metadata: Metadata = {
  title: "Cart | Coastal Creations Studio",
  description: "Review your cart and proceed to checkout.",
};

export default function CartRoute(): ReactElement {
  if (!isShopEnabled()) {
    return <ShopComingSoon />;
  }
  return <CartPage />;
}
