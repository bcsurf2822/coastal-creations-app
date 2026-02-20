import type { Metadata } from "next";
import { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Live Artist Painting",
  description:
    "Watch talented artists create live at Coastal Creations Studio in Ocean City, NJ. Observe the process, learn techniques, and get inspired.",
};

export default function LiveArtistLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
