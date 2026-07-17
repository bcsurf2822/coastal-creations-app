import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const title = formData.get("title") as string;

    if (!file || !title) {
      return NextResponse.json(
        { error: "File and title are required" },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload image to Sanity
    const asset = await client.assets.upload("image", buffer, {
      filename: file.name,
      contentType: file.type,
    });

    // Reuse the existing eventPictures doc for this title instead of piling
    // up a new document on every re-upload; drop the previous asset once
    // nothing else references it.
    const existing = await client.fetch(
      `*[_type == "eventPictures" && title == $title][0]{_id, "previousAssetId": image.asset._ref}`,
      { title }
    );

    const imagePayload = {
      _type: "image",
      asset: {
        _type: "reference",
        _ref: asset._id,
      },
    };

    let document;
    if (existing) {
      document = await client
        .patch(existing._id)
        .set({ image: imagePayload })
        .commit();

      if (existing.previousAssetId && existing.previousAssetId !== asset._id) {
        try {
          const stillReferenced = await client.fetch(
            `count(*[references($previousAssetId)])`,
            { previousAssetId: existing.previousAssetId }
          );
          if (stillReferenced === 0) {
            await client.delete(existing.previousAssetId);
          }
        } catch (assetError) {
          console.error(
            `[UPLOAD-IMAGE-ROUTE] Error deleting previous asset ${existing.previousAssetId}:`,
            assetError
          );
        }
      }
    } else {
      document = await client.create({
        _type: "eventPictures",
        title: title,
        image: imagePayload,
      });
    }

    return NextResponse.json({
      success: true,
      document,
      imageUrl: asset.url,
    });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json(
      { error: "Failed to upload image" },
      { status: 500 }
    );
  }
}