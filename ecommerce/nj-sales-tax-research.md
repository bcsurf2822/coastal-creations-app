# NJ E-Commerce Sales Tax — Research Findings & Owner Email

*Research date: July 8, 2026. Companion to [ecommerce-sales-tax-guide.md](./ecommerce-sales-tax-guide.md). This is general information, not tax advice.*

---

## The Three Questions, Answered

### 1. Is it state by state?

**Yes.** Sales tax obligations are determined per state via "nexus":

- **Physical nexus** — the business is physically in New Jersey, so it owes NJ collection from day one.
- **Economic nexus** — every other state can only require collection after sales *into that state* cross that state's own threshold (commonly $100,000/year; some states also use a 200-transaction count, though the trend is toward dropping it).

A single Texas customer buying a $40 art kit creates **zero** Texas obligation. Obligations in other states only begin if/when volume into that state crosses its threshold — unlikely in year one for a small studio store.

### 2. Do customers only get charged NJ tax?

**Practically, at launch: yes — and only NJ customers get charged anything.**

- **Orders shipped to NJ addresses** → charge NJ sales tax.
- **Orders shipped out of state** → charge **no tax at all**. NJ is destination-based: NJ tax does not apply to goods delivered outside NJ, and we can't collect another state's tax without being registered there (and shouldn't be registered without nexus). Out-of-state buyers technically owe "use tax" to their own state, but that is the *buyer's* obligation, not the store's.

So the launch policy is simply: **NJ ship-to → 6.625%; everywhere else → 0%.**

### 3. Is it cut and dry?

**The rules are cut and dry. The reason to involve the owner is that the obligations attach to the business, not the website.**

What's mechanical (developer territory):

- Detecting the ship-to state and applying the right rate at checkout.

What only the owner/business can do (and why the decision was escalated):

1. **Registration** — collecting NJ tax requires the business to be registered with NJ (NJ-REG / Certificate of Authority). Turning on collection in code does **not** register anyone. If the studio already collects NJ tax on in-person sales (walk-ins, kits sold at the register), it's almost certainly registered already — but that needs confirming, not assuming.
2. **Filing & remitting** — collected tax is the state's money held in trust. Someone (owner/bookkeeper/accountant) must file NJ returns on the assigned schedule and include the online sales. Collecting online without remitting is the classic audit penalty scenario.
3. **Accountant sign-off** — product taxability calls and the filing cadence belong with their tax professional.
4. **Growth monitoring** — deciding who watches per-state sales totals as the store grows, and whether to eventually pay for a filing service (DAVO/TaxJar/Avalara — overkill below ~5 states).

Shipping tax without registration = penalties. Shipping *no* tax to NJ customers while registered = under-collection the business eats. Either wrong guess costs the owner money, which is why it's their call.

---

## New Jersey Specifics (verified July 2026)

| Fact | Detail |
|------|--------|
| **State rate** | **6.625%**, flat statewide — NJ has **no local/city/county sales taxes**. One rate for every NJ address. |
| **Sourcing** | **Destination-based** — tax is owed based on where the buyer receives the goods. Out-of-state deliveries are not NJ-taxable. |
| **Art kits / craft products** | Tangible personal property → **taxable**. (NJ's big exemptions — clothing, most groceries — don't apply to art supplies/kits.) |
| **Shipping charges** | **Taxable when the goods are taxable**, even if separately stated (N.J.A.C. 18:24-27.2). For this store, that means NJ orders are taxed on **items + shipping**. Mixed taxable/exempt shipments require allocation, otherwise the whole delivery charge is taxable — not currently relevant since all products are taxable. |
| **Gift cards** | Buying a gift card is **not** a taxable sale; tax applies when the card is redeemed for taxable goods. Gift-card-funded store orders still get taxed like any other order. |
| **NJ's own economic nexus (for inbound remote sellers)** | $100,000 gross revenue **or** 200 transactions into NJ (current or prior calendar year). 30-day grace period to register after crossing. Bills S711/A3419 (introduced Jan 2026) would drop the 200-transaction test, keeping only $100k — pending. Mirrors how other states will treat this store in reverse. |
| **UEZ half-rate (3.3125%)** | Only for businesses located in an Urban Enterprise Zone, and generally in-person sales. Not applicable here. |

---

## Implementation Notes

**Current state (2026-08-02): LIVE.** Ashley confirmed the plan (registered, accountant aware, 6.625% on NJ-shipped orders incl. shipping). Implemented in `lib/utils/salesTax.ts` (`computeSalesTaxCents`), wired into `app/api/store/checkout/route.ts` as the server-authoritative source, with a same-formula client preview in `CheckoutForm.tsx` (so the Square payment amount matches what's actually charged). Tax line shows in `CartSummary`, both order emails, and the admin order page. Everything below this line is the original pre-launch research/spec — kept for reference.

**Why Square doesn't "just handle it":** Square's automatic tax calculator applies to Square Online sites and Square POS. Our checkout is a **custom Next.js flow using the Square v44 API**, so tax must be applied by our code (either computed directly or via a Catalog tax object attached to the order). Square never registers, files, or remits regardless — that's always the merchant's job.

**The good news — NJ is the easiest possible state to implement:**

Because NJ has one flat statewide rate and no local jurisdictions, v1 needs no tax service, no rate tables, no geocoding:

```
if (shippingAddress.state === "NJ") {
  taxCents = round((taxableItemsCents + shippingCents) * 0.06625)
} else {
  taxCents = 0
}
```

Details for the real implementation:

1. Key off the **ship-to** address (destination sourcing), not billing.
2. Tax base = merchandise **plus shipping** (NJ taxes delivery charges on taxable goods).
3. Show the tax line in the checkout summary and order confirmation email, and persist it on the Order (`taxCents` already exists on the model).
4. Rate should live in a constant/config, not be hardcoded inline, in case NJ changes it (there was 2025–26 legislative chatter about rate changes).
5. Keep collecting **additive** (tax on top of listed price) — matches how the summary is displayed today.
6. Reporting: order records already capture ship-to state, so "taxable NJ sales this period" is a simple query for whoever files. Also usable later to watch other states' thresholds.

**Not needed at launch:** TaxJar/Avalara/DAVO, per-state rate tables, tax on out-of-state orders. Revisit only if some state's sales approach ~$100k/year.

---

## Draft Email to Owner

> **Subject: Online store sales tax — what I need from you before I turn it on**
>
> Hi [Owner],
>
> Quick update on the online store: everything is built and working, but I've intentionally left **sales tax collection turned off** until we make one business decision together. I didn't want to guess on something that creates legal filing obligations for the business, so here's the short version of how it works and what I need from you.
>
> **How online sales tax works (it's simpler than it sounds):**
>
> - We charge **New Jersey sales tax (6.625%) only on orders shipped to NJ addresses** — including on the shipping charge, which NJ taxes too.
> - **Out-of-state orders get charged no tax at all.** We'd only ever owe another state once we sell roughly $100,000/year into that state, which isn't a year-one concern. I'll set up reporting so we can see per-state totals and will flag it if any state ever gets close.
>
> **Why I paused instead of just turning it on:**
>
> Charging tax at checkout is the easy part — I can enable it in an afternoon. But the tax we collect has to be **filed and remitted to New Jersey** by the business, and collecting it without being registered/remitting is what triggers penalties. That side lives with you and your accountant, not the website. So before I flip the switch, I need:
>
> 1. **Confirmation the studio is registered to collect NJ sales tax** (if you're already charging tax on in-person sales through Square, you almost certainly are — I just need a yes).
> 2. **Confirmation that whoever files your NJ sales tax returns** (you/bookkeeper/accountant) knows online sales will be added to the same returns.
> 3. **A quick OK from your accountant** that the plan — 6.625% on NJ-shipped orders including shipping, nothing on out-of-state — matches how they want it handled.
>
> Once I have those, I'll enable tax at checkout, add the tax line to receipts and confirmation emails, and make sure your order reports show taxable NJ sales so filing stays easy.
>
> Happy to hop on a call with your accountant if that's faster.
>
> Thanks,
> Ben

---

## Sources

- [NJ Division of Taxation — Sales and Use Tax](https://nj.gov/treasury/taxation/businesses/salestax/index.shtml)
- [NJ Division of Taxation — Remote Sellers FAQ](https://www.nj.gov/treasury/taxation/remotesellersfaq.shtml)
- [NJ Division of Taxation — Out-of-State Sales & New Jersey Sales Tax (ANJ-10, PDF)](https://www.nj.gov/treasury/taxation/pdf/pubs/sales/anj10.pdf)
- [N.J.A.C. 18:24-27.2 — Delivery charges (Cornell LII)](https://www.law.cornell.edu/regulations/new-jersey/N-J-A-C-18-24-27-2)
- [TaxJar — Is shipping in New Jersey taxable?](https://www.taxjar.com/blog/retail/shipping-new-jersey-taxable)
- [Avalara — New Jersey Sales & Use Tax Guide](https://www.avalara.com/us/en/taxrates/state-rates/new-jersey/new-jersey-sales-tax-guide.html)
- [Avalara — NJ could lower sales tax rate, eliminate transaction threshold](https://www.avalara.com/blog/en/north-america/2025/01/new-jersey-to-cut-sales-tax-nexus-transaction-threshold.html)
- [TaxCloud — New Jersey Sales Tax Rates 2026](https://taxcloud.com/sales-tax/new-jersey/)
- [Galvix — New Jersey Sales Tax 2026 Guide](https://www.galvix.com/sales-tax/new-jersey/)
- [Square Support — Create and manage sales tax settings](https://squareup.com/help/us/en/article/5061-create-and-manage-your-tax-settings)
- [Square Developer — Apply Taxes, Discounts, and Service Charges (Orders API)](https://developer.squareup.com/docs/orders-api/apply-taxes-and-discounts)
- [TaxConnex — Square & Sales Tax compliance](https://www.taxconnex.com/blog-/square-sales-tax-simplified-what-you-need-to-know)
