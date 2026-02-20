import type { Metadata } from "next";
import { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "All Classes & Workshops",
  description:
    "Browse all art classes, workshops, events, and camps at Coastal Creations Studio in Ocean City, NJ. Find your perfect creative experience.",
};

export default function ClassesWorkshopsLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
