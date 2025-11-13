import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import type { PageContent } from "@/types/pageContent";

export async function GET() {
  try {
    const pageContent = await client.fetch(
      `*[_type == "pageContent"][0]`,
      {},
      { next: { revalidate: 60 } } // Revalidate every minute
    );

    console.log("[API-PAGE-CONTENT-GET] Fetched page content:", JSON.stringify(pageContent, null, 2));
    return NextResponse.json({ success: true, data: pageContent });
  } catch (error) {
    console.error("[API-PAGE-CONTENT-GET] Error fetching page content:", error);
    return NextResponse.json(
      { error: "Failed to fetch page content" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body: PageContent = await request.json();
    console.log("[API-PAGE-CONTENT-PUT] Received body:", JSON.stringify(body, null, 2));

    // First, check if a pageContent document exists
    const existingDoc = await client.fetch(
      `*[_type == "pageContent"][0]{ _id }`
    );

    let result;

    if (existingDoc?._id) {
      console.log("[API-PAGE-CONTENT-PUT] Updating existing document:", existingDoc._id);
      // Update existing document
      result = await client
        .patch(existingDoc._id)
        .set({
          homepage: body.homepage,
          eventPages: body.eventPages,
          otherPages: body.otherPages,
        })
        .commit();
    } else {
      console.log("[API-PAGE-CONTENT-PUT] Creating new document");
      // Create new document
      result = await client.create({
        _type: "pageContent",
        homepage: body.homepage,
        eventPages: body.eventPages,
        otherPages: body.otherPages,
      });
    }

    console.log("[API-PAGE-CONTENT-PUT] Result:", JSON.stringify(result, null, 2));
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[API-PAGE-CONTENT-PUT] Error updating page content:", error);
    return NextResponse.json(
      { error: "Failed to update page content" },
      { status: 500 }
    );
  }
}
