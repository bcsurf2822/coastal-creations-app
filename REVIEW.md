# 1 thing to do

## Fix pre-existing build-breaking type error in the store API

`pnpm build` currently fails type-check (pre-existing on `david`, unrelated to the
Next 16 / React 19 upgrade).

- **File:** `app/api/store/products/route.ts:16`
- **Error:** `TS2352: Conversion of type '(FlattenMaps<IStoreProductSettings> & Required<{ _id: ObjectId; }> & { __v: number; })[]' to type 'IStoreProductSettings[]' may be a mistake...`
- **Cause:** Mongoose `.lean()` returns a `FlattenMaps<...>` shape that doesn't
  sufficiently overlap with `IStoreProductSettings`, so the direct `as` cast is rejected.

**Fix options:**
- Quick: `as unknown as IStoreProductSettings[]`
- Cleaner: type the query with a lean generic, e.g.
  `StoreProductSettings.find({ isOnlineSellable: true }).lean<IStoreProductSettings[]>()`
  (drop the trailing `as` cast), or align `IStoreProductSettings` with the lean result.

**Verify:** `pnpm build` should compile and type-check with no errors.
