"use client";

// Final Shop layout. Loads the online-sellable catalog and renders it in either
// a Grid (Gallery/Polaroid cards) or List (horizontal rows) view. The shopper's
// choice is remembered in localStorage. Product images are shown UNCROPPED so
// the whole photo is always visible, and descriptions are shown in both views.

import type { ReactElement, ReactNode } from "react";
import { useState, useEffect } from "react";
import { FiGrid, FiList } from "react-icons/fi";
import { useProducts } from "@/hooks/queries/use-products";
import ShopProductCard from "./ShopProductCard";
import ShopListRow from "./ShopListRow";

type ShopView = "grid" | "list";
const VIEW_STORAGE_KEY = "shop-view";

function ViewToggleButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: ReactNode;
}): ReactElement {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
        active
          ? "bg-[var(--color-primary)] text-white"
          : "text-[var(--color-text-subtle)] hover:bg-[var(--color-light)]"
      }`}
    >
      {children}
    </button>
  );
}

export default function Store(): ReactElement {
  const { data: products, isLoading, isError } = useProducts();
  const [view, setView] = useState<ShopView>("grid");

  // Restore the shopper's last view preference (client-only to avoid a
  // hydration mismatch — the server always renders the default "grid").
  useEffect(() => {
    const saved = window.localStorage.getItem(VIEW_STORAGE_KEY);
    if (saved === "grid" || saved === "list") {
      // Restoring persisted UI state after mount is the canonical reason to set
      // state in an effect: it cannot run during SSR (no localStorage), so doing
      // it here keeps the server/client first render identical (both "grid").
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setView(saved);
    }
  }, []);

  const selectView = (next: ShopView): void => {
    setView(next);
    window.localStorage.setItem(VIEW_STORAGE_KEY, next);
  };

  const items = products ?? [];
  const hasItems = !isLoading && !isError && items.length > 0;

  return (
    <section className="min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="rounded-[2rem] border border-white/65 bg-white/85 p-6 shadow-[0_14px_28px_rgba(12,74,110,0.1)] backdrop-blur-[2px] md:p-8">
          {/* Toolbar: item count + view toggle */}
          {hasItems && (
            <div className="mb-6 flex items-center justify-between gap-4">
              <p className="text-sm text-[var(--color-text-subtle)]">
                {items.length} item{items.length !== 1 ? "s" : ""}
              </p>
              <div className="flex items-center gap-1 rounded-full border border-[var(--color-border-light)] bg-white p-1">
                <ViewToggleButton
                  active={view === "grid"}
                  onClick={() => selectView("grid")}
                  label="Grid view"
                >
                  <FiGrid className="h-4 w-4" />
                </ViewToggleButton>
                <ViewToggleButton
                  active={view === "list"}
                  onClick={() => selectView("list")}
                  label="List view"
                >
                  <FiList className="h-4 w-4" />
                </ViewToggleButton>
              </div>
            </div>
          )}

          {isError && (
            <p className="py-16 text-center text-[var(--color-error)]">
              Unable to load products. Please try again later.
            </p>
          )}

          {isLoading && (
            <div className="grid grid-cols-2 gap-5 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] w-full animate-pulse rounded-2xl bg-[var(--color-light)]"
                />
              ))}
            </div>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <p className="py-16 text-center text-lg text-[var(--color-text-subtle)]">
              No products available yet. Check back soon!
            </p>
          )}

          {hasItems && view === "grid" && (
            <div className="grid grid-cols-2 items-stretch gap-5 sm:gap-6 md:grid-cols-3 xl:grid-cols-4">
              {items.map((product, i) => (
                <ShopProductCard
                  key={product.squareItemId}
                  product={product}
                  priority={i < 4}
                />
              ))}
            </div>
          )}

          {hasItems && view === "list" && (
            <div className="flex flex-col divide-y divide-gray-100">
              {items.map((product, i) => (
                <ShopListRow
                  key={product.squareItemId}
                  product={product}
                  priority={i < 6}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
