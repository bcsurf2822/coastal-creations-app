import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    applicationId: process.env.APPLICATION_ID || "",
    locationId: process.env.SQUARE_LOCATION_ID || process.env.LOCATION_ID || "",
    redirectUrl: process.env.REDIRECT_URL || "",
  });
}
