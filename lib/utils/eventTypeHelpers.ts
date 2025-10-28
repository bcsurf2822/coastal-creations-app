/**
 * Event type utilities for handling migration from old to new event types
 */

export type OldEventType = "class" | "workshop";
export type NewEventType = "adult-class" | "kid-class" | "event" | "camp" | "artist";
export type EventType = OldEventType | NewEventType;

/**
 * Maps old event types to new event types
 * This provides a default mapping for migration purposes
 */
export const EVENT_TYPE_MIGRATION_MAP: Record<OldEventType, NewEventType> = {
  class: "adult-class",
  workshop: "event",
};

/**
 * Normalizes an event type to the new format
 * If the type is already new, returns it as-is
 * If the type is old, maps it to the new format
 */
export function normalizeEventType(eventType: string): NewEventType {
  // If it's already a new type, return it
  if (
    eventType === "adult-class" ||
    eventType === "kid-class" ||
    eventType === "event" ||
    eventType === "camp" ||
    eventType === "artist"
  ) {
    return eventType as NewEventType;
  }

  // If it's an old type, map it to new type
  if (eventType === "class" || eventType === "workshop") {
    return EVENT_TYPE_MIGRATION_MAP[eventType as OldEventType];
  }

  // Fallback to adult-class if unknown
  console.warn(`[normalizeEventType] Unknown event type: ${eventType}, defaulting to adult-class`);
  return "adult-class";
}

/**
 * Checks if an event type is an old/legacy type that needs migration
 */
export function isLegacyEventType(eventType: string): boolean {
  return eventType === "class" || eventType === "workshop";
}

/**
 * Gets a display name for an event type
 */
export function getEventTypeDisplayName(eventType: string): string {
  const normalized = normalizeEventType(eventType);

  const displayNames: Record<NewEventType, string> = {
    "adult-class": "Adult Class",
    "kid-class": "Kid Class",
    event: "Event",
    camp: "Camp",
    artist: "Live Artist Event",
  };

  return displayNames[normalized] || "Event";
}

/**
 * Filters events by type, handling both old and new event types
 * This allows the filter to work during the migration period
 */
export function matchesEventTypeFilter(
  eventType: string,
  targetType: NewEventType | NewEventType[]
): boolean {
  const normalized = normalizeEventType(eventType);

  if (Array.isArray(targetType)) {
    return targetType.includes(normalized);
  }

  return normalized === targetType;
}
