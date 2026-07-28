import type { ReactElement } from "react";
import PageHeader from "@/components/classes/PageHeader";
import StoreGrid from "@/components/store/StoreGrid";
import { FaShoppingBag } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export const metadata = {
  title: "Shop (Real Data Preview) | Coastal Creations Studio",
  description: "Preview of the store grid backed by live Square catalog data and images.",
};

export default function StoreRealPreviewPage(): ReactElement {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Shop"
        subtitle="Live preview — products and images pulled from the Square catalog."
        leftIcon={<FaShoppingBag />}
        rightIcon={<GiPaintBrush />}
      />
      <StoreGrid />
    </div>
  );
}
