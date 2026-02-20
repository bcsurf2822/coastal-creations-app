"use client";

import type { ReactElement } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { EB_Garamond } from "next/font/google";
import { usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";
import { Button } from "@/components/ui";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

interface FeaturePill {
  label: string;
  icon: ReactElement;
}

const FEATURE_PILLS: FeaturePill[] = [
  {
    label: "Walk-ins Welcome",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    ),
  },
  {
    label: "All Ages",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"
        />
      </svg>
    ),
  },
  {
    label: "No Experience Needed",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
        />
      </svg>
    ),
  },
  {
    label: "Guided by Artists",
    icon: (
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
        />
      </svg>
    ),
  },
];

const MainSection = (): ReactElement => {
  const router = useRouter();
  const { content } = usePageContent();

  const description = content?.homepage?.mainSection?.description
    ? portableTextToPlainText(content.homepage.mainSection.description)
    : DEFAULT_TEXT.homepage.mainSection.description;

  return (
    <section id="creative-space" className="bg-transparent py-10 md:py-16">
      <div className="mx-auto w-full max-w-[var(--container-max)] px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-white/65 bg-white/78 p-6 shadow-[0_14px_30px_rgba(12,74,110,0.12)] backdrop-blur-[2px] md:p-10">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="relative">
            <div className="rounded-[2rem] border border-sky-100 bg-white p-3 shadow-[0_20px_40px_rgba(12,74,110,0.15)] md:p-4">
              <div className="overflow-hidden rounded-[1.5rem]">
                <Image
                  src="/assets/images/CoastalCreationsStreet.jpeg"
                  alt="Coastal Creations Studio storefront"
                  width={620}
                  height={680}
                  className="h-[360px] w-full object-cover md:h-[500px]"
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  quality={100}
                />
              </div>
            </div>

            <div className="pointer-events-none absolute -right-8 top-8 hidden md:block">
              <Image
                src="/assets/svg/starfish.svg"
                alt="Decorative starfish"
                width={140}
                height={140}
                className="rotate-[-12deg] opacity-55"
              />
              <Image
                src="/assets/svg/shell-paint.svg"
                alt="Decorative shell"
                width={90}
                height={90}
                className="-mt-5 ml-16 rotate-12 opacity-50"
              />
            </div>
          </div>

          <div>
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-secondary">
              Our Studio
            </p>
            <h2
              className={`${ebGaramond.className} mb-5 text-4xl font-bold leading-tight text-primary md:text-5xl`}
            >
              {content?.homepage?.mainSection?.title || DEFAULT_TEXT.homepage.mainSection.title}
            </h2>
            <p
              className={`${ebGaramond.className} mb-8 text-lg leading-relaxed text-slate-700 md:text-xl`}
            >
              {description}
            </p>

            <ul className="mb-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FEATURE_PILLS.map((feature) => (
                <li
                  key={feature.label}
                  className="flex items-center justify-center gap-2 rounded-full border border-sky-100 bg-sky-50/60 px-4 py-2.5 text-center text-sm font-semibold text-primary shadow-[0_4px_12px_rgba(12,74,110,0.08)]"
                >
                  <span className="text-secondary">{feature.icon}</span>
                  <span>{feature.label}</span>
                </li>
              ))}
            </ul>

            <div className="grid w-full max-w-[28rem] grid-cols-1 gap-3 sm:grid-cols-2">
              <Button
                variant="primary"
                size="lg"
                className="w-full border-2 border-transparent transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
                onClick={() => router.push("/about")}
              >
                Learn More About Us
              </Button>
              <Button
                variant="secondary"
                size="lg"
                className="w-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md"
                onClick={() => router.push("/reservations")}
              >
                Book Reservations
              </Button>
            </div>
          </div>
        </div>
        </div>
      </div>
    </section>
  );
};

export default MainSection;
