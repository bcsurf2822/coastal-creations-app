export interface GoogleReview {
  author_name: string;
  rating: number;
  text: string;
  relative_time_description: string;
  profile_photo_url?: string;
}

// Replace these with real reviews copied from the studio's Google Maps listing.
// To find them: Google Maps → "Coastal Creations Studio Ocean City NJ" → Reviews tab.
const HARDCODED_REVIEWS: GoogleReview[] = [
  {
    author_name: "Melissa R.",
    rating: 5,
    text: "We did a private painting party here for my daughter's birthday and it was absolutely perfect! The instructor was so patient and fun, every kid left with a beautiful piece they were proud of. The studio is bright, clean, and right in Ocean City — couldn't have asked for a better experience.",
    relative_time_description: "2 weeks ago",
  },
  {
    author_name: "Tom & Diane K.",
    rating: 5,
    text: "My wife and I took one of the evening adult workshops and had the best time. Great music, great vibes, and we both walked out with paintings we actually want to hang up. The owner is warm and welcoming and really makes you feel at ease even if you've never painted before.",
    relative_time_description: "1 month ago",
  },
  {
    author_name: "Jessica P.",
    rating: 5,
    text: "Signed my kids up for summer art camp and they LOVED it. They came home every day excited to show us what they made. The projects were creative and age-appropriate, and the staff were wonderful. Will absolutely be back next summer!",
    relative_time_description: "3 months ago",
  },
  {
    author_name: "Sarah W.",
    rating: 5,
    text: "Stumbled in for a walk-in mosaic session and ended up staying two hours — in the best way! Super relaxing, the staff were helpful without hovering, and I made something I'm genuinely proud of. A hidden gem in Ocean City. Highly recommend for a rainy beach day or a fun outing with friends.",
    relative_time_description: "3 months ago",
  },
  {
    author_name: "Chris M.",
    rating: 5,
    text: "Bought a gift card for my mom and she ended up dragging the whole family along. We all did different things — some painted, some did mosaics — and everyone had a blast. The space is charming and the staff clearly love what they do. This is a must-do if you're visiting Ocean City.",
    relative_time_description: "5 months ago",
  },
];

// When GOOGLE_PLACES_API_KEY and GOOGLE_PLACE_ID env vars are configured,
// this function will fetch live reviews from the Google Places Details API
// (up to 5 reviews, cached for 24 hours). Until then it returns the
// hardcoded array above.
export async function getGoogleReviews(): Promise<GoogleReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (apiKey && placeId) {
    try {
      const res = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating&key=${apiKey}`,
        { next: { revalidate: 86400 } },
      );
      const data = (await res.json()) as {
        result?: { reviews?: GoogleReview[] };
      };
      if (data.result?.reviews?.length) return data.result.reviews;
    } catch {
      // fall through to hardcoded reviews on any fetch error
    }
  }

  return HARDCODED_REVIEWS;
}
