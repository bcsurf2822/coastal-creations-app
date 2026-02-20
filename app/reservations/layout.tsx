import type { Metadata } from "next";
import { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Reservations",
  description:
    "Book your spot at Coastal Creations Studio in Ocean City, NJ. Reserve dates for open studio sessions, creative experiences, and more.",
};

export default function ReservationsLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
