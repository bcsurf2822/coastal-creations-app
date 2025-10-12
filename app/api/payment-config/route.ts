import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    applicationId: process.env.APPLICATION_ID || "",
    locationId: "main", // Using hardcoded value as in the component
    redirectUrl: process.env.REDIRECT_URL || "",
  });
}
