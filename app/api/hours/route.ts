import { NextResponse } from "next/server";
import { client } from "@/sanity/client";
import type { HoursOfOperation } from "@/types/hours";

export async function GET() {
  try {
    const hoursData = await client.fetch(
      `*[_type == "hoursOfOperation"][0]`,
      {},
      { next: { revalidate: 60 } } // Revalidate every minute
    );

    console.log("[API-HOURS-GET] Fetched hours data:", JSON.stringify(hoursData, null, 2));
    return NextResponse.json({ success: true, data: hoursData });
  } catch (error) {
    console.error("[API-HOURS-GET] Error fetching hours of operation:", error);
    return NextResponse.json(
      { error: "Failed to fetch hours of operation" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body: HoursOfOperation = await request.json();
    console.log("[API-HOURS-PUT] Received body:", JSON.stringify(body, null, 2));

    // First, check if a hours document exists
    const existingDoc = await client.fetch(
      `*[_type == "hoursOfOperation"][0]{ _id }`
    );

    let result;

    if (existingDoc?._id) {
      console.log("[API-HOURS-PUT] Updating existing document:", existingDoc._id);
      // Update existing document
      result = await client
        .patch(existingDoc._id)
        .set({
          monday: body.monday,
          tuesday: body.tuesday,
          wednesday: body.wednesday,
          thursday: body.thursday,
          friday: body.friday,
          saturday: body.saturday,
          sunday: body.sunday,
        })
        .commit();
    } else {
      console.log("[API-HOURS-PUT] Creating new document");
      // Create new document
      result = await client.create({
        _type: "hoursOfOperation",
        monday: body.monday,
        tuesday: body.tuesday,
        wednesday: body.wednesday,
        thursday: body.thursday,
        friday: body.friday,
        saturday: body.saturday,
        sunday: body.sunday,
      });
    }

    console.log("[API-HOURS-PUT] Result:", JSON.stringify(result, null, 2));
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("[API-HOURS-PUT] Error updating hours of operation:", error);
    return NextResponse.json(
      { error: "Failed to update hours of operation" },
      { status: 500 }
    );
  }
}
