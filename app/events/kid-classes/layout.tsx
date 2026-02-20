import type { Metadata } from "next";
import { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Kid Workshops",
  description:
    "Fun and creative art workshops for kids at Coastal Creations Studio in Ocean City, NJ. Guided activities with full creative freedom.",
};

export default function KidClassesLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
