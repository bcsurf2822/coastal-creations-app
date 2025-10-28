/**
 * Converts a string to a URL-friendly slug
 * @param text - The text to slugify
 * @returns URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, and multiple hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Creates a slug with ID appended for uniqueness
 * @param eventName - The event name
 * @param eventId - The event ID
 * @returns Combined slug-id string
 */
export function createEventSlug(eventName: string, eventId: string): string {
  const slug = slugify(eventName);
  return `${slug}-${eventId}`;
}

/**
 * Extracts the event ID from a slug-id string
 * @param slugWithId - The combined slug-id string
 * @returns The event ID
 */
export function extractEventIdFromSlug(slugWithId: string): string {
  // The ID is the last segment after splitting by hyphen
  // MongoDB IDs are 24 characters, so we look for that pattern at the end
  const parts = slugWithId.split('-');
  const lastPart = parts[parts.length - 1];

  // Check if the last part looks like a MongoDB ObjectId (24 hex characters)
  if (lastPart.length === 24 && /^[a-f0-9]{24}$/i.test(lastPart)) {
    return lastPart;
  }

  // Fallback: return the whole string (for backward compatibility)
  return slugWithId;
}
