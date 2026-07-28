"use client";

import type { ReactElement, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { FaPalette, FaUsers, FaPaintRoller, FaStore } from "react-icons/fa";
import { usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";
import { Button, Card } from "@/components/ui";

const SERIF = { fontFamily: "var(--font-eb-garamond), serif" } as const;

const FEATURES: { icon: ReactNode; title: string; body: string }[] = [
  {
    icon: <FaPalette />,
    title: "Classes & Workshops",
    body: "Guided sessions for every skill level — from mosaics to mixed media — led by artists who love to teach.",
  },
  {
    icon: <FaPaintRoller />,
    title: "Walk In & Create",
    body: "No reservation needed. Drop by during studio hours, pick a project, and let your creativity flow.",
  },
  {
    icon: <FaUsers />,
    title: "All Ages Welcome",
    body: "Kids, adults, families, and groups — our studio is a place for everyone to make something they're proud of.",
  },
  {
    icon: <FaStore />,
    title: "Shop & Gifts",
    body: "Art kits, studio goods, and works of art from local artists — perfect for gifts or creating on your own time.",
  },
];

export default function About(): ReactElement {
  const { content } = usePageContent();

  const title =
    content?.otherPages?.about?.title || DEFAULT_TEXT.otherPages.about.title;
  const description = content?.otherPages?.about?.description
    ? portableTextToPlainText(content.otherPages.about.description)
    : DEFAULT_TEXT.otherPages.about.description;

  return (
    <div className="container mx-auto px-6 md:px-12">
      <div className="mx-auto max-w-6xl space-y-16 md:space-y-24">
        {/* Intro: studio photo + story + CTAs */}
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-14">
          <div className="relative flex w-full items-center justify-center">
            <Image
              src="/assets/svg/ashley-rigid-bg.svg"
              alt="Ashley at Coastal Creations Studio"
              width={600}
              height={750}
              className="h-auto w-full max-w-md"
              priority
            />
          </div>
          <Card
            variant="featured"
            className="p-8 shadow-[0_10px_30px_rgba(12,74,110,0.1)] backdrop-blur md:p-10"
          >
            <h2
              className="mb-6 text-4xl font-bold leading-tight text-[var(--color-primary)] md:text-5xl"
              style={SERIF}
            >
              {title}
            </h2>
            <p className="text-lg leading-relaxed text-slate-700">
              {description}
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/events/classes-workshops">
                <Button variant="primary" size="lg">
                  Explore Classes
                </Button>
              </Link>
              <Link href="/walk-in">
                <Button variant="secondary" size="lg">
                  Walk In & Create
                </Button>
              </Link>
              <Link href="/shop">
                <Button variant="secondary" size="lg">
                  Shop for Gifts
                </Button>
              </Link>
            </div>
          </Card>
        </div>

        {/* What you'll find here */}
        <div>
          <h3
            className="mb-10 text-center text-3xl font-bold text-[var(--color-primary)] md:text-4xl"
            style={SERIF}
          >
            What you&apos;ll find here
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((feature) => (
              <Card
                key={feature.title}
                variant="event"
                className="h-full text-center transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-light)] text-2xl text-[var(--color-secondary)]">
                  {feature.icon}
                </div>
                <h4 className="mb-2 text-xl font-bold text-[var(--color-primary)]">
                  {feature.title}
                </h4>
                <p className="leading-relaxed text-slate-600">{feature.body}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
