# PRP: Customer Directory Migration to Square

## Goal
Migrate customer data management from MongoDB to Square Customer Directory API, enabling the business owner to view and manage all customers directly from Square Dashboard while maintaining full functionality in the application.

## Why
- **Business Value**: Client can manage customers, view purchase history, and run marketing campaigns directly from Square Dashboard without technical assistance
- **Data Consolidation**: Single source of truth for customer data across all Square services (payments, bookings, gift cards)
- **Integration Benefits**: Enables seamless use of other Square features (loyalty, marketing, invoices)
- **Reduced Maintenance**: Offload customer data management to Square's managed service

## What
Replace MongoDB Customer model's billing/contact info storage with Square Customer Directory API while keeping local references for booking-specific data (participants, selected options, event references).

### Success Criteria
- [ ] All new customers created in Square Customer Directory
- [ ] Existing customers migrated to Square with squareCustomerId populated
- [ ] Customer lookup by email/phone works via Square API
- [ ] Payment processing links payments to Square customer profiles
- [ ] Business owner can view all customers in Square Dashboard
- [ ] No duplicate customers created for repeat bookings

## All Needed Context

### Documentation & References
```yaml
- url: https://developer.squareup.com/reference/square/customers-api
  why: Core API reference for CRUD operations on customers

- url: https://developer.squareup.com/docs/customers-api/use-the-api/keep-records
  why: Best practices for customer deduplication and record keeping

- file: lib/models/Customer.ts
  why: Current customer data model to understand migration mapping
  critical: billingInfo structure maps to Square customer fields

- file: app/api/customer/route.ts
  why: Current customer creation flow to modify

- file: components/payment/PaymentProcessor.tsx
  why: Payment flow that should link to Square customer
```

### Current Codebase Tree (relevant files)
```bash
coastal-creations-app/
├── lib/
│   ├── models/
│   │   └── Customer.ts          # MongoDB customer model (MODIFY)
│   └── square/
│       └── client.ts            # Square client setup (EXISTS)
├── app/
│   └── api/
│       ├── customer/
│       │   └── route.ts         # Customer creation (MODIFY)
│       └── square/
│           └── customers/
│               └── route.ts     # NEW - Square customer operations
├── components/
│   └── payment/
│       └── PaymentProcessor.tsx # Link payments to customers (MODIFY)
```

### Desired Codebase Tree
```bash
coastal-creations-app/
├── lib/
│   ├── models/
│   │   └── Customer.ts          # Keep for booking data, add squareCustomerId
│   └── square/
│       ├── client.ts            # Existing Square client
│       └── customers.ts         # NEW: Square Customer API wrapper
├── app/
│   └── api/
│       ├── customer/
│       │   └── route.ts         # Modified to create Square customer first
│       └── square/
│           └── customers/
│               ├── route.ts     # NEW: Create/search customers
│               ├── [id]/
│               │   └── route.ts # NEW: Get/update/delete customer
│               └── migrate/
│                   └── route.ts # NEW: One-time migration script
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Square requires idempotency keys for customer creation
// Use email hash or generate UUID to prevent duplicates

// CRITICAL: Square customer ID format is alphanumeric string
// Example: "JDKYHBWT1D4F8MFH63DBMEN8Y4"

// GOTCHA: Square deduplication is NOT automatic
// Must search by email/phone before creating new customer

// GOTCHA: Square field limits
// - given_name: max 300 chars
// - family_name: max 300 chars
// - email_address: must be valid format
// - phone_number: must be E.164 format (+1XXXXXXXXXX)

// PATTERN: Our billingInfo maps to Square Customer like this:
// billingInfo.firstName -> given_name
// billingInfo.lastName -> family_name
// billingInfo.emailAddress -> email_address
// billingInfo.phoneNumber -> phone_number
// billingInfo.addressLine1 -> address.address_line_1
// billingInfo.city -> address.locality
// billingInfo.stateProvince -> address.administrative_district_level_1
// billingInfo.postalCode -> address.postal_code
// billingInfo.country -> address.country
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// lib/square/types/customer.ts
export interface SquareCustomerInput {
  idempotencyKey: string;
  givenName: string;
  familyName: string;
  emailAddress?: string;
  phoneNumber?: string;
  address?: {
    addressLine1: string;
    addressLine2?: string;
    locality: string;  // city
    administrativeDistrictLevel1: string;  // state
    postalCode: string;
    country: string;
  };
  referenceId?: string;  // Our internal reference
  note?: string;
}

export interface SquareCustomer {
  id: string;
  createdAt: string;
  updatedAt: string;
  givenName?: string;
  familyName?: string;
  emailAddress?: string;
  phoneNumber?: string;
  address?: SquareAddress;
  referenceId?: string;
  note?: string;
}

// Update to existing ICustomer interface in lib/models/Customer.ts
// Add these fields (squareCustomerId already exists):
// - squareCustomerId: string (required after migration)
// - Keep billingInfo for local display/backup
```

