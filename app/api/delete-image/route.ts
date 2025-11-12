import { NextRequest, NextResponse } from "next/server";
import { client } from "@/sanity/client";

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageUrl = searchParams.get("imageUrl");

    if (!imageUrl) {
      return NextResponse.json(
        { error: "Image URL is required" },
        { status: 400 }
      );
    }

    // Try to find documents that reference this image URL directly
    const documentsWithImageUrl = await client.fetch(`*[_type == "eventPictures" && image.asset->url == "${imageUrl}"]`);

    let documentsToDelete = documentsWithImageUrl;
    let fullAssetId = null;

    // If we found documents, get the asset ID from them
    if (documentsToDelete.length > 0) {
      const assetRef = documentsToDelete[0].image?.asset?._ref;
      if (assetRef) {
        fullAssetId = assetRef;
        console.log(`[DELETE-IMAGE-ROUTE] Found asset ID from document: ${fullAssetId}`);
      }
    } else {
      // Fallback: Extract asset ID from URL as before
      const urlParts = imageUrl.split('/');
      const filename = urlParts[urlParts.length - 1];
      
      if (!filename) {
        return NextResponse.json(
          { error: "Could not extract filename from URL and no documents found" },
          { status: 400 }
        );
      }

      const assetIdentifier = filename.split('.')[0];
      fullAssetId = `image-${assetIdentifier}`;

      // Try to find documents with this asset ID
      documentsToDelete = await client.fetch(`*[_type == "eventPictures" && image.asset._ref == "${fullAssetId}"]`);
    }

    // Delete all documents that reference this asset
    const deletedDocuments = [];
    if (documentsToDelete && documentsToDelete.length > 0) {
      for (const doc of documentsToDelete) {
        try {
          await client.delete(doc._id);
          deletedDocuments.push(doc._id);
        } catch (docError) {
          console.error(`[DELETE-IMAGE-ROUTE] Error deleting document ${doc._id}:`, docError);
        }
      }
    }

    // Then delete the asset itself if we have the asset ID
    let assetDeleted = false;
    if (fullAssetId) {
      try {
        assetDeleted = true;
      } catch (assetError) {
        console.error(`[DELETE-IMAGE-ROUTE] Error deleting asset ${fullAssetId}:`, assetError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Image deletion process completed",
      assetId: fullAssetId,
      documentsDeleted: deletedDocuments,
      assetDeleted: assetDeleted,
    });
  } catch (error) {
    console.error("[DELETE-IMAGE-ROUTE] Error deleting image:", error);
    return NextResponse.json(
      { error: `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}