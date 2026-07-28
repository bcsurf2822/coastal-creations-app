# PRP: Catalog API Migration - Events & Services (PAID - Enables Bookings Integration)

## Subscription Requirement
**The Catalog API itself is free, but this PRP is in the "paid" folder because it's a prerequisite for the Bookings API integration (which requires Square Appointments Plus/Premium). If only using Catalog for product/service display without bookings, no subscription is required.**

## Goal
Migrate art class events and private event types from MongoDB to Square Catalog API, enabling the business owner to manage services, pricing, and options directly from Square Dashboard while the website automatically reflects changes.

## Why
- **Single Source of Truth**: Prices, descriptions, and options managed in Square Dashboard
- **No Code Deploys**: Business owner can add/modify/disable events without developer
- **Bookings Integration**: Catalog services required for Square Bookings API
- **Inventory Ready**: If selling physical items later (art supplies, prints), Catalog supports it
- **Reporting**: Sales reports in Square show itemized data
- **Modifiers**: Options like "Canvas Size" or "Paint Type" as catalog modifiers

## What
Replace MongoDB Event and PrivateEvent models with Square Catalog items. The website fetches events from Square Catalog API instead of MongoDB, and all management happens in Square Dashboard.

### Success Criteria
- [ ] All events exist as Catalog items in Square
- [ ] Event prices, descriptions, and images managed in Square Dashboard
- [ ] Website displays events from Catalog API (not MongoDB)
- [ ] Options (paint color, canvas size) as Catalog modifiers
- [ ] Business owner can create new events via Dashboard
- [ ] Disabled events hidden from website automatically
- [ ] MongoDB Event/PrivateEvent models deprecated

## All Needed Context

### Documentation & References
```yaml
- url: https://developer.squareup.com/docs/catalog-api/use-the-api
  why: Core Catalog API concepts and workflows
  critical: Understand Item -> ItemVariation hierarchy

- url: https://developer.squareup.com/reference/square/catalog-api
  why: Complete API reference

- url: https://developer.squareup.com/docs/catalog-api/create-catalog-objects
  why: Creating items, variations, and modifiers
  critical: Batch upsert for bulk operations

- url: https://developer.squareup.com/docs/catalog-api/create-modify-modifiers
  why: Modifier lists and options (for class customizations)

- file: lib/models/Event.ts
  why: Current event model to understand data mapping

- file: lib/models/PrivateEvent.ts
  why: Private event model - similar structure

- file: app/api/events/route.ts
  why: Current event API to replace
```

### Current Codebase Tree (relevant files)
```bash
coastal-creations-app/
├── lib/
│   └── models/
│       ├── Event.ts              # TO BE REPLACED
│       └── PrivateEvent.ts       # TO BE REPLACED
├── app/
│   ├── api/
│   │   ├── events/
│   │   │   └── route.ts          # TO BE REPLACED
│   │   └── private-events/
│   │       └── route.ts          # TO BE REPLACED
│   └── events/
│       ├── page.tsx              # Events listing
│       └── [id]/
│           └── page.tsx          # Event detail/booking
```

