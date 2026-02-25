"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EB_Garamond } from "next/font/google";
import imageUrlBuilder from "@sanity/image-url";
import type { SanityImageSource } from "@sanity/image-url/lib/types/types";
import { client } from "@/sanity/client";
import { usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";
import { Button, Card } from "@/components/ui";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Sanity image URL builder
const { projectId, dataset } = client.config();
const urlFor = (source: SanityImageSource): string | null => {
  if (!projectId || !dataset) return null;
  return imageUrlBuilder({ projectId, dataset })
    .image(source)
    .width(800)
    .quality(85)
    .url();
};

interface OfferingCardData {
  image: string;
  alt: string;
  title: string;
  description: string;
  buttonLabel: string;
  href: string;
}

const DEFAULT_IMAGES = {
  artCamps: "/assets/images/paintingAction1.jpeg",
  classesWorkshops: "/assets/images/classes_workshops.jpeg",
  privateEvents: "/assets/images/private_events.png",
};

const Offerings = (): ReactElement => {
  const router = useRouter();
  const { content } = usePageContent();

  const sectionSubtitle = content?.homepage?.offerings?.sectionSubtitle
    ? portableTextToPlainText(content.homepage.offerings.sectionSubtitle)
    : DEFAULT_TEXT.homepage.offerings.sectionSubtitle;

  const getCardImage = (
    sanityImage: SanityImageSource | undefined,
    fallback: string,
  ): string => {
    if (sanityImage) {
      const url = urlFor(sanityImage);
      if (url) return url;
    }
    return fallback;
  };

  const cards: OfferingCardData[] = [
    {
      image: getCardImage(
        content?.homepage?.offerings?.artCamps?.image,
        DEFAULT_IMAGES.artCamps,
      ),
      alt: "Kids creating art camp projects",
      title:
        content?.homepage?.offerings?.artCamps?.title ||
        DEFAULT_TEXT.homepage.offerings.artCamps.title,
      description: content?.homepage?.offerings?.artCamps?.description
        ? portableTextToPlainText(content.homepage.offerings.artCamps.description)
        : DEFAULT_TEXT.homepage.offerings.artCamps.description,
      buttonLabel: "Upcoming Camps",
      href: "/events/camps",
    },
    {
      image: getCardImage(
        content?.homepage?.offerings?.classesWorkshops?.image,
        DEFAULT_IMAGES.classesWorkshops,
      ),
      alt: "Group classes and workshops",
      title:
        content?.homepage?.offerings?.classesWorkshops?.title ||
        DEFAULT_TEXT.homepage.offerings.classesWorkshops.title,
      description: content?.homepage?.offerings?.classesWorkshops?.description
        ? portableTextToPlainText(
            content.homepage.offerings.classesWorkshops.description
          )
        : DEFAULT_TEXT.homepage.offerings.classesWorkshops.description,
      buttonLabel: "Upcoming Classes",
      href: "/events/classes-workshops",
    },
    {
      image: getCardImage(
        content?.homepage?.offerings?.privateEvents?.image,
        DEFAULT_IMAGES.privateEvents,
      ),
      alt: "Private events at Coastal Creations",
      title:
        content?.homepage?.offerings?.privateEvents?.title ||
        DEFAULT_TEXT.homepage.offerings.privateEvents.title,
      description: content?.homepage?.offerings?.privateEvents?.description
        ? portableTextToPlainText(content.homepage.offerings.privateEvents.description)
        : DEFAULT_TEXT.homepage.offerings.privateEvents.description,
      buttonLabel: "Learn More",
      href: "/events/private-events",
    },
  ];

  return (
    <section id="creative-experiences" className="bg-transparent py-10 md:py-16">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/65 bg-white/74 p-6 shadow-[0_14px_28px_rgba(12,74,110,0.1)] backdrop-blur-[2px] md:p-8">
          <div className="mb-10 md:mb-12">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              What We Offer
            </p>
            <h2
              className={`${ebGaramond.className} mb-4 text-4xl font-bold text-primary md:text-5xl`}
            >
              {content?.homepage?.offerings?.sectionTitle ||
                DEFAULT_TEXT.homepage.offerings.sectionTitle}
            </h2>
            <p className="max-w-2xl text-lg leading-relaxed text-slate-700">{sectionSubtitle}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {cards.map((card) => (
              <Card
                key={card.title}
                variant="featured"
                className="group flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] border border-sky-100 p-0 shadow-[0_10px_28px_rgba(12,74,110,0.1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_34px_rgba(12,74,110,0.18)]"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={card.image}
                    alt={card.alt}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  />
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <h3
                    className={`${ebGaramond.className} mb-3 text-2xl font-semibold leading-tight text-primary`}
                  >
                    {card.title}
                  </h3>
                  <p className="mb-6 line-clamp-2 min-h-[3rem] text-base leading-relaxed text-slate-700">
                    {card.description}
                  </p>

                  <Button
                    variant="primary"
                    className="mt-auto w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                    onClick={() => router.push(card.href)}
                  >
                    {card.buttonLabel}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Offerings;
