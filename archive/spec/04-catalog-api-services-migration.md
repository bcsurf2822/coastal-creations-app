# PRP: Square Catalog API Integration - Services (Phase 1: Read-Only Test)

## Cost
**FREE - No Square subscription required. The Catalog API has no fees.**

## Goal
Add Square Catalog API integration to display services/classes created in Square Dashboard. This is an **additive** feature - the existing MongoDB-based event system remains fully functional and unchanged.

## Important: Non-Destructive Approach
**DO NOT** remove or modify the existing MongoDB Event, PrivateEvent, or Reservations models. The existing system continues to work exactly as-is. This integration adds a NEW way to manage services via Square while keeping the current system as a fallback and reference.

## Why
- **Centralized Management**: Business owner can manage services in Square Dashboard (familiar interface)
- **Single Source**: Eventually reduces duplication between Square and MongoDB
- **Mobile Access**: Use Square app on phone to update services
- **Reporting**: Sales data linked to catalog items in Square
- **Reference Implementation**: Existing MongoDB system serves as a guide for required features

## What
Create a parallel system that reads services from Square Catalog API. The business owner can add classes/services in Square Dashboard and they'll appear on a new test page in the app.

### Phase 1 Success Criteria (This PRP)
- [ ] Test page at `/test/square-catalog` displays items from Square Catalog
- [ ] Can view services created in Square Dashboard
- [ ] Existing event system continues to work unchanged
- [ ] Admin can view Square catalog items at `/admin/dashboard/square-catalog`

### Future Phases (Not in this PRP)
- Phase 2: Create/Edit services from admin dashboard
- Phase 3: Bi-directional sync with MongoDB
- Phase 4: Full migration (optional)

## All Needed Context

### Documentation & References
```yaml
- url: https://developer.squareup.com/docs/catalog-api/use-the-api
  why: Core Catalog API concepts and workflows
  critical: Understand Item -> ItemVariation hierarchy

- url: https://developer.squareup.com/reference/square/catalog-api
  why: Complete API reference

- file: lib/models/Event.ts
  why: Reference for what fields/features are needed (DO NOT MODIFY)

- file: lib/models/PrivateEvent.ts
  why: Reference for private event structure (DO NOT MODIFY)

- file: lib/square/gift-cards.ts
  why: Example of existing Square API integration pattern
```

### Current Codebase Tree (relevant files - DO NOT MODIFY THESE)
```bash
coastal-creations-app/
├── lib/
│   └── models/
│       ├── Event.ts              # KEEP AS-IS - reference only
│       ├── PrivateEvent.ts       # KEEP AS-IS - reference only
│       └── Reservations.ts       # KEEP AS-IS - reference only
├── app/
│   ├── api/
│   │   ├── events/
│   │   │   └── route.ts          # KEEP AS-IS - existing event API
│   │   └── reservations/
│   │       └── route.ts          # KEEP AS-IS - existing reservations
│   └── events/
│       ├── page.tsx              # KEEP AS-IS - existing events page
│       └── [id]/
│           └── page.tsx          # KEEP AS-IS - existing event detail
```