### Desired Codebase Tree
```bash
coastal-creations-app/
├── lib/
│   └── square/
│       ├── catalog.ts            # NEW - Catalog service
│       └── types/
│           └── catalog.ts        # NEW - Catalog types
├── app/
│   └── api/
│       └── square/
│           └── catalog/
│               ├── route.ts      # NEW - List catalog items
│               ├── [id]/
│               │   └── route.ts  # NEW - Get single item
│               ├── services/
│               │   └── route.ts  # NEW - List appointment services
│               └── migrate/
│                   └── route.ts  # NEW - Migration script
├── components/
│   └── events/
│       ├── EventCard.tsx         # MODIFY - use catalog data
│       ├── EventDetail.tsx       # MODIFY - use catalog data
│       └── EventOptions.tsx      # NEW - render modifiers
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Catalog hierarchy
// CatalogItem (parent) contains CatalogItemVariation (child)
// Item = "Pottery Class", Variation = specific instance with price
// For services: one Item, one Variation per service

// CRITICAL: For Bookings integration, services must have:
// - item_type: "APPOINTMENTS_SERVICE" on the variation
// - service_duration: duration in milliseconds
// - available_for_booking: true

// GOTCHA: Catalog uses BigInt for money
// price_money.amount is BigInt, not number
// Must convert: Number(price.amount) for JS usage

// GOTCHA: Images are separate CatalogObjects
// Image uploaded first, returns image_id
// Then link to item via image_ids array

// PATTERN: Use custom attributes for extra data
// custom_attribute_values can store our specific fields
// Example: max_participants, skill_level, supplies_included

// GOTCHA: Catalog changes are eventually consistent
// After update, may take a few seconds to propagate
// Use retrieved item, not cached version

// PATTERN: Modifiers for class options
// ModifierList = "Canvas Size"
// Modifiers = "8x10", "11x14", "16x20" with price adjustments
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// lib/square/types/catalog.ts

// Mapping from MongoDB Event to Square Catalog
export interface EventToCatalogMapping {
  // Event.title -> CatalogItem.name
  // Event.description -> CatalogItem.description
  // Event.price -> CatalogItemVariation.price_money.amount (in cents)
  // Event.imageUrl -> CatalogImage (separate object)
  // Event.maxParticipants -> custom_attribute_values.max_participants
  // Event.isActive -> CatalogItem.present_at_all_locations (or absent)
  // Event.dates -> NOT in Catalog (use Bookings availability)
  // Event.options -> CatalogModifierList + CatalogModifier
}

export interface CatalogEventItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  variation: {
    id: string;
    priceCents: number;
    serviceDurationMinutes?: number;  // For bookings
  };
  customAttributes?: {
    maxParticipants?: number;
    skillLevel?: string;
    suppliesIncluded?: boolean;
    eventType?: "regular" | "private";
  };
  modifiers?: CatalogModifierList[];
  isActive: boolean;
}

export interface CatalogModifierList {
  id: string;
  name: string;  // "Canvas Size"
  selectionType: "SINGLE" | "MULTIPLE";
  modifiers: CatalogModifier[];
}

export interface CatalogModifier {
  id: string;
  name: string;           // "16x20"
  priceCents: number;     // Additional cost (can be 0)
}

export interface CreateEventInput {
  name: string;
  description: string;
  priceCents: number;
  durationMinutes: number;
  maxParticipants: number;
  imageUrl?: string;
  modifierLists?: string[];  // IDs of modifier lists to attach
}
```

### List of Tasks

```yaml
Task 0 (PREREQUISITE - Manual):
UNDERSTAND Square Dashboard Catalog:
  - Navigate: Square Dashboard > Items > Services
  - Create test service manually to understand fields
  - Note: Services appear as ITEM_VARIATION with item_type=APPOINTMENTS_SERVICE

Task 1:
CREATE lib/square/catalog.ts:
  - Implement CatalogService class
  - listEvents() - get all event-type items
  - getEventById() - single event with variations
  - createEvent() - create new catalog item + variation
  - updateEvent() - update existing item
  - deactivateEvent() - remove from locations (soft delete)
  - listModifierLists() - get available modifiers

Task 2:
CREATE app/api/square/catalog/route.ts:
  - GET: List all events (catalog items)
  - POST: Create new event (admin only)
  - Filter: Only return active, relevant items

Task 3:
CREATE app/api/square/catalog/[id]/route.ts:
  - GET: Single event detail
  - PUT: Update event (admin only)
  - DELETE: Deactivate event (admin only)

Task 4:
CREATE app/api/square/catalog/services/route.ts:
  - GET: List bookable services specifically
  - Used by: Bookings integration
  - Returns: service ID, name, duration, price

Task 5:
MODIFY components/events/EventCard.tsx:
  - FIND: Props expecting MongoDB Event shape
  - REPLACE: With CatalogEventItem shape
  - UPDATE: Price display (cents to dollars)
  - UPDATE: Image URL handling

Task 6:
MODIFY components/events/EventDetail.tsx:
  - FIND: Event detail rendering
  - REPLACE: Data source with Catalog item
  - ADD: Modifier selection UI if modifiers exist

Task 7:
CREATE components/events/EventOptions.tsx:
  - Render modifier lists as selection UI
  - Handle SINGLE vs MULTIPLE selection types
  - Calculate total price with modifier adjustments

Task 8:
MODIFY app/events/page.tsx:
  - FIND: MongoDB event fetch
  - REPLACE: With Catalog API fetch
  - UPDATE: Component props to match new data shape

Task 9:
MODIFY app/events/[id]/page.tsx:
  - FIND: Single event fetch by ID
  - REPLACE: With Catalog API fetch
  - UPDATE: Booking flow to use catalog variation ID

Task 10:
CREATE app/api/square/catalog/migrate/route.ts:
  - POST: One-time migration script
  - Query MongoDB events
  - Create Catalog items for each
  - Upload images if exist
  - Create modifiers for options
  - Log migration results

Task 11 (CLEANUP - After verification):
DEPRECATE MongoDB Events:
  - Remove lib/models/Event.ts
  - Remove lib/models/PrivateEvent.ts
  - Remove app/api/events/route.ts
  - Update any remaining references
```

