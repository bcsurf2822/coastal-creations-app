import type { Metadata } from "next";
import { ReactElement, ReactNode } from "react";

export const metadata: Metadata = {
  title: "Art Camps",
  description:
    "Art camps for kids and teens at Coastal Creations Studio in Ocean City, NJ. Learn new techniques, make friends, and bring your imagination to life.",
};

export default function CampsLayout({
  children,
}: {
  children: ReactNode;
}): ReactElement {
  return <>{children}</>;
}