### Desired Codebase Tree (NEW files only)
```bash
coastal-creations-app/
├── lib/
│   └── square/
│       └── catalog.ts            # NEW - Catalog service (read operations)
├── app/
│   ├── api/
│   │   └── square/
│   │       └── catalog/
│   │           └── route.ts      # NEW - List catalog items API
│   ├── test/
│   │   └── square-catalog/
│   │       └── page.tsx          # NEW - Test page for catalog display
│   └── admin/
│       └── dashboard/
│           └── square-catalog/
│               └── page.tsx      # NEW - Admin view of Square catalog
├── components/
│   └── square-catalog/
│       ├── CatalogItemCard.tsx   # NEW - Display card for catalog item
│       └── CatalogItemList.tsx   # NEW - List of catalog items
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Catalog hierarchy
// CatalogItem (parent) contains CatalogItemVariation (child)
// Item = "Pottery Class", Variation = specific pricing/config
// For services: one Item, one Variation typically

// GOTCHA: Catalog uses BigInt for money
// price_money.amount is BigInt, not number
// Must convert: Number(price.amount) for JS usage

// GOTCHA: Images are separate CatalogObjects
// Must include related objects to get image URLs

// PATTERN: Use searchCatalogObjects for listing
// Filter by objectTypes: ["ITEM"]
// includeRelatedObjects: true for images

// SQUARE SDK: Using "square/legacy" import pattern
// Same as existing gift-cards.ts implementation
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// lib/square/catalog.ts - Types

export interface CatalogServiceItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  variation: {
    id: string;
    priceCents: number;
  };
  customAttributes: {
    maxParticipants?: number;
    skillLevel?: string;
    suppliesIncluded?: boolean;
    durationMinutes?: number;
    eventType?: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}
```

### List of Tasks

```yaml
# ============================================
# PHASE 1: Read-Only Catalog Integration
# ============================================

Task 1:
CREATE lib/square/catalog.ts:
  - Initialize Square client (same pattern as gift-cards.ts)
  - CatalogService class with:
    - listServices() - get all catalog items
    - getServiceById() - single item with details
  - Transform Square response to CatalogServiceItem shape
  - Handle BigInt to number conversion for prices
  - Handle image URL extraction from related objects
  - Export singleton instance

Task 2:
CREATE app/api/square/catalog/route.ts:
  - GET: List all services from Square Catalog
  - Query params: ?type= (filter by custom attribute)
  - Return transformed CatalogServiceItem array
  - Handle errors gracefully
  - No auth required for read (public)

Task 3:
CREATE components/square-catalog/CatalogItemCard.tsx:
  - Display single catalog item
  - Show: image, name, description, price
  - Match existing EventCard styling for consistency
  - Handle missing image gracefully

Task 4:
CREATE components/square-catalog/CatalogItemList.tsx:
  - Grid display of CatalogItemCard components
  - Loading state
  - Empty state message
  - Error handling

Task 5:
CREATE app/test/square-catalog/page.tsx:
  - Test page to verify catalog integration
  - Fetch from /api/square/catalog
  - Display using CatalogItemList
  - Show raw data for debugging
  - Link back to main site

Task 6:
CREATE app/admin/dashboard/square-catalog/page.tsx:
  - Admin-only page (use existing auth pattern)
  - Display all catalog items
  - Show more details than public view
  - Link to Square Dashboard for editing
  - Refresh button to re-fetch

Task 7:
VERIFY integration:
  - Run TypeScript check
  - Run ESLint
  - Test API endpoint manually
  - Verify test page displays items
  - Ensure existing events system still works
```

### Task 1 Pseudocode: Catalog Service

