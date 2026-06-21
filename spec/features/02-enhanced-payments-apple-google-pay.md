# PRP: Enhanced Payments - Apple Pay & Google Pay Integration

## Goal
Add Apple Pay, Google Pay, and Cash App Pay payment options to the existing Square payment flow, providing customers with faster checkout using digital wallets while maintaining full compatibility with the existing credit card processing.

## Why
- **Conversion Rate**: Digital wallets reduce checkout friction by 40-60% (no card entry needed)
- **Mobile Users**: Art class attendees often book from mobile devices where wallet pay is preferred
- **Trust Signal**: Apple/Google Pay badges signal security and legitimacy
- **Speed**: One-tap payments vs typing 16 card digits + address
- **Already Paid For**: Square includes digital wallets at no extra cost beyond standard processing fees

## What
Extend the existing PaymentProcessor component to include Apple Pay, Google Pay, and Cash App Pay buttons using the react-square-web-payments-sdk, which already supports these payment methods.

### Success Criteria
- [ ] Apple Pay button appears on Safari/iOS devices when available
- [ ] Google Pay button appears on Chrome/Android devices when available
- [ ] Cash App Pay button available for all users
- [ ] Existing credit card flow continues to work unchanged
- [ ] Billing info auto-populated from wallet when possible
- [ ] All payment methods create proper customer records
- [ ] Payment receipts show correct payment method type

## All Needed Context

### Documentation & References
```yaml
- url: https://developer.squareup.com/docs/web-payments/apple-pay
  why: Apple Pay specific setup requirements and domain verification
  critical: Domain must be verified with Apple for production

- url: https://developer.squareup.com/docs/web-payments/google-pay
  why: Google Pay configuration and supported cards

- url: https://developer.squareup.com/docs/web-payments/cash-app-pay
  why: Cash App Pay redirect flow handling

- url: https://github.com/weareseeed/react-square-web-payments-sdk
  why: React SDK documentation - already installed in project
  critical: ApplePay, GooglePay, CashAppPay components exist

- file: components/payment/PaymentProcessor.tsx
  why: Current payment implementation to extend
  critical: Already uses DynamicPaymentForm and DynamicCreditCard

- file: app/api/payments/route.ts
  why: Backend payment processing - may need source_id handling updates
```

### Current Codebase Tree (relevant files)
```bash
coastal-creations-app/
├── components/
│   └── payment/
│       └── PaymentProcessor.tsx  # MODIFY - add wallet components
├── app/
│   ├── api/
│   │   └── payments/
│   │       └── route.ts          # VERIFY - handles all source types
│   └── events/
│       └── [id]/
│           └── page.tsx          # Contains payment flow
├── public/
│   └── .well-known/
│       └── apple-developer-merchantid-domain-association  # CREATE for Apple Pay
```

### Desired Codebase Tree
```bash
coastal-creations-app/
├── components/
│   └── payment/
│       ├── PaymentProcessor.tsx        # MODIFIED - multi-method support
│       ├── WalletPayButtons.tsx        # NEW - Apple/Google/Cash App buttons
│       └── PaymentMethodSelector.tsx   # NEW - optional tab/selector UI
├── app/
│   └── api/
│       └── payments/
│           └── route.ts                # VERIFY/MODIFY if needed
├── public/
│   └── .well-known/
│       └── apple-developer-merchantid-domain-association  # NEW
├── lib/
│   └── square/
│       └── payment-config.ts           # NEW - centralized payment config
```

### Known Gotchas & Library Quirks
```typescript
// CRITICAL: Apple Pay requires domain verification
// 1. Register domain in Square Dashboard > Apple Pay
// 2. Download verification file from Square
// 3. Host at: https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association
// 4. Must be served over HTTPS (won't work on localhost without tunnel)

// CRITICAL: Apple Pay only works in Safari on macOS/iOS
// Component auto-hides on unsupported browsers - this is correct behavior

// CRITICAL: Google Pay requires HTTPS in production
// Works on localhost for testing

// GOTCHA: Cash App Pay uses redirect flow
// User leaves site -> completes in Cash App -> returns
// Must handle the redirect callback properly

// GOTCHA: react-square-web-payments-sdk components
// ApplePay, GooglePay, CashAppPay must be children of PaymentForm
// They use same cardTokenizeResponseReceived callback

// PATTERN: Token source_id works the same for all methods
// Backend doesn't need to change - just processes the token

// GOTCHA: Billing info from wallets
// Apple/Google Pay may provide shipping address
// But you still need to collect it if wallet doesn't have it
```

## Implementation Blueprint

### Data Models and Structure

