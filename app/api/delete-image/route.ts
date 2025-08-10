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

    console.log(`[DELETE-IMAGE-ROUTE] Processing deletion for URL: ${imageUrl}`);

    // First, let's find all eventPictures documents and see which ones match
    const allEventPictures = await client.fetch(`*[_type == "eventPictures"]`);
    console.log(`[DELETE-IMAGE-ROUTE] Total eventPictures documents:`, allEventPictures.length);
    
    // Log first few to see structure
    if (allEventPictures.length > 0) {
      console.log(`[DELETE-IMAGE-ROUTE] First eventPictures document structure:`, JSON.stringify(allEventPictures[0], null, 2));
    }

    // Try to find documents that reference this image URL directly
    const documentsWithImageUrl = await client.fetch(`*[_type == "eventPictures" && image.asset->url == "${imageUrl}"]`);
    console.log(`[DELETE-IMAGE-ROUTE] Documents found with image URL:`, documentsWithImageUrl.length);

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
      console.log(`[DELETE-IMAGE-ROUTE] Fallback asset ID: ${fullAssetId}`);

      // Try to find documents with this asset ID
      documentsToDelete = await client.fetch(`*[_type == "eventPictures" && image.asset._ref == "${fullAssetId}"]`);
      console.log(`[DELETE-IMAGE-ROUTE] Documents found with asset ID:`, documentsToDelete.length);
    }

    console.log(`[DELETE-IMAGE-ROUTE] Final documents to delete:`, documentsToDelete.length);

    // Delete all documents that reference this asset
    const deletedDocuments = [];
    if (documentsToDelete && documentsToDelete.length > 0) {
      for (const doc of documentsToDelete) {
        try {
          const deleteResult = await client.delete(doc._id);
          console.log(`[DELETE-IMAGE-ROUTE] Deleted eventPictures document: ${doc._id}`, deleteResult);
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
        const deleteResult = await client.delete(fullAssetId);
        console.log(`[DELETE-IMAGE-ROUTE] Deleted asset: ${fullAssetId}`, deleteResult);
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
      debug: {
        totalEventPictures: allEventPictures.length,
        documentsFoundWithUrl: documentsWithImageUrl.length,
        finalDocumentsToDelete: documentsToDelete.length,
      }
    });
  } catch (error) {
    console.error("[DELETE-IMAGE-ROUTE] Error deleting image:", error);
    return NextResponse.json(
      { error: `Failed to delete image: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}