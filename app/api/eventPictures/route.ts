import { NextResponse } from "next/server";
import { client } from "@/sanity/client";

const EVENT_PICTURES_QUERY = `*[_type == "eventPictures"]`;
const options = { next: { revalidate: 30 } };

export async function GET() {
  try {
    const eventPictures = await client.fetch(EVENT_PICTURES_QUERY, {}, options);
    return NextResponse.json(eventPictures);
  } catch (error) {
    console.error("Error fetching event pictures:", error);
    return NextResponse.json({ error: "Failed to fetch event pictures" }, { status: 500 });
  }
}