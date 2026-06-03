/**
 * Products API Route (Storefront)
 * GET: List all Square catalog items with variations, pricing, and stock counts
 */
import { NextResponse } from "next/server";
import { productService } from "@/lib/square/products";

export async function GET(): Promise<Response> {
  try {
    console.log("[API-PRODUCTS] Fetching products");

    const { products } = await productService.listProducts();

    return NextResponse.json({
      success: true,
      products,
      count: products.length,
    });
  } catch (error) {
    console.error("[API-PRODUCTS] Error fetching products:", error);
    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
