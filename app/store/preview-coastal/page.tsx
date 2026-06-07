import type { ReactElement } from "react";
import PageHeader from "@/components/classes/PageHeader";
import VariantBReal from "@/components/store/variants/VariantBReal";
import { FaShoppingBag } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export const metadata = {
  title: "Shop — Coastal (Real Data) | Coastal Creations Studio",
  description: "The Coastal variant design wired to live Square catalog data and images.",
};

export default function CoastalRealPreviewPage(): ReactElement {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Shop"
        subtitle="Coastal design — products and images pulled live from the Square catalog."
        leftIcon={<FaShoppingBag />}
        rightIcon={<GiPaintBrush />}
      />
      <VariantBReal />
    </div>
  );
}
