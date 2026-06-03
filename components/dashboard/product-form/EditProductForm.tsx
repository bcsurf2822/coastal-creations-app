"use client";

import { ReactElement } from "react";
import ProductFormBase from "./ProductFormBase";
import type { ApiProduct } from "@/types/interfaces";

interface EditProductFormProps {
  productId: string;
  initialData: ApiProduct;
}

const EditProductForm = ({ productId, initialData }: EditProductFormProps): ReactElement => {
  return <ProductFormBase mode="edit" productId={productId} initialData={initialData} />;
};

export default EditProductForm;