```typescript
// lib/square/catalog.ts
import { Client, Environment } from "square/legacy";

// Initialize Square client (same pattern as gift-cards.ts)
const squareClient = new Client({
  accessToken: process.env.ACCESS_TOKEN,
  environment:
    process.env.SQUARE_ENVIRONMENT === "sandbox"
      ? Environment.Sandbox
      : Environment.Production,
});

const catalogApi = squareClient.catalogApi;

export interface CatalogServiceItem {
  id: string;
  name: string;
  description?: string;
  imageUrl?: string;
  variation: {
    id: string;
    priceCents: number;
  };
  customAttributes: {
    maxParticipants?: number;
    skillLevel?: string;
    suppliesIncluded?: boolean;
    durationMinutes?: number;
    eventType?: string;
  };
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export class CatalogService {
  private locationId: string;

  constructor() {
    this.locationId = process.env.NEXT_PUBLIC_SQUARE_LOCATION_ID ||
                      process.env.SQUARE_LOCATION_ID || "";
  }

  /**
   * List all catalog items (services/classes)
   */
  async listServices(): Promise<CatalogServiceItem[]> {
    console.log("[CATALOG-listServices] Fetching catalog items");

    const response = await catalogApi.searchCatalogObjects({
      objectTypes: ["ITEM"],
      includeRelatedObjects: true, // Get images
    });

    const items = response.result.objects || [];
    const relatedObjects = response.result.relatedObjects || [];

    // Build image lookup map
    const imageMap = new Map<string, string>();
    for (const obj of relatedObjects) {
      if (obj.type === "IMAGE" && obj.imageData?.url) {
        imageMap.set(obj.id, obj.imageData.url);
      }
    }

    // Transform items
    return items.map((item) => this.transformItem(item, imageMap));
  }

  /**
   * Get single catalog item by ID
   */
  async getServiceById(catalogId: string): Promise<CatalogServiceItem | null> {
    console.log("[CATALOG-getServiceById] Fetching item:", catalogId);

    try {
      const response = await catalogApi.retrieveCatalogObject(
        catalogId,
        true // includeRelatedObjects
      );

      const item = response.result.object;
      if (!item || item.type !== "ITEM") return null;

      // Build image map from related objects
      const imageMap = new Map<string, string>();
      for (const obj of response.result.relatedObjects || []) {
        if (obj.type === "IMAGE" && obj.imageData?.url) {
          imageMap.set(obj.id, obj.imageData.url);
        }
      }

      return this.transformItem(item, imageMap);
    } catch (error) {
      console.error("[CATALOG-getServiceById] Error:", error);
      return null;
    }
  }

  /**
   * Transform Square catalog item to our interface
   */
  private transformItem(
    item: Record<string, unknown>,
    imageMap: Map<string, string>
  ): CatalogServiceItem {
    const itemData = item.itemData as Record<string, unknown> | undefined;
    const variations = itemData?.variations as Array<Record<string, unknown>> | undefined;
    const variation = variations?.[0];
    const variationData = variation?.itemVariationData as Record<string, unknown> | undefined;
    const priceMoney = variationData?.priceMoney as { amount?: bigint } | undefined;

    const imageIds = itemData?.imageIds as string[] | undefined;
    const imageId = imageIds?.[0];

    // Parse custom attributes if present
    const customAttrs = itemData?.customAttributeValues as Record<string, {
      numberValue?: string;
      stringValue?: string;
      booleanValue?: boolean;
    }> | undefined;

    return {
      id: item.id as string,
      name: (itemData?.name as string) || "",
      description: itemData?.description as string | undefined,
      imageUrl: imageId ? imageMap.get(imageId) : undefined,
      variation: {
        id: (variation?.id as string) || "",
        priceCents: Number(priceMoney?.amount || 0),
      },
      customAttributes: {
        maxParticipants: customAttrs?.max_participants?.numberValue
          ? parseInt(customAttrs.max_participants.numberValue)
          : undefined,
        skillLevel: customAttrs?.skill_level?.stringValue,
        suppliesIncluded: customAttrs?.supplies_included?.booleanValue,
        durationMinutes: customAttrs?.duration_minutes?.numberValue
          ? parseInt(customAttrs.duration_minutes.numberValue)
          : undefined,
        eventType: customAttrs?.event_type?.stringValue,
      },
      isActive: item.presentAtAllLocations !== false,
      createdAt: item.createdAt as string | undefined,
      updatedAt: item.updatedAt as string | undefined,
    };
  }
}

// Export singleton instance
export const catalogService = new CatalogService();
```

### Task 2 Pseudocode: API Route

```typescript
// app/api/square/catalog/route.ts
import { NextResponse } from "next/server";
import { catalogService } from "@/lib/square/catalog";

export async function GET(request: Request): Promise<Response> {
  try {
    console.log("[API-SQUARE-CATALOG] Fetching catalog items");

    const services = await catalogService.listServices();

    console.log("[API-SQUARE-CATALOG] Found", services.length, "items");

    return NextResponse.json({
      success: true,
      services,
      count: services.length,
    });
  } catch (error) {
    console.error("[API-SQUARE-CATALOG] Error:", error);

    const message = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: "Failed to fetch catalog", message },
      { status: 500 }
    );
  }
}
```

