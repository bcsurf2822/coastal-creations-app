const AVATAR_COLORS = ["#0369a1", "#0c4a6e", "#fb923c"];

export interface PlacesReview {
  name: string;
  initials: string;
  rating: number;
  date: string;
  text: string;
  avatarColor: string;
}

const PLACEHOLDER_REVIEWS: PlacesReview[] = [
  {
    name: "Sarah M.",
    initials: "SM",
    rating: 5,
    date: "June 2025",
    text: "We had such an amazing time at Coastal Creations! The staff was incredibly welcoming and patient with our whole group. We'll definitely be back next summer!",
    avatarColor: "#0369a1",
  },
  {
    name: "Jamie L.",
    initials: "JL",
    rating: 5,
    date: "July 2025",
    text: "Best activity on the island! My kids loved every minute of the class. The instructors made it so fun and easy, even for first-timers. Highly recommend!",
    avatarColor: "#0c4a6e",
  },
  {
    name: "Chris R.",
    initials: "CR",
    rating: 5,
    date: "August 2025",
    text: "Took my daughter here for a private event and it was perfect. The space is beautiful and the team thought of everything. Such a memorable experience.",
    avatarColor: "#fb923c",
  },
  {
    name: "Amanda T.",
    initials: "AT",
    rating: 5,
    date: "May 2025",
    text: "Absolutely loved the mosaic class! I came with zero art experience and left with something I'm genuinely proud of. The whole vibe here is so relaxed and fun.",
    avatarColor: "#0369a1",
  },
  {
    name: "Kevin D.",
    initials: "KD",
    rating: 5,
    date: "June 2025",
    text: "Coastal Creations is a hidden gem in Ocean City. We stumbled in as walk-ins and had one of the most fun afternoons of our vacation. The staff is top-notch.",
    avatarColor: "#0c4a6e",
  },
];

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export async function getGoogleReviews(): Promise<PlacesReview[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const placeId = process.env.GOOGLE_PLACE_ID;

  if (!apiKey || !placeId) {
    return PLACEHOLDER_REVIEWS;
  }

  try {
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(placeId)}&fields=reviews&key=${apiKey}`,
      { next: { revalidate: 3600 } }
    );

    if (!res.ok) return PLACEHOLDER_REVIEWS;

    const data = (await res.json()) as {
      result?: { reviews?: Array<{ author_name: string; rating: number; text: string; relative_time_description: string }> };
    };

    const reviews = data?.result?.reviews;
    if (!reviews?.length) return PLACEHOLDER_REVIEWS;

    return reviews.map((r, i) => ({
      name: r.author_name,
      initials: getInitials(r.author_name),
      rating: r.rating,
      date: r.relative_time_description,
      text: r.text,
      avatarColor: AVATAR_COLORS[i % AVATAR_COLORS.length],
    }));
  } catch {
    return PLACEHOLDER_REVIEWS;
  }
}
