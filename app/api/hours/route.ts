import { NextResponse } from "next/server";
import { client } from "@/sanity/client";

export async function GET() {
  try {
    const hoursData = await client.fetch(
      `*[_type == "hoursOfOperation"][0]`,
      {},
      { next: { revalidate: 60 } } // Revalidate every minute
    );

    return NextResponse.json(hoursData);
  } catch (error) {
    console.error("Error fetching hours of operation:", error);
    return NextResponse.json(
      { error: "Failed to fetch hours of operation" },
      { status: 500 }
    );
  }
}
