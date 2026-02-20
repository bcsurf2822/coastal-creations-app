import type { Metadata } from "next";
import { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Adult Workshops",
  description:
    "Browse adult art workshops at Coastal Creations Studio in Ocean City, NJ. Painting, pottery, and more for all experience levels.",
};

export default function AdultClassesLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
