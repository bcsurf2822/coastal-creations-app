import { NextResponse } from "next/server";
import { client } from "@/sanity/client";

const PRIVATE_EVENT_PICTURES_QUERY = `*[_type == "privateGallery"]`;
const options = { next: { revalidate: 30 } };

export async function GET() {
  try {
    const privateEventPictures = await client.fetch(PRIVATE_EVENT_PICTURES_QUERY, {}, options);
    return NextResponse.json(privateEventPictures);
  } catch (error) {
    console.error("[privateEventPictures-GET] Error fetching private event pictures:", error);
    return NextResponse.json({ error: "Failed to fetch private event pictures" }, { status: 500 });
  }
}