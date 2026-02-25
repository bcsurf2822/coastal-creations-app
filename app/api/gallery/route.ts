import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { buildGalleryQuery } from "@/lib/utils/galleryHelpers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

const options = { next: { revalidate: 30 } };

/**
 * GET - Fetch gallery images with optional destination filter
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = request.nextUrl.searchParams;
    const destinationParam = searchParams.get("destination");

    // Parse destinations from query param (comma-separated)
    const destinations = destinationParam
      ? destinationParam.split(",").filter(Boolean)
      : undefined;

    // Build query with optional filter
    const query = buildGalleryQuery(destinations);

    const gallery = await client.fetch(query, {}, options);
    return NextResponse.json({ success: true, data: gallery });
  } catch (error) {
    console.error("[GALLERY-GET] Error fetching gallery images:", error);
    return NextResponse.json(
      { error: "Failed to fetch gallery images" },
      { status: 500 }
    );
  }
}

/**
 * POST - Upload new gallery images
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const destinationsJson = formData.get("destinations") as string;

    // Title is optional – when omitted, each file uses its filename as the title

    if (!destinationsJson) {
      return NextResponse.json(
        { error: "At least one destination is required" },
        { status: 400 }
      );
    }

    // Parse destinations
    let destinations: string[];
    try {
      destinations = JSON.parse(destinationsJson);
      if (!Array.isArray(destinations) || destinations.length === 0) {
        return NextResponse.json(
          { error: "Destinations must be a non-empty array" },
          { status: 400 }
        );
      }
    } catch {
      return NextResponse.json(
        { error: "Invalid destinations format" },
        { status: 400 }
      );
    }

    // Get all files from FormData
    const files: File[] = [];
    let fileIndex = 0;
    while (formData.has(`file_${fileIndex}`)) {
      const file = formData.get(`file_${fileIndex}`) as File;
      if (file && file.size > 0) {
        files.push(file);
      }
      fileIndex++;
    }

    if (files.length === 0) {
      return NextResponse.json(
        { error: "At least one image file is required" },
        { status: 400 }
      );
    }

    // Upload each file and create documents
    const uploadedDocuments = [];

    for (const file of files) {
      // Convert file to buffer
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      // Upload to Sanity assets
      const asset = await client.assets.upload("image", buffer, {
        filename: file.name,
        contentType: file.type,
      });

      // Create Sanity document – title and description stay blank unless provided
      const document = await client.create({
        _type: "pictureGallery",
        title: title?.trim() || "",
        description: description?.trim() || "",
        destination: destinations,
        image: {
          _type: "image",
          asset: {
            _type: "reference",
            _ref: asset._id,
          },
        },
      });

      uploadedDocuments.push({
        ...document,
        imageUrl: asset.url,
      });
    }

    return NextResponse.json({
      success: true,
      data: uploadedDocuments,
      message: `Successfully uploaded ${files.length} image(s)`,
    });
  } catch (error) {
    console.error("[GALLERY-POST] Error uploading images:", error);
    return NextResponse.json(
      { error: "Failed to upload images" },
      { status: 500 }
    );
  }
}

/**
 * PUT - Update gallery image metadata
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, title, description, destinations } = body;

    // Validate required fields
    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    if (!destinations || !Array.isArray(destinations) || destinations.length === 0) {
      return NextResponse.json(
        { error: "At least one destination is required" },
        { status: 400 }
      );
    }

    // Update document in Sanity
    const updatedDocument = await client
      .patch(id)
      .set({
        title,
        description: description || undefined,
        destination: destinations,
      })
      .commit();

    return NextResponse.json({
      success: true,
      data: updatedDocument,
      message: "Image metadata updated successfully",
    });
  } catch (error) {
    console.error("[GALLERY-PUT] Error updating image metadata:", error);
    return NextResponse.json(
      { error: "Failed to update image metadata" },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Delete gallery image
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  const session = await getServerSession(authOptions);
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    // Fetch the document to get asset reference
    const document = await client.fetch(
      `*[_type == "pictureGallery" && _id == $id][0]`,
      { id }
    );

    if (!document) {
      return NextResponse.json(
        { error: "Image not found" },
        { status: 404 }
      );
    }

    // Delete the document
    await client.delete(id);

    // Attempt to delete the asset (optional - asset might be used elsewhere)
    if (document.image?.asset?._ref) {
      try {
        await client.delete(document.image.asset._ref);
      } catch (assetError) {
        console.warn(
          "[GALLERY-DELETE] Could not delete asset (may be in use elsewhere)",
          assetError
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Image deleted successfully",
    });
  } catch (error) {
    console.error("[GALLERY-DELETE] Error deleting image:", error);
    return NextResponse.json(
      { error: "Failed to delete image" },
      { status: 500 }
    );
  }
}