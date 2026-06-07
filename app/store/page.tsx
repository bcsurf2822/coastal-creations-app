import type { ReactElement } from "react";
import PageHeader from "@/components/classes/PageHeader";
import Store from "@/components/store/Store";
import { FaShoppingBag } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export const metadata = {
  title: "Shop | Coastal Creations Studio",
  description:
    "Browse art kits, workbooks, stickers, mosaics, and more from Coastal Creations Studio.",
};

export default function StorePage(): ReactElement {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Shop"
        subtitle="Take a piece of the studio home. Browse our art kits, workbooks, mosaics, stickers, and more — shipped right to your door."
        leftIcon={<FaShoppingBag />}
        rightIcon={<GiPaintBrush />}
      />
      <Store />
    </div>
  );
}