### List of Tasks

```yaml
Task 1:
CREATE lib/square/customers.ts:
  - Create SquareCustomerService class
  - Implement createCustomer() with idempotency
  - Implement searchByEmail() for deduplication
  - Implement searchByPhone() for deduplication
  - Implement getCustomer() by ID
  - Implement updateCustomer()
  - PATTERN: Use existing Square client from lib/square/client.ts

Task 2:
CREATE app/api/square/customers/route.ts:
  - POST: Create or find existing customer
  - GET: Search customers by email/phone query param
  - Use SquareCustomerService from Task 1
  - Return squareCustomerId for linking

Task 3:
CREATE app/api/square/customers/[id]/route.ts:
  - GET: Retrieve single customer by Square ID
  - PUT: Update customer details
  - DELETE: Remove customer (soft delete recommended)

Task 4:
MODIFY app/api/customer/route.ts:
  - FIND: POST handler for customer creation
  - INJECT: Before MongoDB save, create/find Square customer
  - INJECT: Set squareCustomerId on MongoDB document
  - PRESERVE: All existing booking data handling

Task 5:
MODIFY components/payment/PaymentProcessor.tsx:
  - FIND: submitPayment call around line 312
  - INJECT: Pass squareCustomerId to payment API
  - This links payment to customer in Square Dashboard

Task 6:
CREATE app/api/square/customers/migrate/route.ts:
  - POST: One-time migration of existing MongoDB customers
  - Query all customers without squareCustomerId
  - Create Square customers for each
  - Update MongoDB with squareCustomerId
  - Log results for verification
```

### Task 1 Pseudocode: Square Customer Service

```typescript
// lib/square/customers.ts
import { Client, ApiError } from "square";
import { randomUUID } from "crypto";
import { getSquareClient } from "./client";

export class SquareCustomerService {
  private client: Client;

  constructor() {
    this.client = getSquareClient();
  }

  // CRITICAL: Always search before create to prevent duplicates
  async findOrCreateCustomer(input: {
    email?: string;
    phone?: string;
    firstName: string;
    lastName: string;
    address?: AddressInput;
  }): Promise<{ customerId: string; isNew: boolean }> {
    // Step 1: Search by email first
    if (input.email) {
      const existing = await this.searchByEmail(input.email);
      if (existing) return { customerId: existing.id, isNew: false };
    }

    // Step 2: Search by phone if no email match
    if (input.phone) {
      const existing = await this.searchByPhone(input.phone);
      if (existing) return { customerId: existing.id, isNew: false };
    }

    // Step 3: Create new customer
    const newCustomer = await this.createCustomer({
      idempotencyKey: randomUUID(),
      givenName: input.firstName,
      familyName: input.lastName,
      emailAddress: input.email,
      phoneNumber: input.phone ? this.formatE164(input.phone) : undefined,
      address: input.address,
    });

    return { customerId: newCustomer.id, isNew: true };
  }

  async searchByEmail(email: string): Promise<SquareCustomer | null> {
    const response = await this.client.customersApi.searchCustomers({
      query: {
        filter: {
          emailAddress: { exact: email },
        },
      },
    });
    return response.result.customers?.[0] || null;
  }

  // GOTCHA: Phone must be E.164 format for search
  async searchByPhone(phone: string): Promise<SquareCustomer | null> {
    const e164Phone = this.formatE164(phone);
    const response = await this.client.customersApi.searchCustomers({
      query: {
        filter: {
          phoneNumber: { exact: e164Phone },
        },
      },
    });
    return response.result.customers?.[0] || null;
  }

  // CRITICAL: Format phone to E.164 (+1XXXXXXXXXX)
  private formatE164(phone: string): string {
    const digits = phone.replace(/\D/g, "");
    if (digits.length === 10) return `+1${digits}`;
    if (digits.length === 11 && digits[0] === "1") return `+${digits}`;
    return `+${digits}`;
  }
}
```

### Task 4 Pseudocode: Modify Customer Route

