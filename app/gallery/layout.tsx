import type { Metadata } from "next";
import { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Gallery",
  description:
    "Browse photos from classes, workshops, and events at Coastal Creations Studio in Ocean City, NJ. See the amazing creations from our community.",
};

export default function GalleryLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
