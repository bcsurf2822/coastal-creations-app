/**
 * Remove a saved card (DELETE, requireUser).
 *
 * Ownership is enforced: the card must belong to the signed-in user's Square
 * customer, otherwise we 404 (never reveal another customer's card). Disable is
 * idempotent in Square.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { squareCardService } from "@/lib/square/cards";
import { resolveUserSquareCustomerId } from "@/lib/square/userCustomer";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ cardId: string }> }
): Promise<NextResponse> {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const { cardId } = await params;
  const customerId = await resolveUserSquareCustomerId(user);
  if (!customerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const card = await squareCardService.getCard(cardId);
  if (!card || card.customerId !== customerId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const ok = await squareCardService.disableCard(cardId);
  if (!ok) {
    return NextResponse.json(
      { error: "Could not remove card" },
      { status: 400 }
    );
  }
  return NextResponse.json({ success: true });
}
