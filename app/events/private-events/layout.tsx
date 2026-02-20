import type { Metadata } from "next";
import { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Private Events",
  description:
    "Host your private event at Coastal Creations Studio in Ocean City, NJ. Birthday parties, team building, bridal showers, and custom creative experiences.",
};

export default function PrivateEventsLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
