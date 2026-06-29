import type { ReactElement } from "react";
import { requireUserPage } from "@/lib/auth/guards";
import { resolveUserSquareCustomerId } from "@/lib/square/userCustomer";
import { squareCardService, type SavedCard } from "@/lib/square/cards";
import PaymentMethodsManager from "@/components/account/PaymentMethodsManager";

export default async function PaymentMethodsPage(): Promise<ReactElement> {
  const user = await requireUserPage();

  // Read-only resolve: list cards if the user already has a Square customer; a new
  // customer is created lazily only when they actually save a card (POST route).
  const customerId = await resolveUserSquareCustomerId(user);
  const cards: SavedCard[] = customerId
    ? await squareCardService.listCards(customerId)
    : [];

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-800">Payment methods</h1>
      <PaymentMethodsManager
        initialCards={cards}
        applicationId={process.env.SQUARE_APPLICATION_ID ?? ""}
        locationId={process.env.SQUARE_LOCATION_ID ?? ""}
        email={user.email}
        name={user.name}
      />
    </div>
  );
}
