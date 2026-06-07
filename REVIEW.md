# Review / TODO

## 1. FIRST: Next.js 16 + React 19 upgrade — do this after pulling `david`

`develop` (now merged into `david`) upgrades the app from Next 15.2.8 → **16.2.7** and
React 18 → **19**. After you `git pull`, you MUST:

1. **Run `pnpm install`** — the lockfile changed (React 19, Next 16, new transitive
   resolutions). You do **not** need to delete `node_modules`; `pnpm install` reconciles it
   in place. If anything looks off: `rm -rf node_modules && pnpm install`.

2. **Check your Node version** — Next 16 requires **Node ≥ 20.9**.
   ```bash
   node --version
   ```
   - Node 20.9+ / 22 / 24 → you're fine, no action.
   - Node 18 or older → **upgrade Node** (e.g. `nvm install 22 && nvm use 22`) or Next 16 won't run.

3. **Heads-up:** `pnpm lint` is now stricter (React 19 / React Compiler rules) — ~45 warnings,
   0 errors, non-blocking. Build/deploy are unaffected by these.

---

## 2. Fix the 2 type errors breaking the production build (Vercel `pnpm run build`)

`next build` runs a TypeScript check after compiling and **stops at the first error**, so
Vercel only shows one at a time. A full project type-check (`npx tsc --noEmit`) reveals
**two** errors in app code that block the build. Both are pre-existing in the store/checkout
feature and are **unrelated** to the Next 16 / React 19 upgrade (TypeScript 5.9.3,
`@types/react@19`, and `mongoose@8` are unchanged by the upgrade).

Verified locally: applying both fixes below makes `pnpm build` compile **and** type-check
cleanly (79/79 routes generated).

### Error 1 — `app/api/store/products/route.ts:16` (current Vercel blocker)

```
Type error: Conversion of type '(FlattenMaps<IStoreProductSettings> & Required<{ _id: ObjectId; }>
& { __v: number; })[]' to type 'IStoreProductSettings[]' may be a mistake because neither type
sufficiently overlaps with the other. If this was intentional, convert the expression to 'unknown' first.
```

- **Cause:** Mongoose `.lean()` returns a `FlattenMaps<...>` shape (includes `__v`, ObjectId `_id`,
  and a flattened `MongoClient` on nested types) that does not overlap enough with
  `IStoreProductSettings` for a direct `as` cast.
- **Fix (quick):**
  ```ts
  }).lean()) as unknown as IStoreProductSettings[];
  ```
- **Fix (cleaner):** type the query and drop the trailing cast:
  ```ts
  const settings = await StoreProductSettings.find({
    isOnlineSellable: true,
  }).lean<IStoreProductSettings[]>();
  ```

### Error 2 — `components/store/CheckoutForm.tsx:136` (next blocker, hidden behind Error 1)

```
Type error: Type 'null' is not assignable to type 'ReactElement<unknown, string | JSXElementConstructor<any>>'.
```

- **Cause:** the component is declared `(): ReactElement` (line 29) but early-returns `null`
  at line 136 (`if (items.length === 0 && !orderCompleted.current) return null;`).
  `null` is not assignable to `ReactElement`.
- **Fix:** widen the return type:
  ```ts
  export default function CheckoutForm(): ReactElement | null {
  ```

### How to reproduce locally

```bash
rm -rf .next            # match Vercel's clean build
pnpm build              # fails type-check on app/api/store/products/route.ts:16
# To enumerate ALL type errors at once instead of one-per-build:
npx tsc --noEmit
```

### Not build blockers (for reference)

- **`__tests__/*` type errors (~33):** `next build` does **not** type-check test files, so they
  do not fail the Vercel build (they do fail `npx tsc --noEmit` and should be cleaned up separately).
- **`.next/dev/types/validator.ts` "Cannot find module .../app/api/products/route.js":** a stale
  artifact from local `next dev` referencing a route removed when the store moved to Square. It does
  **not** occur in a clean build (`rm -rf .next`) and never appears on Vercel.
