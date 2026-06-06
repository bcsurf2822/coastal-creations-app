export type ProductCategory =
  | "all"
  | "paint-kits"
  | "mosaic-kits"
  | "mixed-media"
  | "supplies"
  | "merchandise";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: Exclude<ProductCategory, "all">;
  tag?: "Bestseller" | "New" | "Sale" | "Limited";
  inStock: boolean;
  stockCount: number;
  accentColor: string;
  icon: string;
}

export const CATEGORY_LABELS: Record<ProductCategory, string> = {
  all: "All Products",
  "paint-kits": "Paint Kits",
  "mosaic-kits": "Mosaic Kits",
  "mixed-media": "Mixed Media",
  supplies: "Supplies",
  merchandise: "Merchandise",
};

export const MOCK_PRODUCTS: Product[] = [
  {
    id: "1",
    name: "Coastal Watercolor Kit",
    description:
      "Paint ocean sunsets from home. Includes pro-grade watercolors, 3 brushes, and 6 pre-sketched coastal cards.",
    price: 35,
    category: "paint-kits",
    tag: "Bestseller",
    inStock: true,
    stockCount: 8,
    accentColor: "#bae6fd",
    icon: "🎨",
  },
  {
    id: "2",
    name: "Mini Canvas Set",
    description:
      "Three 6×6 stretched canvases with acrylic paint sampler and a step-by-step guide included.",
    price: 28,
    category: "paint-kits",
    inStock: true,
    stockCount: 14,
    accentColor: "#fde68a",
    icon: "🖼️",
  },
  {
    id: "3",
    name: "Kids Mosaic Adventure Kit",
    description:
      "Safe, pre-cut glass pieces in 10 colors. Perfect for ages 8+ with a guided project card.",
    price: 42,
    category: "mosaic-kits",
    tag: "New",
    inStock: true,
    stockCount: 6,
    accentColor: "#d9f99d",
    icon: "🧩",
  },
  {
    id: "4",
    name: "Glass Mosaic Starter Kit",
    description:
      "Everything to create your first 12×12 mosaic — grouting supplies, adhesive, and cut glass included.",
    price: 55,
    category: "mosaic-kits",
    inStock: true,
    stockCount: 4,
    accentColor: "#fbcfe8",
    icon: "✨",
  },
  {
    id: "5",
    name: "Mixed Media Exploration Box",
    description:
      "Our most popular kit — watercolor, collage, and acrylic combined in one guided creative experience.",
    price: 65,
    category: "mixed-media",
    tag: "Bestseller",
    inStock: true,
    stockCount: 10,
    accentColor: "#c4b5fd",
    icon: "🎭",
  },
  {
    id: "6",
    name: "Fluid Art Pour Kit",
    description:
      "Create mesmerizing poured acrylic paintings. Includes 4 canvases, silicone oil, and 6 pour paints.",
    price: 38,
    category: "paint-kits",
    inStock: true,
    stockCount: 7,
    accentColor: "#a5f3fc",
    icon: "💧",
  },
  {
    id: "7",
    name: "Studio Canvas Apron",
    description:
      "Artist-grade canvas apron with 4 pockets. One size fits most — made to get messy.",
    price: 22,
    category: "merchandise",
    inStock: true,
    stockCount: 15,
    accentColor: "#fed7aa",
    icon: "👕",
  },
  {
    id: "8",
    name: "Take-Home Acrylic Set",
    description:
      "24 professional acrylic colors, 5 brushes, and a palette. Studio quality for your home studio.",
    price: 45,
    originalPrice: 60,
    category: "supplies",
    tag: "Sale",
    inStock: true,
    stockCount: 3,
    accentColor: "#fecaca",
    icon: "🖌️",
  },
];