### Task 1 Pseudocode: Catalog Service

```typescript
// lib/square/catalog.ts
import { Client, ApiError } from "square";
import { randomUUID } from "crypto";
import { getSquareClient } from "./client";

export class CatalogService {
  private client: Client;
  private locationId: string;

  constructor() {
    this.client = getSquareClient();
    this.locationId = process.env.SQUARE_LOCATION_ID!;
  }

  // List all events (catalog items of type service)
  async listEvents(): Promise<CatalogEventItem[]> {
    const response = await this.client.catalogApi.searchCatalogObjects({
      objectTypes: ["ITEM"],
      query: {
        prefixQuery: {
          attributeName: "name",
          attributePrefix: "", // Get all
        },
      },
      includeRelatedObjects: true, // Get variations and images
    });

    const items = response.result.objects || [];
    const relatedObjects = response.result.relatedObjects || [];

    // Build lookup maps for related objects
    const imageMap = new Map<string, string>();
    const variationMap = new Map<string, any>();

    for (const obj of relatedObjects) {
      if (obj.type === "IMAGE") {
        imageMap.set(obj.id, obj.imageData?.url || "");
      }
      if (obj.type === "ITEM_VARIATION") {
        variationMap.set(obj.id, obj);
      }
    }

    // Transform to our shape
    return items
      .filter((item) => {
        // Filter to only service-type items
        const variation = item.itemData?.variations?.[0];
        return variation?.itemVariationData?.itemType === "APPOINTMENTS_SERVICE";
      })
      .map((item) => this.transformToCatalogEvent(item, imageMap, variationMap));
  }

  // Get single event by catalog ID
  async getEventById(catalogId: string): Promise<CatalogEventItem | null> {
    try {
      const response = await this.client.catalogApi.retrieveCatalogObject(
        catalogId,
        true // includeRelatedObjects
      );

      const item = response.result.object;
      if (!item || item.type !== "ITEM") return null;

      const relatedObjects = response.result.relatedObjects || [];
      const imageMap = new Map<string, string>();
      const variationMap = new Map<string, any>();

      for (const obj of relatedObjects) {
        if (obj.type === "IMAGE") {
          imageMap.set(obj.id, obj.imageData?.url || "");
        }
        if (obj.type === "ITEM_VARIATION") {
          variationMap.set(obj.id, obj);
        }
      }

      return this.transformToCatalogEvent(item, imageMap, variationMap);
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        return null;
      }
      throw error;
    }
  }

  // Create new event as catalog item + variation
  async createEvent(input: CreateEventInput): Promise<{ itemId: string; variationId: string }> {
    const itemId = `#item-${randomUUID()}`;
    const variationId = `#variation-${randomUUID()}`;

    const response = await this.client.catalogApi.upsertCatalogObject({
      idempotencyKey: randomUUID(),
      object: {
        type: "ITEM",
        id: itemId,
        presentAtAllLocations: true,
        itemData: {
          name: input.name,
          description: input.description,
          productType: "APPOINTMENTS_SERVICE",
          variations: [
            {
              type: "ITEM_VARIATION",
              id: variationId,
              itemVariationData: {
                name: input.name,
                pricingType: "FIXED_PRICING",
                priceMoney: {
                  amount: BigInt(input.priceCents),
                  currency: "USD",
                },
                serviceDuration: BigInt(input.durationMinutes * 60 * 1000), // ms
                availableForBooking: true,
                itemType: "APPOINTMENTS_SERVICE",
              },
            },
          ],
          // Custom attributes for our extra fields
          customAttributeValues: {
            max_participants: {
              stringValue: input.maxParticipants.toString(),
            },
          },
        },
      },
    });

    const createdItem = response.result.catalogObject!;
    const createdVariation = createdItem.itemData?.variations?.[0];

    return {
      itemId: createdItem.id,
      variationId: createdVariation?.id || "",
    };
  }

  // Helper to transform Square catalog item to our shape
  private transformToCatalogEvent(
    item: any,
    imageMap: Map<string, string>,
    variationMap: Map<string, any>
  ): CatalogEventItem {
    const variation = item.itemData?.variations?.[0];
    const imageId = item.itemData?.imageIds?.[0];

    return {
      id: item.id,
      name: item.itemData?.name || "",
      description: item.itemData?.description,
      imageUrl: imageId ? imageMap.get(imageId) : undefined,
      variation: {
        id: variation?.id || "",
        priceCents: Number(variation?.itemVariationData?.priceMoney?.amount || 0),
        serviceDurationMinutes: variation?.itemVariationData?.serviceDuration
          ? Number(variation.itemVariationData.serviceDuration) / 60000
          : undefined,
      },
      customAttributes: {
        maxParticipants: parseInt(
          item.itemData?.customAttributeValues?.max_participants?.stringValue || "0"
        ),
      },
      isActive: item.presentAtAllLocations || false,
    };
  }

  // Deactivate event (remove from all locations)
  async deactivateEvent(catalogId: string, version: bigint): Promise<void> {
    await this.client.catalogApi.upsertCatalogObject({
      idempotencyKey: randomUUID(),
      object: {
        type: "ITEM",
        id: catalogId,
        version,
        presentAtAllLocations: false,
        absentAtLocationIds: [this.locationId],
      },
    });
  }
}
```

### Task 7 Pseudocode: Event Options Component

```typescript
// components/events/EventOptions.tsx
"use client";