```typescript
// lib/square/payment-config.ts
export interface PaymentConfig {
  applicationId: string;
  locationId: string;
  environment: "sandbox" | "production";
}

export interface WalletPaymentOptions {
  applePay: {
    enabled: boolean;
  };
  googlePay: {
    enabled: boolean;
    buttonColor?: "default" | "black" | "white";
    buttonType?: "buy" | "plain" | "donate";
  };
  cashAppPay: {
    enabled: boolean;
    redirectUrl: string;
  };
}

// No changes needed to existing payment result types
// All wallet payments return same token structure
```

### List of Tasks

```yaml
Task 1:
CREATE lib/square/payment-config.ts:
  - Centralize payment configuration
  - Export wallet payment options
  - Handle environment-specific settings
  - PATTERN: Use existing env vars from config

Task 2:
CREATE components/payment/WalletPayButtons.tsx:
  - Import ApplePay, GooglePay, CashAppPay from SDK
  - Use dynamic imports with SSR disabled (like CreditCard)
  - Display availability badges
  - Handle loading states

Task 3:
MODIFY components/payment/PaymentProcessor.tsx:
  - FIND: DynamicCreditCard component around line 476
  - INJECT: WalletPayButtons component before or after CreditCard
  - PRESERVE: Existing cardTokenizeResponseReceived handler
  - NOTE: Same handler works for all payment methods

Task 4:
CREATE public/.well-known/apple-developer-merchantid-domain-association:
  - Download from Square Dashboard after domain registration
  - File content provided by Square (not generated)
  - CRITICAL: Must be exact file from Square

Task 5:
VERIFY app/api/payments/route.ts:
  - Confirm it accepts any valid token (should work as-is)
  - No changes expected - tokens are payment-method agnostic
  - Log payment method type if available for analytics

Task 6:
UPDATE Square Dashboard configuration:
  - Enable Apple Pay and register domain
  - Enable Google Pay
  - Enable Cash App Pay
  - Note: This is manual step, not code
```

### Task 2 Pseudocode: Wallet Pay Buttons Component

```typescript
// components/payment/WalletPayButtons.tsx
"use client";

import dynamic from "next/dynamic";
import React from "react";

// Dynamic imports with SSR disabled - CRITICAL for Square SDK
const DynamicApplePay = dynamic(
  async () => {
    const { ApplePay } = await import("react-square-web-payments-sdk");
    return ApplePay;
  },
  {
    ssr: false,
    loading: () => <div className="h-12 bg-gray-100 rounded animate-pulse" />,
  }
);

const DynamicGooglePay = dynamic(
  async () => {
    const { GooglePay } = await import("react-square-web-payments-sdk");
    return GooglePay;
  },
  {
    ssr: false,
    loading: () => <div className="h-12 bg-gray-100 rounded animate-pulse" />,
  }
);

const DynamicCashAppPay = dynamic(
  async () => {
    const { CashAppPay } = await import("react-square-web-payments-sdk");
    return CashAppPay;
  },
  {
    ssr: false,
    loading: () => <div className="h-12 bg-gray-100 rounded animate-pulse" />,
  }
);

interface WalletPayButtonsProps {
  totalPrice: string;
  disabled?: boolean;
}

const WalletPayButtons: React.FC<WalletPayButtonsProps> = ({
  totalPrice,
  disabled = false,
}) => {
  // PATTERN: Components auto-hide when payment method unavailable
  // No need to detect browser/device manually
  return (
    <div className="space-y-3 mb-6">
      {/* Divider with text */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">
            Express checkout
          </span>
        </div>
      </div>

      {/* Apple Pay - only shows in Safari/iOS */}
      <DynamicApplePay />

      {/* Google Pay - shows in Chrome and compatible browsers */}
      <DynamicGooglePay
        buttonColor="black"
        buttonSizeMode="fill"
        buttonType="plain"
      />

      {/* Cash App Pay - available to all users */}
      <DynamicCashAppPay
        redirectURL={`${window.location.origin}/payment/cashapp-callback`}
        referenceId={`order-${Date.now()}`}
      />

      {/* Another divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-gray-50 text-gray-500">
            Or pay with card
          </span>
        </div>
      </div>
    </div>
  );
};

export default WalletPayButtons;
```

### Task 3 Pseudocode: Modify PaymentProcessor

