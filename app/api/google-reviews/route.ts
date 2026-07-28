import { NextResponse } from "next/server";
import { getGoogleReviews } from "@/lib/google/reviews";

export const revalidate = 3600;

export async function GET(): Promise<NextResponse> {
  const reviews = await getGoogleReviews();
  return NextResponse.json(reviews);
}
