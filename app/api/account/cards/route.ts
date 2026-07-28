/**
 * Account Cards on File API (customer-facing, requireUser).
 *   GET  — list the signed-in user's saved cards (display metadata only).
 *   POST — save a new card on file from a Web Payments SDK token (intent STORE).
 *
 * Card data never reaches us: the client tokenizes with Square, we exchange the
 * one-time token for a durable card id filed under the user's Square customer.
 */
import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth/guards";
import { squareCardService } from "@/lib/square/cards";
import { resolveUserSquareCustomerId } from "@/lib/square/userCustomer";

export async function GET(): Promise<NextResponse> {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  // Read-only: don't create a Square customer just to list (none → no cards yet).
  const customerId = await resolveUserSquareCustomerId(user);
  if (!customerId) return NextResponse.json({ cards: [] });

  const cards = await squareCardService.listCards(customerId);
  return NextResponse.json({ cards });
}

interface SaveCardBody {
  sourceId?: string;
  verificationToken?: string;
  cardholderName?: string;
}

export async function POST(request: Request): Promise<NextResponse> {
  const user = await requireUser();
  if (user instanceof NextResponse) return user;

  const body = (await request.json()) as SaveCardBody;
  if (!body.sourceId) {
    return NextResponse.json({ error: "Missing card token" }, { status: 400 });
  }

  // Saving requires a customer to file under — create one from the account identity
  // if this user has never transacted.
  const customerId = await resolveUserSquareCustomerId(user, {
    createIfMissing: true,
  });
  if (!customerId) {
    return NextResponse.json(
      { error: "Could not resolve a customer profile" },
      { status: 500 }
    );
  }

  try {
    const card = await squareCardService.createCard({
      sourceId: body.sourceId,
      customerId,
      cardholderName: body.cardholderName,
      verificationToken: body.verificationToken,
      referenceId: user.id,
    });
    return NextResponse.json({ card }, { status: 201 });
  } catch (error) {
    console.error("[API-ACCOUNT-CARDS-POST] Save card failed:", error);
    return NextResponse.json({ error: "Could not save card" }, { status: 400 });
  }
}
