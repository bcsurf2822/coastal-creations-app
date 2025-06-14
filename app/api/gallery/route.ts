import { NextResponse } from "next/server";
import { client } from "@/sanity/client";

const GALLERY_QUERY = `*[_type == "pictureGallery"]`;
const options = { next: { revalidate: 30 } };

export async function GET() {
  try {
    const gallery = await client.fetch(GALLERY_QUERY, {}, options);
    return NextResponse.json(gallery);
  } catch (error) {
    console.error("Error fetching event pictures:", error);
    return NextResponse.json({ error: "Failed to fetch event pictures" }, { status: 500 });
  }
}