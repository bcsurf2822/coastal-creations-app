"use client";

import { ReactElement, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button, Input, Textarea, Select, Label } from "@/components/ui";
import type { ApiProduct } from "@/types/interfaces";
import { useCreateProduct, useUpdateProduct } from "@/hooks/mutations";
import { useImageUpload } from "@/components/dashboard/event-form/shared/hooks/useImageUpload";

const PRESET_CATEGORIES = [
  { value: "art-kits", label: "Art Kits" },
  { value: "supplies", label: "Supplies" },
  { value: "classes", label: "Classes" },
  { value: "other", label: "Other (Custom)" },
];

interface ProductFormBaseProps {
  mode: "add" | "edit";
  productId?: string;
  initialData?: Partial<ApiProduct>;
}

const ProductFormBase = ({ mode, productId, initialData }: ProductFormBaseProps): ReactElement => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutate: createProduct, isPending: isCreating } = useCreateProduct();
  const { mutate: updateProduct, isPending: isUpdating } = useUpdateProduct();

  const [formData, setFormData] = useState({
    name: initialData?.name ?? "",
    description: initialData?.description ?? "",
    price: initialData?.price?.toString() ?? "",
    category: initialData?.category ?? "art-kits",
    customCategory: initialData?.customCategory ?? "",
    imageUrl: initialData?.image ?? "",
    imageFile: null as File | null,
    stock: initialData?.stock?.toString() ?? "0",
    isActive: initialData?.isActive ?? true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const isSubmitting = isCreating || isUpdating;

  const {
    uploadedImageUrl,
    isImageUploading,
    imageUploadStatus,
    handleImageUpload,
    handleImageDelete,
    setIsImageLoading,
  } = useImageUpload({
    eventName: formData.name,
    onSuccess: (url) => setFormData((prev) => ({ ...prev, imageUrl: url })),
  });

  const displayImageUrl = uploadedImageUrl || formData.imageUrl;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.price || isNaN(Number(formData.price)) || Number(formData.price) < 0)
      newErrors.price = "Valid price is required";
    if (formData.category === "other" && !formData.customCategory.trim())
      newErrors.customCategory = "Please enter a category name";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, imageFile: file }));
      handleImageUpload(file);
    }
  };

  const handleRemoveImage = () => {
    setFormData((prev) => ({ ...prev, imageFile: null, imageUrl: "" }));
    handleImageDelete();
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: Partial<ApiProduct> = {
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: Number(formData.price),
      category: formData.category as ApiProduct["category"],
      customCategory: formData.category === "other" ? formData.customCategory.trim() : undefined,
      image: displayImageUrl || undefined,
      stock: Number(formData.stock),
      isActive: formData.isActive,
    };

    if (mode === "add") {
      createProduct(payload, {
        onSuccess: () => router.push("/admin/dashboard/products"),
      });
    } else if (productId) {
      updateProduct({ id: productId, data: payload }, {
        onSuccess: () => router.push("/admin/dashboard/products"),
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">
        {mode === "add" ? "Add Product" : "Edit Product"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <Label htmlFor="name" required>Product Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={!!errors.name}
            placeholder="e.g. Mosaic Art Kit"
          />
          {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
        </div>

        <div>
          <Label htmlFor="description" required>Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={!!errors.description}
            placeholder="Describe this product..."
            rows={4}
          />
          {errors.description && <p className="mt-1 text-sm text-red-500">{errors.description}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price" required>Price ($)</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
              error={!!errors.price}
              placeholder="0.00"
            />
            {errors.price && <p className="mt-1 text-sm text-red-500">{errors.price}</p>}
          </div>

          <div>
            <Label htmlFor="stock">Stock Quantity</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
              placeholder="0"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="category" required>Category</Label>
          <Select
            id="category"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ApiProduct["category"] })}
          >
            {PRESET_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </Select>
        </div>

        {formData.category === "other" && (
          <div>
            <Label htmlFor="customCategory" required>Custom Category Name</Label>
            <Input
              id="customCategory"
              value={formData.customCategory}
              onChange={(e) => setFormData({ ...formData, customCategory: e.target.value })}
              error={!!errors.customCategory}
              placeholder="e.g. Pottery Supplies"
            />
            {errors.customCategory && <p className="mt-1 text-sm text-red-500">{errors.customCategory}</p>}
          </div>
        )}

        {/* Image Upload */}
        <div>
          <Label>Product Image (Optional)</Label>
          {!formData.name && (
            <p className="text-amber-600 text-xs mb-2">Enter a product name first before uploading an image.</p>
          )}
          <div className="flex items-center gap-4 mt-1">
            <div className="flex-shrink-0">
              {displayImageUrl || formData.imageFile ? (
                <div className="relative">
                  <Image
                    src={displayImageUrl || (formData.imageFile ? URL.createObjectURL(formData.imageFile) : "")}
                    alt="Product thumbnail"
                    width={80}
                    height={80}
                    className="w-20 h-20 rounded-lg object-cover border border-gray-200"
                    onLoad={() => setIsImageLoading(false)}
                    onLoadStart={() => setIsImageLoading(true)}
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold shadow"
                  >
                    ×
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              )}
            </div>
            <div>
              <label className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 cursor-pointer">
                {isImageUploading ? "Uploading..." : displayImageUrl || formData.imageFile ? "Change Image" : "Select Image"}
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={isImageUploading || !formData.name}
                />
              </label>
              {imageUploadStatus && (
                <p className={`text-sm mt-1 ${imageUploadStatus.includes("successfully") ? "text-green-600" : imageUploadStatus.includes("Failed") ? "text-red-600" : "text-blue-600"}`}>
                  {imageUploadStatus}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            id="isActive"
            type="checkbox"
            checked={formData.isActive}
            onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            className="h-4 w-4 rounded border-gray-300"
          />
          <Label htmlFor="isActive">Active — visible in the store</Label>
        </div>

        <div className="flex gap-4 pt-4">
          <Button type="submit" variant="primary" disabled={isSubmitting || isImageUploading}>
            {isImageUploading ? "Uploading Image..." : isSubmitting ? "Saving..." : mode === "add" ? "Add Product" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push("/admin/dashboard/products")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProductFormBase;
