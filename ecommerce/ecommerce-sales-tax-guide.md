# Sales Tax for a New Jersey E-Commerce Store Selling Nationwide

*A practical overview for understanding multi-state sales tax obligations and how Square fits in.*

> **Disclaimer:** This is general information, not tax advice. Sales tax rules change frequently and vary by state. Confirm specifics with a licensed sales tax advisor before going live.

---

## The Core Concept: Nexus

You don't charge "NJ tax only," and you don't charge "every customer their home-state tax." The real rule is built around **nexus** — a connection strong enough that a state can legally require you to collect its sales tax.

There are two kinds:

### Physical Nexus
A physical presence in the state — office, inventory, employees. Because your business is based in **New Jersey**, you have physical nexus in NJ from day one. You collect NJ sales tax on every NJ-bound order immediately.

### Economic Nexus
Created by the 2018 Supreme Court decision *South Dakota v. Wayfair*. Even with **no** physical presence, you can trigger a tax obligation in a state purely based on your **sales volume into that state**.

- Each state sets its own threshold.
- The most common threshold is **$100,000 in sales** into that state.
- Some states also (or instead) use a **transaction count**; a few set higher revenue bars.
- Example: **New York** requires *both* $500,000 in sales *and* 100 transactions before you owe anything.

---

## So: NJ Only, or Per State?

**NJ from the start — plus any other state where you cross that state's economic nexus threshold.**

A single customer in Texas buying a $40 item does **not** obligate you to collect Texas tax. That obligation only begins once your sales *into Texas* cross Texas's threshold.

### Key wrinkles

| Point | What it means |
|-------|---------------|
| Measured per state | Each state's threshold is checked against *your sales into that state*, using *that state's* rules, usually over a rolling 12-month window. |
| Not retroactive | Once you cross a threshold, you collect on sales **going forward**. But if you cross and fail to register, states can pursue back taxes + penalties + interest. |
| Trend in 2025–2026 | States are dropping transaction-count tests in favor of revenue-only thresholds (e.g., Illinois removed its 200-transaction test effective Jan 1, 2026). This generally *helps* low-volume, high-ticket sellers. |

For most new stores, **year one realistically means collecting and remitting NJ tax only**, while watching the other states as you grow. The main risk is silently crossing a threshold mid-year.

---

## How Square Fits In

The distinction that trips people up:

> **Square calculates and collects. Square does NOT file or remit.**

### What Square does (automatically)
- Square's automatic US tax calculator charges sales tax based on the **tax enrollments** you add to your account and where the order is fulfilled.
- Once you tell Square which states/jurisdictions you're registered in, it applies the correct rate — down to the local city, county, and special-district level — at checkout.

### What Square does NOT do
- It does **not** register you with any tax authority. Enabling tax calculation in Square is *not* registration.
- It does **not** file returns or remit payments. That is entirely your responsibility, in every state where you have nexus.

### The correct order of operations
1. **Register** with the state yourself (obtain a sales tax permit).
2. **Add that enrollment** in Square so it begins charging that state's tax.
3. **File and remit** to that state on its assigned schedule.

Collecting tax in a state *without* being registered and remitting there is exactly the scenario that produces audit penalties.

### The classic failure mode
A seller expands into new states, configures Square to collect there, watches the money arrive — and never files. A commonly cited example: a seller hit with ~$15,000 in California penalties and interest for tax that was **collected but never remitted**. Remember: collected sales tax was never your money. It's the state's money you're holding in trust.

---

## A Practical Starting Posture

For a NJ-based store selling nationwide:

1. **Register in NJ**, set Square to collect NJ tax, and remit NJ returns on your assigned schedule.
2. **Track sales by state** so you can see when you approach another state's threshold. Square's reports break out taxable sales by location.
3. **When you cross a state's threshold**, register there, add the enrollment in Square, and begin filing in that state too.
4. **Consider a filing/remittance layer** once multi-state gets real:
   - **DAVO by Avalara** — integrates with Square to set aside collected tax, file returns, and submit payments automatically.
   - **TaxJar / Avalara** — nexus tracking plus auto-filing across states.
   - Below a handful of states, this is overkill. Past ~5 filing states, it usually pays for itself.

---

## Configuration Gotchas

- **Additive vs. inclusive tax:** Make sure Square is set to **additive** (tax added on top of the listed price), unless you specifically want tax baked into displayed prices. Inclusive-by-mistake is a common setup error.
- **Shipping taxability:** Some states tax shipping charges, some don't. If you're pairing Square with **Shippo**, confirm per-state how shipping is taxed and how Square labels/handles that charge.
- **Reconcile 1099-K vs. actual income:** Square's 1099-K reports **gross** figures (including tips, shipping, taxes, refunds). Don't hand that number to your accountant as net income — reconcile against your transaction and payout reports.

---

## Quick Reference Summary

- **Collect immediately:** New Jersey (your home/physical-nexus state).
- **Collect later, per state:** Only after crossing that state's economic nexus threshold (commonly $100k in sales into the state).
- **Square's job:** Calculate + collect at checkout (after you enroll each state).
- **Your job:** Register, track by state, file, and remit — everywhere you have nexus.
- **Biggest risk:** Crossing a threshold unnoticed, or collecting tax without registering/remitting.
