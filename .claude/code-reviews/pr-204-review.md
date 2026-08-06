# Review: PR #204 — enforce `numberOfParticipants` cap on Event bookings

**Verdict: Request changes.** The fix is correctly designed and well-tested on the live checkout path, but the same capacity check on the second route it patches has a broken fallback for a missing `quantity`, and that route has no test coverage to catch it.

No Jira/Confluence for this project — reviewed straight off the PR body, the repo's `AGENTS.md`, and the investigation doc at `ClaudeVault/Memory/projects/coastal-creations/2026-08-06_capacity-cap-bug.md` in the second-brain repo.

## Summary

An 11th signup landed on a 10-cap class because `numberOfParticipants` was only ever a client-side "Sold Out" badge — no server route enforced it. This PR adds `lib/checkout/eventAvailability.ts` (mirroring the existing `reservationAvailability.ts` pattern) and wires it into both routes that create an Event booking: the live `POST /api/checkout/booking` and the older `POST /api/customer`.

The fix on the primary/live route is solid and covered by new tests. The fix on the second route has a real logic gap in exactly the dimension the bug was about — capacity silently not enforced — that happens to be masked today by an unrelated throw elsewhere, not by design.

## Validation

| Check | Result |
|---|---|
| `pnpm run test:run` | 49 files / 426 tests passed (matches PR's claimed test plan) |
| `pnpm run typecheck` | clean |
| `pnpm run build` | clean |
| `pnpm run lint` | 0 errors, 47 pre-existing warnings, none in touched files |

## Issues

### High — `app/api/customer/route.ts`: capacity check silently passes when `quantity` is omitted

`app/api/customer/route.ts:42` destructures `quantity` straight off `request.json()` with no fallback, then passes it unguarded into `validateEventCapacity(currentCount, quantity, ...)` at `app/api/customer/route.ts:326-330`. Contrast with the sibling route, which normalizes `booking.quantity ?? 1` before the same call (`app/api/checkout/booking/route.ts:154`).

**Failure scenario:** `POST /api/customer` with `{ event: "<full-event-id>", eventType: "Event", billingInfo: {...} }` and `quantity` omitted entirely. `validateEventCapacity(10, undefined, 10)` computes `availableSpots = 0` and checks `undefined > 0`, which is `false` in JS — so the function returns `null` ("capacity OK") for a fully-booked event. Verified directly:

```
result with quantity=undefined at 10/10 cap: null   // should be "sold out"
```

This does **not** currently produce an oversold `Customer` record — a few lines later, `computeEventChargeCents` → `validateCount()` in `lib/checkout/eventPricing.ts:72-82` independently throws `PriceIntegrityError` on the same `undefined` value, and the route's catch block turns that into a 400. But that's an incidental backstop from an unrelated module, not something this capacity check relies on by design — the two checks aren't linked, and the failure mode this PR exists to prevent (capacity check reporting "OK" when the event is full) is present in this file's logic right now. Any future change to `validateCount`'s strictness or to the ordering of these two checks would silently reopen the exact bug this PR closes, on the exact route the investigation doc names as one of the two culprits.

Fix: apply the same `quantity ?? 1` (or explicit numeric validation) before the capacity check that `app/api/checkout/booking/route.ts` already uses.

**Compounding gap — no test would catch this today.** There is no test file anywhere in the repo for `app/api/customer/route.ts`'s `POST` handler (confirmed — only client-hook mocks under `__tests__/hooks/mutations/use-create-customer.test.ts` exist, which don't touch the route itself). `bookingRoute.test.ts` got a dedicated 3-test block for this exact scenario on the sibling route; the route this bug actually lives in got none. This is precisely how it shipped.

### Low — `lib/checkout/eventAvailability.ts:39`: `||` treats an explicit cap of `0` as "unset"

```ts
const cap = numberOfParticipants || DEFAULT_CAPACITY;
```

If an event is ever configured with `numberOfParticipants: 0` (e.g. "registration not yet open"), this silently falls back to a cap of 20 instead of correctly blocking every booking. Currently unreachable — the admin event form doesn't allow entering 0 — but it's a one-character fix (`??` instead of `||`) for a real edge case in shared validation logic, cheap enough to just take.

## What's done well

- `eventAvailability.ts` correctly mirrors `reservationAvailability.ts`'s shape — a pure `validate*` function plus a separate async count helper — and stays fully typed with no `any`.
- Both routes place the capacity check **before** the Square charge, matching the codebase's existing "no charge on failure" principle (see the Reservation check it's modeled on).
- `lib/checkout/eventAvailability.ts`'s counting (`Customer.find({ event: eventId })`, no `refundStatus` filter) is a documented, intentional match to the existing client-side count in `EventsContainer.tsx` — not a new policy, and not flagged here per that.
- The known count-then-insert (non-atomic) limitation is honestly disclosed in the PR body and investigation doc, with the right context for why it's out of scope — not re-flagged here.
- `bookingRoute.test.ts`'s new capacity tests correctly assert `paymentsCreate`/`customerCreate` are never called on rejection — the right thing to check for a pre-charge gate.
- Logging follows the repo's `[FILENAME-FUNCTION]` convention consistently in both routes.
- Root-cause writeup (linked from the PR body) is thorough and the fix's scope (excluding `PrivateEvent`, matching `EventCard`'s existing 20-default) is well-justified.

## Recommendation

Fix the High finding — apply `quantity ?? 1` (or equivalent explicit validation) in `app/api/customer/route.ts` before the capacity check, and add a test for the omitted-`quantity` case on that route (mirroring the sold-out test already written for `bookingRoute.test.ts`). The `||`/`??` nit is a trivial include-while-you're-in-there fix, not a blocker on its own.