### Task 3 Pseudocode: Catalog Item Card

```typescript
// components/square-catalog/CatalogItemCard.tsx
"use client";

import { ReactElement } from "react";
import Image from "next/image";

interface CatalogItemCardProps {
  item: {
    id: string;
    name: string;
    description?: string;
    imageUrl?: string;
    variation: {
      priceCents: number;
    };
    customAttributes: {
      durationMinutes?: number;
      skillLevel?: string;
    };
  };
}

export default function CatalogItemCard({ item }: CatalogItemCardProps): ReactElement {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        {item.imageUrl ? (
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            className="object-cover"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.name}</h3>

        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        )}

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold text-primary">
            ${(item.variation.priceCents / 100).toFixed(2)}
          </span>

          <div className="flex gap-2 text-xs text-gray-500">
            {item.customAttributes.durationMinutes && (
              <span>{item.customAttributes.durationMinutes} min</span>
            )}
            {item.customAttributes.skillLevel && (
              <span className="capitalize">{item.customAttributes.skillLevel}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Task 5 Pseudocode: Test Page

```typescript
// app/test/square-catalog/page.tsx
import { ReactElement } from "react";
import Link from "next/link";
import CatalogItemCard from "@/components/square-catalog/CatalogItemCard";

async function getCatalogItems() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/square/catalog`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch catalog");
  }

  return res.json();
}

export default async function SquareCatalogTestPage(): Promise<ReactElement> {
  let data;
  let error;

  try {
    data = await getCatalogItems();
  } catch (e) {
    error = e instanceof Error ? e.message : "Unknown error";
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-primary hover:underline text-sm">
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-800 mt-4">
            Square Catalog Test Page
          </h1>
          <p className="text-gray-600 mt-2">
            This page displays items from the Square Catalog API.
            Add items in Square Dashboard to see them here.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Results */}
        {data && (
          <>
            <div className="mb-4 text-sm text-gray-500">
              Found {data.count} items in catalog
            </div>

            {data.services.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-lg">
                <strong>No items found.</strong> Add items in Square Dashboard to see them here.
                <br />
                <a
                  href="https://squareup.com/dashboard/items"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-700 hover:underline mt-2 inline-block"
                >
                  Open Square Dashboard
                </a>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {data.services.map((item: any) => (
                  <CatalogItemCard key={item.id} item={item} />
                ))}
              </div>
            )}

            {/* Debug Info */}
            <details className="mt-8">
              <summary className="cursor-pointer text-gray-500 hover:text-gray-700">
                Show Raw API Response
              </summary>
              <pre className="mt-4 bg-gray-800 text-gray-100 p-4 rounded-lg overflow-auto text-xs">
                {JSON.stringify(data, null, 2)}
              </pre>
            </details>
          </>
        )}
      </div>
    </div>
  );
}
```

### Task 6 Pseudocode: Admin Page

```typescript
// app/admin/dashboard/square-catalog/page.tsx
import { Metadata } from "next";
import { ReactElement } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Square Catalog | Admin Dashboard",
  description: "View and manage services from Square Catalog",
};

async function getCatalogItems() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/square/catalog`, {
    cache: "no-store",
  });

  if (!res.ok) return { services: [], count: 0, error: "Failed to fetch" };
  return res.json();
}

