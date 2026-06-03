"use client";

import { ReactElement } from "react";
import Link from "next/link";
import Image from "next/image";
import { useProducts } from "@/hooks/queries/use-products";
import { useDeleteProduct } from "@/hooks/mutations/use-delete-product";
import { Button } from "@/components/ui";
import type { ApiProduct } from "@/types/interfaces";

const categoryLabel: Record<ApiProduct["category"], string> = {
  "art-kits": "Art Kits",
  supplies: "Supplies",
  classes: "Classes",
  other: "Other",
};

const ProductsContainer = (): ReactElement => {
  const { data: products, isLoading, error } = useProducts();
  const { mutate: deleteProduct } = useDeleteProduct();

  const handleDelete = (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    deleteProduct(id);
  };

  if (isLoading) {
    return <p className="text-gray-500">Loading products...</p>;
  }

  if (error) {
    return <p className="text-red-500">Failed to load products.</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Products</h2>
        <Link href="/admin/dashboard/add-product">
          <Button variant="primary">+ Add Product</Button>
        </Link>
      </div>

      {!products || products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-lg border border-dashed border-gray-300">
          <p className="text-gray-500 mb-4">No products yet.</p>
          <Link href="/admin/dashboard/add-product">
            <Button variant="primary">Add Your First Product</Button>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {products.map((product) => (
                <tr key={product._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {product.image && (
                        <Image src={product.image} alt={product.name} width={40} height={40} className="h-10 w-10 rounded object-cover" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">{product.name}</p>
                        <p className="text-sm text-gray-500 line-clamp-1">{product.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {product.category === "other" && product.customCategory
                      ? product.customCategory
                      : categoryLabel[product.category]}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">${product.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{product.stock}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${product.isActive ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"}`}>
                      {product.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <Link href={`/admin/dashboard/edit-product/${product._id}`}>
                      <Button variant="secondary">Edit</Button>
                    </Link>
                    <Button
                      variant="destructive"
                      onClick={() => handleDelete(product._id, product.name)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProductsContainer;
