/**
 * Checkout-style pages render the nav in-flow (relative) instead of fixed, so the
 * sticky order summary isn't overlapped by the nav — and the layout drops its
 * fixed-nav top offset on these routes to avoid dead space. Shared by NavBar and
 * ConditionalLayout so the two never drift.
 *
 * Covers: store checkout (/checkout), event/booking checkout (/payments), and the
 * reservation payment page (/reservations/<id>/payment).
 */
export function isCheckoutRoute(pathname: string): boolean {
  return (
    pathname === "/checkout" ||
    pathname === "/payments" ||
    pathname.endsWith("/payment")
  );
}