export default async function AdminSquareCatalogPage(): Promise<ReactElement> {
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/admin");
  }

  const data = await getCatalogItems();

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Square Catalog</h1>
            <p className="text-gray-600 mt-1">
              Services and classes from Square. Edit these in Square Dashboard.
            </p>
          </div>
          <a
            href="https://squareup.com/dashboard/items"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
          >
            Open Square Dashboard
          </a>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Items</p>
          <p className="text-2xl font-bold text-gray-800">{data.count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Active</p>
          <p className="text-2xl font-bold text-green-600">
            {data.services?.filter((s: any) => s.isActive).length || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Inactive</p>
          <p className="text-2xl font-bold text-gray-400">
            {data.services?.filter((s: any) => !s.isActive).length || 0}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Price
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                ID
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.services?.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                  No items in catalog. Add items in Square Dashboard.
                </td>
              </tr>
            ) : (
              data.services?.map((item: any) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-4">
                    <div className="flex items-center">
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt=""
                          className="w-10 h-10 rounded object-cover mr-3"
                        />
                      )}
                      <div>
                        <div className="font-medium text-gray-900">{item.name}</div>
                        {item.description && (
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {item.description}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-medium">
                    ${(item.variation.priceCents / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      item.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}>
                      {item.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400 font-mono">
                    {item.id.slice(0, 20)}...
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Help Section */}
      <div className="mt-8 bg-blue-50 rounded-lg p-4">
        <h3 className="font-semibold text-blue-800 mb-2">How to Add Services</h3>
        <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
          <li>Open Square Dashboard (button above)</li>
          <li>Go to Items &gt; Create Item</li>
          <li>Enter name, description, and price</li>
          <li>Upload an image (optional)</li>
          <li>Save - it will appear here automatically</li>
        </ol>
      </div>
    </div>
  );
}
```

## Validation Loop

### Level 1: Syntax & Style
```bash
cd /Users/benjamincorbett/code/cedesigns/coastal-creations-app

npx tsc --noEmit
npm run lint

# Expected: No errors
```

### Level 2: Manual API Test
```bash
# Start dev server
npm run dev

# Test API endpoint
curl http://localhost:3000/api/square/catalog

# Expected: {"success": true, "services": [...], "count": N}
```

### Level 3: Visual Verification
```bash
# Visit test page
open http://localhost:3000/test/square-catalog

# Visit admin page (must be logged in)
open http://localhost:3000/admin/dashboard/square-catalog

# Verify:
# 1. Items from Square Dashboard appear
# 2. Images display correctly
# 3. Prices show correctly
# 4. No errors in console
```

### Level 4: Existing System Check
```bash
# Verify existing events still work
open http://localhost:3000/events/adult-classes
open http://localhost:3000/admin/dashboard

# Expected: No changes to existing functionality
```

## Final Validation Checklist

### Code Quality
- [ ] No TypeScript errors: `npx tsc --noEmit`
- [ ] No linting errors: `npm run lint`
- [ ] Build succeeds: `npm run build`

### New Square Catalog Features
- [ ] API endpoint `/api/square/catalog` returns items
- [ ] Test page `/test/square-catalog` displays items
- [ ] Admin page `/admin/dashboard/square-catalog` shows table
- [ ] Items created in Square Dashboard appear in app
- [ ] Images from Square display correctly
- [ ] Prices convert from cents to dollars correctly

### Existing System (MUST NOT BREAK)
- [ ] Events pages still work (`/events/*`)
- [ ] Admin dashboard still works (`/admin/dashboard`)
- [ ] Add event form still works
- [ ] Reservations system still works
- [ ] All existing API routes still work

---

## Anti-Patterns to Avoid
- DO NOT modify existing Event or PrivateEvent models
- DO NOT modify existing event API routes
- DO NOT modify existing event pages
- DO NOT hardcode catalog item IDs
- DO NOT skip BigInt conversion for prices
- DO NOT cache catalog data indefinitely (Square can change it)

## Future Phases (Not in this PRP)

### Phase 2: Create/Edit from Admin
- Add forms to create/edit catalog items from admin
- Image upload directly in app
- Modifier list management

### Phase 3: Bi-directional Sync
- Sync MongoDB events to Square Catalog
- Webhook for Square changes
- Conflict resolution

### Phase 4: Full Migration (Optional)
- Replace MongoDB events with Square Catalog
- Update all event pages to use catalog
- Migration script for existing data
