import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

/**
 * POST - Upload an image to Sanity and return the asset reference.
 * Used for offering card images on the page content document.
 */
export async function POST(request: Request): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "File must be an image" },
        { status: 400 },
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const asset = await client.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    return NextResponse.json({
      success: true,
      data: {
        _type: "image",
        asset: {
          _type: "reference",
          _ref: asset._id,
        },
      },
      assetUrl: asset.url,
    });
  } catch (error) {
    console.error("[PAGE-CONTENT-UPLOAD-IMAGE] Error:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 },
    );
  }
}
