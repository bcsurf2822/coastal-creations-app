"use client";

import { useState, useEffect, useCallback } from "react";
import type { ReactElement } from "react";
import type { RawCatalogItem } from "@/lib/square/catalog";

type ProductSettings = {
  squareItemId: string;
  isOnlineSellable: boolean;
  parcelPreset: "SMALL" | "MEDIUM" | "LARGE";
  slug?: string;
  displayOrder?: number;
};

type ProductRow = {
  catalogItem: RawCatalogItem;
  settings: ProductSettings | null;
};

export default function StoreProductsTable(): ReactElement {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState<Set<string>>(new Set());

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/admin/store/products");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load products");
      setProducts(data.products);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateSettings = async (squareItemId: string, patch: Partial<ProductSettings>) => {
    setSaving((prev) => new Set([...prev, squareItemId]));
    try {
      const res = await fetch(`/api/admin/store/products/${squareItemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Save failed");
      setProducts((prev) =>
        prev.map((p) =>
          p.catalogItem.id === squareItemId
            ? { ...p, settings: data.settings }
            : p
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving((prev) => {
        const next = new Set(prev);
        next.delete(squareItemId);
        return next;
      });
    }
  };

  const onlineCount = products.filter((p) => p.settings?.isOnlineSellable).length;

  if (loading) {
    return <div className="py-12 text-center text-gray-500">Loading products from Square...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Catalog Items</p>
          <p className="text-2xl font-bold text-gray-800">{products.length}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">In Online Shop</p>
          <p className="text-2xl font-bold text-green-600">{onlineCount}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Variations</th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Online Shop</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Parcel Size</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                    No catalog items found in Square
                  </td>
                </tr>
              ) : (
                products.map(({ catalogItem, settings }) => {
                  const isSaving = saving.has(catalogItem.id);
                  const isOnline = settings?.isOnlineSellable ?? false;
                  const preset = settings?.parcelPreset ?? "MEDIUM";

                  return (
                    <tr key={catalogItem.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {catalogItem.imageUrls[0] ? (
                            <img
                              src={catalogItem.imageUrls[0]}
                              alt={catalogItem.name}
                              className="w-12 h-12 rounded-md object-cover flex-shrink-0"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-md bg-gray-100 flex items-center justify-center flex-shrink-0 text-gray-400 text-xs">
                              No img
                            </div>
                          )}
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{catalogItem.name}</p>
                            {catalogItem.categoryNames.length > 0 && (
                              <p className="text-xs text-gray-500">{catalogItem.categoryNames.join(", ")}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {catalogItem.variations.length} variation{catalogItem.variations.length !== 1 ? "s" : ""}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <button
                          onClick={() => updateSettings(catalogItem.id, { isOnlineSellable: !isOnline })}
                          disabled={isSaving}
                          aria-label={isOnline ? "Remove from shop" : "Add to shop"}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50 ${
                            isOnline ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              isOnline ? "translate-x-6" : "translate-x-1"
                            }`}
                          />
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <select
                          value={preset}
                          onChange={(e) =>
                            updateSettings(catalogItem.id, {
                              parcelPreset: e.target.value as "SMALL" | "MEDIUM" | "LARGE",
                            })
                          }
                          disabled={isSaving}
                          className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50"
                        >
                          <option value="SMALL">Small</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="LARGE">Large</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