```typescript
// components/payment/PaymentProcessor.tsx - Key modifications

// ADD import at top
import WalletPayButtons from "./WalletPayButtons";

// FIND existing DynamicPaymentForm section (around line 266)
// The cardTokenizeResponseReceived handler already works for all methods

// MODIFY the JSX inside DynamicPaymentForm, before DynamicCreditCard:
<DynamicPaymentForm
  key={formId}
  applicationId={config.applicationId}
  locationId={config.locationId}
  createPaymentRequest={() => ({
    countryCode: "US",
    currencyCode: "USD",
    total: {
      amount: totalPrice,
      label: "Total",
    },
  })}
  cardTokenizeResponseReceived={async (token) => {
    // EXISTING HANDLER - works for all payment methods
    // token.token contains the nonce regardless of payment method
    // token.details may contain wallet-specific info

    // Log payment method for analytics (optional)
    console.log("[PaymentProcessor] Payment method:", token.details?.method);

    // ... rest of existing handler unchanged ...
  }}
>
  <div className="max-w-md mx-auto">
    {/* NEW: Add wallet buttons before credit card form */}
    <WalletPayButtons
      totalPrice={totalPrice}
      disabled={!formValid}
    />

    {/* EXISTING: Credit card form */}
    <DynamicCreditCard key={`${formId}-card`} />

    {/* EXISTING: Validation message */}
    {!formValid && (
      <div className="mt-4 text-red-600 text-center text-sm font-medium">
        ...
      </div>
    )}
  </div>
</DynamicPaymentForm>
```

### Integration Points
```yaml
SQUARE_DASHBOARD:
  - action: Enable Apple Pay in Square Dashboard
  - action: Register production domain for Apple Pay
  - action: Download domain verification file
  - action: Enable Google Pay in Square Dashboard
  - action: Enable Cash App Pay in Square Dashboard
  - url: https://squareup.com/dashboard/locations/{location}/payment-methods

DOMAIN_VERIFICATION:
  - file: public/.well-known/apple-developer-merchantid-domain-association
  - note: File content comes from Square Dashboard
  - must: Serve over HTTPS in production
  - test: curl https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association

CASH_APP_CALLBACK:
  - create: app/payment/cashapp-callback/page.tsx
  - purpose: Handle return from Cash App redirect
  - pattern: Parse URL params, show success/error
```

## Validation Loop

### Level 1: Syntax & Style
```bash
cd /Users/benjamincorbett/code/cedesigns/coastal-creations-app

# Check new component
npx eslint components/payment/WalletPayButtons.tsx --fix
npx tsc --noEmit

# Check modified component
npx eslint components/payment/PaymentProcessor.tsx --fix

# Expected: No errors
```

### Level 2: Unit Tests
```typescript
// __tests__/components/payment/WalletPayButtons.test.tsx
import { render, screen } from "@testing-library/react";
import WalletPayButtons from "@/components/payment/WalletPayButtons";

// Note: Wallet components require PaymentForm wrapper in real usage
// These tests verify component structure

describe("WalletPayButtons", () => {
  test("renders express checkout section", () => {
    render(<WalletPayButtons totalPrice="50.00" />);
    expect(screen.getByText("Express checkout")).toBeInTheDocument();
    expect(screen.getByText("Or pay with card")).toBeInTheDocument();
  });

  test("renders with disabled state", () => {
    render(<WalletPayButtons totalPrice="50.00" disabled={true} />);
    // Component should still render structure even when disabled
    expect(screen.getByText("Express checkout")).toBeInTheDocument();
  });
});
```

```bash
npm run test -- __tests__/components/payment/WalletPayButtons.test.tsx
```

### Level 3: Integration Test
```bash
# Start dev server
npm run dev

# Test in different browsers:

# 1. Safari (macOS/iOS) - Should show Apple Pay button
# Navigate to any event booking page with payment

# 2. Chrome - Should show Google Pay button
# Navigate to same page

# 3. Any browser - Should show Cash App Pay button

# 4. Test actual payment (sandbox):
# Use Square sandbox test cards/wallets
# Verify payment completes and redirects properly
```

### Apple Pay Domain Verification Test
```bash
# After deploying to production domain:
curl -I https://yourdomain.com/.well-known/apple-developer-merchantid-domain-association

# Expected:
# HTTP/2 200
# Content-Type: text/plain (or application/octet-stream)
```

## Final Validation Checklist
- [ ] All tests pass: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] No type errors: `npm run type-check`
- [ ] Apple Pay button appears in Safari
- [ ] Google Pay button appears in Chrome
- [ ] Cash App Pay button appears in all browsers
- [ ] Credit card form still works
- [ ] Apple Pay domain verification file accessible
- [ ] Sandbox payment completes successfully with each method
- [ ] Payment appears in Square Dashboard with correct method type
- [ ] Cash App redirect returns user to site properly

---

## Anti-Patterns to Avoid
- DO NOT try to detect browser/device manually - SDK components auto-hide
- DO NOT skip domain verification for Apple Pay - it will fail silently
- DO NOT serve verification file over HTTP - must be HTTPS
- DO NOT assume wallets will provide billing address - still collect it
- DO NOT create separate payment handlers - use existing cardTokenizeResponseReceived
- DO NOT test Apple Pay on localhost without proper tunnel (use ngrok for testing)
