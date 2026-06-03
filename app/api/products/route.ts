import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Product from "@/lib/models/Product";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function GET(): Promise<NextResponse> {
  try {
    await connectMongo();
    const products = await Product.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error("[PRODUCTS-GET] Error fetching products:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectMongo();
    const data = await request.json();
    const product = await Product.create(data);
    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error("[PRODUCTS-POST] Error creating product:", error);
    return NextResponse.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}
