"use client";

import Image from "next/image";
import Link from "next/link";
import { EB_Garamond } from "next/font/google";
import { usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";
import MainSectionDecorations from "./MainSectionDecorations";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function MainSection() {
  const { content } = usePageContent();

  // Convert PortableText to plain text
  const description = content?.homepage?.mainSection?.description
    ? portableTextToPlainText(content.homepage.mainSection.description)
    : DEFAULT_TEXT.homepage.mainSection.description;

  return (
    <section
      id="main-section"
      className="py-20 md:py-28 relative overflow-hidden"
    >
      <MainSectionDecorations />

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
            {/* Image Section */}
            <div className="w-full lg:w-1/2">
              <div className="relative">
                {/* Decorative background */}
                <div className="absolute -inset-4 bg-primary/10 rounded-3xl -rotate-3"></div>
                <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                  <Image
                    src="/assets/images/CoastalCreationsStreet.jpeg"
                    alt="Coastal Creations Studio Storefront"
                    width={600}
                    height={500}
                    className="object-cover w-full h-[400px] md:h-[500px]"
                    priority
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
                    quality={100}
                  />
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-1/2">
              <div className="space-y-6">
                {/* Heading */}
                <h3
                  className={`${ebGaramond.className} text-4xl md:text-5xl font-bold text-gray-900`}
                >
                  {content?.homepage?.mainSection?.title ||
                    DEFAULT_TEXT.homepage.mainSection.title}
                </h3>

                {/* Description - darker text for readability */}
                <p
                  className={`${ebGaramond.className} text-lg text-gray-800 leading-relaxed`}
                >
                  {description}
                </p>

                {/* Features */}
                <div className="grid grid-cols-2 gap-4 pt-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
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
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      Walk-ins Welcome
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
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
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      All Ages
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
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
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      No Experience Needed
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-primary"
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
                    </div>
                    <span className="text-gray-700 font-medium text-sm">
                      Guided by Artists
                    </span>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="pt-4">
                  <Link
                    href="/about"
                    className="inline-flex items-center gap-2 bg-primary text-white px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-md"
                  >
                    Learn More About Us
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M17 8l4 4m0 0l-4 4m4-4H3"
                      />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