```typescript
// app/api/customer/route.ts - Modifications
import { SquareCustomerService } from "@/lib/square/customers";

// INJECT into existing POST handler, before Customer.save()
async function createCustomerWithSquare(billingInfo, existingCustomerId?) {
  const squareService = new SquareCustomerService();

  // If already have Square ID, just return it
  if (existingCustomerId) {
    return existingCustomerId;
  }

  // Find or create in Square
  const { customerId } = await squareService.findOrCreateCustomer({
    email: billingInfo.emailAddress,
    phone: billingInfo.phoneNumber,
    firstName: billingInfo.firstName,
    lastName: billingInfo.lastName,
    address: {
      addressLine1: billingInfo.addressLine1,
      addressLine2: billingInfo.addressLine2,
      locality: billingInfo.city,
      administrativeDistrictLevel1: billingInfo.stateProvince,
      postalCode: billingInfo.postalCode,
      country: billingInfo.country || "US",
    },
  });

  return customerId;
}

// In POST handler:
// const squareCustomerId = await createCustomerWithSquare(billingInfo);
// customerDoc.squareCustomerId = squareCustomerId;
// await customerDoc.save();
```

### Integration Points
```yaml
SQUARE_CLIENT:
  - file: lib/square/client.ts (exists)
  - ensure: SQUARE_ACCESS_TOKEN env var is set
  - ensure: SQUARE_ENVIRONMENT env var (sandbox/production)

ENV_VARS:
  - add to: .env.local
  - pattern: "SQUARE_ACCESS_TOKEN=your_token"
  - pattern: "SQUARE_ENVIRONMENT=sandbox"
  - pattern: "SQUARE_LOCATION_ID=your_location"

PAYMENT_LINKING:
  - modify: app/api/payments/route.ts
  - add: customer_id field to createPayment request
  - benefit: Payments appear under customer in Dashboard
```

## Validation Loop

### Level 1: Syntax & Style
```bash
# Run these FIRST - fix any errors before proceeding
cd /Users/benjamincorbett/code/cedesigns/coastal-creations-app
npx eslint lib/square/customers.ts --fix
npx tsc --noEmit lib/square/customers.ts

# Expected: No errors
```

### Level 2: Unit Tests
```typescript
// __tests__/lib/square/customers.test.ts
import { SquareCustomerService } from "@/lib/square/customers";

describe("SquareCustomerService", () => {
  const service = new SquareCustomerService();

  test("formatE164 converts 10-digit phone", () => {
    expect(service["formatE164"]("555-123-4567")).toBe("+15551234567");
  });

  test("formatE164 handles 11-digit with leading 1", () => {
    expect(service["formatE164"]("1-555-123-4567")).toBe("+15551234567");
  });

  test("findOrCreateCustomer deduplicates by email", async () => {
    // Create first customer
    const result1 = await service.findOrCreateCustomer({
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    });
    expect(result1.isNew).toBe(true);

    // Same email should find existing
    const result2 = await service.findOrCreateCustomer({
      email: "test@example.com",
      firstName: "Test",
      lastName: "User",
    });
    expect(result2.isNew).toBe(false);
    expect(result2.customerId).toBe(result1.customerId);
  });
});
```

```bash
# Run tests
npm run test -- __tests__/lib/square/customers.test.ts
```

### Level 3: Integration Test
```bash
# Test customer creation endpoint
curl -X POST http://localhost:3000/api/square/customers \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "firstName": "Test",
    "lastName": "Customer",
    "phone": "555-123-4567"
  }'

# Expected: {"customerId": "XXXXXX", "isNew": true}

# Test deduplication - same request again
# Expected: {"customerId": "XXXXXX", "isNew": false}

# Verify in Square Dashboard:
# Dashboard > Customers > Search for "test@example.com"
```

## Final Validation Checklist
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] New customers appear in Square Dashboard
- [ ] Existing customers can be migrated via /api/square/customers/migrate
- [ ] Payments link to customer profiles in Square
- [ ] No duplicate customers created for repeat bookings
- [ ] Phone numbers formatted correctly (E.164)
- [ ] Email search finds existing customers

---

## Anti-Patterns to Avoid
- DO NOT create customer without checking for existing by email/phone first
- DO NOT store sensitive customer data in MongoDB if it's in Square
- DO NOT skip idempotency keys - prevents duplicate creation on retries
- DO NOT hardcode Square credentials - use environment variables
- DO NOT assume phone format - always convert to E.164
