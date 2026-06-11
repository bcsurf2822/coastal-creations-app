"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
  type ReactElement,
} from "react";
import type { CartItem } from "@/lib/types/cartTypes";
import type {
  StoreProduct,
  StoreProductVariation,
} from "@/lib/types/storeTypes";

const CART_STORAGE_KEY = "cc_cart";

interface CartContextValue {
  items: CartItem[];
  addItem: (
    product: StoreProduct,
    variation: StoreProductVariation,
    qty?: number
  ) => void;
  removeItem: (squareVariationId: string) => void;
  updateQuantity: (squareVariationId: string, qty: number) => void;
  clearCart: () => void;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
  totalItems: number;
  subtotalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);

interface CartProviderProps {
  children: ReactNode;
}

export function CartProvider({ children }: CartProviderProps): ReactElement {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Hydrate from localStorage on mount (client-only)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw) as CartItem[]);
    } catch {
      // corrupted storage — start fresh
    }
  }, []);

  // Persist to localStorage whenever items change
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // storage full or private mode — fail silently
    }
  }, [items]);

  const addItem = useCallback(
    (product: StoreProduct, variation: StoreProductVariation, qty = 1) => {
      if (variation.availability === "sold_out") return;

      setItems((prev) => {
        const existing = prev.find(
          (i) => i.squareVariationId === variation.id
        );

        if (existing) {
          return prev.map((i) => {
            if (i.squareVariationId !== variation.id) return i;
            const max = i.maxQuantity;
            const newQty = max !== undefined
              ? Math.min(i.quantity + qty, max)
              : i.quantity + qty;
            return { ...i, quantity: newQty };
          });
        }

        const newItem: CartItem = {
          squareCatalogItemId: product.squareItemId,
          squareVariationId: variation.id,
          productName: product.name,
          variationName: variation.name,
          priceCents: variation.priceCents,
          imageUrl: product.primaryImage?.url,
          imageAlt: product.primaryImage?.altText ?? product.name,
          slug: product.slug,
          quantity: Math.max(1, qty),
          maxQuantity: variation.inStockQuantity ?? undefined,
        };

        return [...prev, newItem];
      });
    },
    []
  );

  const removeItem = useCallback((squareVariationId: string) => {
    setItems((prev) =>
      prev.filter((i) => i.squareVariationId !== squareVariationId)
    );
  }, []);

  const updateQuantity = useCallback(
    (squareVariationId: string, qty: number) => {
      setItems((prev) =>
        prev.map((i) => {
          if (i.squareVariationId !== squareVariationId) return i;
          const clamped = Math.max(
            1,
            i.maxQuantity !== undefined ? Math.min(qty, i.maxQuantity) : qty
          );
          return { ...i, quantity: clamped };
        })
      );
    },
    []
  );

  const clearCart = useCallback(() => setItems([]), []);
  const openDrawer = useCallback(() => setIsDrawerOpen(true), []);
  const closeDrawer = useCallback(() => setIsDrawerOpen(false), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalCents = items.reduce(
    (sum, i) => sum + i.priceCents * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        isDrawerOpen,
        openDrawer,
        closeDrawer,
        totalItems,
        subtotalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("[useCart] must be used inside CartProvider");
  return ctx;
}