import React from "react";
import { CatalogModifierList, CatalogModifier } from "@/lib/square/types/catalog";

interface EventOptionsProps {
  modifierLists: CatalogModifierList[];
  selectedModifiers: Map<string, string[]>;  // listId -> selected modifier IDs
  onSelectionChange: (listId: string, modifierIds: string[]) => void;
  basePrice: number;  // in cents
}

export const EventOptions: React.FC<EventOptionsProps> = ({
  modifierLists,
  selectedModifiers,
  onSelectionChange,
  basePrice,
}) => {
  // Calculate total with selected modifiers
  const calculateTotal = (): number => {
    let total = basePrice;

    for (const list of modifierLists) {
      const selectedIds = selectedModifiers.get(list.id) || [];
      for (const modifier of list.modifiers) {
        if (selectedIds.includes(modifier.id)) {
          total += modifier.priceCents;
        }
      }
    }

    return total;
  };

  const handleModifierSelect = (
    list: CatalogModifierList,
    modifier: CatalogModifier
  ) => {
    const currentSelection = selectedModifiers.get(list.id) || [];

    if (list.selectionType === "SINGLE") {
      // Single select - replace selection
      onSelectionChange(list.id, [modifier.id]);
    } else {
      // Multiple select - toggle
      const newSelection = currentSelection.includes(modifier.id)
        ? currentSelection.filter((id) => id !== modifier.id)
        : [...currentSelection, modifier.id];
      onSelectionChange(list.id, newSelection);
    }
  };

  return (
    <div className="space-y-6">
      {modifierLists.map((list) => (
        <div key={list.id} className="border rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">
            {list.name}
            {list.selectionType === "SINGLE" && (
              <span className="text-sm text-gray-500 ml-2">(Choose one)</span>
            )}
          </h4>

          <div className="space-y-2">
            {list.modifiers.map((modifier) => {
              const isSelected = (
                selectedModifiers.get(list.id) || []
              ).includes(modifier.id);

              return (
                <button
                  key={modifier.id}
                  onClick={() => handleModifierSelect(list, modifier)}
                  className={`
                    w-full flex justify-between items-center p-3 rounded-md border
                    ${isSelected
                      ? "border-primary bg-primary/10"
                      : "border-gray-200 hover:border-gray-300"}
                  `}
                >
                  <span>{modifier.name}</span>
                  <span className="text-gray-600">
                    {modifier.priceCents > 0
                      ? `+$${(modifier.priceCents / 100).toFixed(2)}`
                      : "Included"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Total Display */}
      <div className="border-t pt-4 mt-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total</span>
          <span>${(calculateTotal() / 100).toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};
```

### Integration Points
```yaml
SQUARE_DASHBOARD:
  - Create services: Dashboard > Items > Services
  - Set prices: On each service item
  - Upload images: On each service item
  - Add modifiers: Dashboard > Items > Modifier Lists
  - Enable/disable: Toggle "Available at all locations"

BOOKINGS_INTEGRATION:
  - Services from Catalog are used in Bookings API
  - service_variation_id references Catalog item variation
  - Must set: item_type = APPOINTMENTS_SERVICE
  - Must set: available_for_booking = true

IMAGE_HANDLING:
  - Images uploaded separately via catalogApi.createCatalogImage
  - Returns image_id to link to item
  - Or: Use Dashboard to upload (easier)

CACHING:
  - Consider caching catalog items for performance
  - Catalog doesn't change frequently
  - Cache invalidation: webhook or time-based
```

## Validation Loop

### Level 1: Syntax & Style
```bash
cd /Users/benjamincorbett/code/cedesigns/coastal-creations-app

npx eslint lib/square/catalog.ts --fix
npx eslint components/events/*.tsx --fix
npx tsc --noEmit

# Expected: No errors
```

### Level 2: Unit Tests
```typescript
// __tests__/lib/square/catalog.test.ts
import { CatalogService } from "@/lib/square/catalog";

describe("CatalogService", () => {
  const service = new CatalogService();

  test.skip("listEvents returns service items", async () => {
    const events = await service.listEvents();
    expect(Array.isArray(events)).toBe(true);

    // Each event should have required fields
    for (const event of events) {
      expect(event.id).toBeDefined();
      expect(event.name).toBeDefined();
      expect(event.variation.priceCents).toBeGreaterThanOrEqual(0);
    }
  });

  test.skip("getEventById returns single event", async () => {
    const events = await service.listEvents();
    if (events.length === 0) return; // Skip if no events

    const event = await service.getEventById(events[0].id);
    expect(event).not.toBeNull();
    expect(event?.id).toBe(events[0].id);
  });

  test("transformToCatalogEvent handles missing fields gracefully", () => {
    const minimalItem = {
      id: "test-id",
      type: "ITEM",
      itemData: {
        name: "Test Item",
        variations: [
          {
            id: "var-id",
            itemVariationData: {
              priceMoney: { amount: BigInt(5000), currency: "USD" },
            },
          },
        ],
      },
    };

    // Should not throw
    const result = service["transformToCatalogEvent"](
      minimalItem,
      new Map(),
      new Map()
    );

    expect(result.id).toBe("test-id");
    expect(result.name).toBe("Test Item");
    expect(result.variation.priceCents).toBe(5000);
  });
});
```

### Level 3: Integration Test
```bash
# Prerequisites:
# 1. At least one service created in Square Dashboard

# Test listing events
curl http://localhost:3000/api/square/catalog

# Expected: {"events": [{"id": "xxx", "name": "Pottery Class", ...}]}

# Test single event
curl http://localhost:3000/api/square/catalog/CATALOG_ITEM_ID

# Expected: {"event": {"id": "xxx", "name": "Pottery Class", ...}}

# Verify website displays events:
# Navigate to /events page
# Should show events from Square Catalog
```

## Final Validation Checklist
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Events created in Square Dashboard appear in API
- [ ] Event detail page shows correct data
- [ ] Prices displayed correctly (cents to dollars conversion)
- [ ] Images load from Square CDN
- [ ] Modifiers selectable and affect total price
- [ ] Disabled events hidden from listing
- [ ] Migration script successfully transfers MongoDB events
- [ ] Bookings can use catalog service IDs

---

## Anti-Patterns to Avoid
- DO NOT hardcode catalog item IDs - fetch dynamically
- DO NOT skip BigInt conversion - prices are BigInt in Square
- DO NOT cache indefinitely - catalog can change in Dashboard
- DO NOT create duplicate items on migration - use idempotency keys
- DO NOT forget image upload is separate from item creation
- DO NOT assume all items are services - filter by item_type
