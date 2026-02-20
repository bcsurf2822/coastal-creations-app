import type { Metadata } from "next";
import { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Special art events and workshops at Coastal Creations Studio in Ocean City, NJ. Experience creativity in action.",
};

export default function EventsLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
