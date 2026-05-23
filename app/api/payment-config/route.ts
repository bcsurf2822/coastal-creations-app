import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    applicationId: process.env.SQUARE_APPLICATION_ID || "",
    locationId: process.env.SQUARE_LOCATION_ID || "",
  });
}
