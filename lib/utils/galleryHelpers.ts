import type { GalleryDestination } from "@/types/interfaces";

/**
 * Get user-friendly display name for a gallery destination
 */
export function getGalleryDestinationDisplayName(
  destination: string
): string {
  const displayNames: Record<string, string> = {
    "adult-class": "Adult Classes",
    "kid-class": "Child Classes",
    event: "Events",
    camp: "Summer Camps",
    artist: "Live Artist Sessions",
    "private-event": "Private Events",
    reservation: "Reservations",
    "home-page": "Home Page",
    "default-gallery": "General Gallery",
  };

  return displayNames[destination] || destination;
}

/**
 * Get all available gallery destinations
 */
export function getAllGalleryDestinations(): Array<{
  value: GalleryDestination;
  label: string;
}> {
  return [
    { value: "adult-class", label: "Adult Classes" },
    { value: "kid-class", label: "Child Classes" },
    { value: "event", label: "Events" },
    { value: "camp", label: "Summer Camps" },
    { value: "artist", label: "Live Artist Sessions" },
    { value: "private-event", label: "Private Events" },
    { value: "reservation", label: "Reservations" },
    { value: "home-page", label: "Home Page" },
    { value: "default-gallery", label: "General Gallery" },
  ];
}

/**
 * Build Sanity GROQ query for fetching gallery images
 * @param destinations - Optional array of destinations to filter by
 * @returns GROQ query string
 */
export function buildGalleryQuery(destinations?: string[]): string {
  if (!destinations || destinations.length === 0) {
    return `*[_type == "pictureGallery"] | order(_createdAt desc)`;
  }

  // Build filter condition for destinations
  // Check if any of the requested destinations exist in the destination array
  const destinationFilters = destinations
    .map((dest) => `"${dest}" in destination`)
    .join(" || ");

  return `*[_type == "pictureGallery" && (${destinationFilters})] | order(_createdAt desc)`;
}

/**
 * Validate gallery destinations
 */
export function isValidGalleryDestination(
  destination: string
): destination is GalleryDestination {
  const validDestinations: string[] = [
    "adult-class",
    "kid-class",
    "event",
    "camp",
    "artist",
    "private-event",
    "reservation",
    "home-page",
    "default-gallery",
  ];
  return validDestinations.includes(destination);
}

/**
 * Filter gallery items by destinations
 */
export function filterGalleryItemsByDestination<T extends { destination?: string[] }>(
  items: T[],
  destinations: string[]
): T[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  if (!destinations || destinations.length === 0) {
    return items;
  }

  return items.filter((item) =>
    item && item.destination && Array.isArray(item.destination) &&
    item.destination.some((dest) => destinations.includes(dest))
  );
}

/**
 * Get unique destinations from gallery items
 */
export function getUniqueDestinationsFromItems<T extends { destination?: string[] }>(
  items: T[]
): string[] {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  const allDestinations = items
    .filter((item) => item && item.destination && Array.isArray(item.destination))
    .flatMap((item) => item.destination);
  return Array.from(new Set(allDestinations)).sort();
}

/**
 * Count items by destination
 */
export function countItemsByDestination<T extends { destination?: string[] }>(
  items: T[]
): Record<string, number> {
  const counts: Record<string, number> = {};

  if (!items || !Array.isArray(items)) {
    return counts;
  }

  items.forEach((item) => {
    // Check if destination exists and is an array
    if (item && item.destination && Array.isArray(item.destination)) {
      item.destination.forEach((dest) => {
        counts[dest] = (counts[dest] || 0) + 1;
      });
    }
  });

  return counts;
}
