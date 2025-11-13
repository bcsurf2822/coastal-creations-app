import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";
import { buildGalleryQuery } from "@/lib/utils/galleryHelpers";

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

    console.log("[GALLERY-GET] Fetching gallery images", {
      destinations,
      query,
    });

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
  try {
    const formData = await request.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string | null;
    const destinationsJson = formData.get("destinations") as string;

    // Validate required fields
    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

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

    console.log("[GALLERY-POST] Uploading images", {
      title,
      description,
      destinations,
      fileCount: files.length,
    });

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

      // Create Sanity document
      const document = await client.create({
        _type: "pictureGallery",
        title: title,
        description: description || undefined,
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

      console.log("[GALLERY-POST] Image uploaded successfully", {
        documentId: document._id,
        assetId: asset._id,
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

    console.log("[GALLERY-PUT] Updating image metadata", {
      id,
      title,
      description,
      destinations,
    });

    // Update document in Sanity
    const updatedDocument = await client
      .patch(id)
      .set({
        title,
        description: description || undefined,
        destination: destinations,
      })
      .commit();

    console.log("[GALLERY-PUT] Image metadata updated successfully", {
      documentId: updatedDocument._id,
    });

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
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    console.log("[GALLERY-DELETE] Deleting image", { id });

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
        console.log("[GALLERY-DELETE] Asset deleted", {
          assetId: document.image.asset._ref,
        });
      } catch (assetError) {
        console.warn(
          "[GALLERY-DELETE] Could not delete asset (may be in use elsewhere)",
          assetError
        );
      }
    }

    console.log("[GALLERY-DELETE] Image deleted successfully", { id });

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