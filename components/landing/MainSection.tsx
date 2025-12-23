"use client";

import Image from "next/image";
import Link from "next/link";
import { EB_Garamond } from "next/font/google";
import { usePageContent } from "@/hooks/queries";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";

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
      {/* Starfish on top-left of storefront image - outside main container for z-index */}
      <div className="absolute top-2 left-28 md:top-6 md:left-36 lg:top-8 lg:left-52 z-20 pointer-events-none">
        <Image
          src="/assets/svg/starfish.svg"
          alt="Starfish"
          width={220}
          height={220}
          className="w-44 md:w-52 lg:w-60 -rotate-12 opacity-95"
        />
      </div>

      {/* Decorative SVG Clusters - No Animation */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">

        {/* ALL OTHER SVGs: Clustered around "Our Creative Space" text and button */}
        <div className="absolute top-1/2 right-0 lg:right-[5%] -translate-y-1/2 w-[50%] h-[85%] hidden lg:block">

          {/* Star near title */}
          <div className="absolute -top-4 right-32 lg:right-40">
            <Image
              src="/assets/svg/star.svg"
              alt="Star"
              width={200}
              height={200}
              className="w-40 lg:w-48 -rotate-[30deg] opacity-90"
            />
          </div>

          {/* Main cluster around and below the button area */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/3">
            <div className="relative">
              {/* Shells grouped together */}
              <div className="relative top-6 lg:top-8">
                <Image
                  src="/assets/svg/shell3-art.svg"
                  alt="Shell art"
                  width={220}
                  height={220}
                  className="w-44 lg:w-56 -rotate-6 opacity-95"
                />
                <Image
                  src="/assets/svg/shell2.svg"
                  alt="Shell"
                  width={140}
                  height={140}
                  className="absolute top-8 lg:top-12 left-32 lg:left-40 w-32 lg:w-36 rotate-12 opacity-85"
                />
              </div>
              {/* Mosaic to the left */}
              <Image
                src="/assets/svg/mosaic-art.svg"
                alt="Mosaic art"
                width={200}
                height={200}
                className="absolute top-24 lg:top-32 -left-[26rem] lg:-left-[32rem] w-40 lg:w-48 opacity-90"
              />
              {/* Rock and Eagles grouped together */}
              <div className="absolute top-32 lg:top-36 -left-28 lg:-left-32">
                <Image
                  src="/assets/svg/rock-art.svg"
                  alt="Rock art"
                  width={120}
                  height={120}
                  className="w-24 lg:w-32 -rotate-6 opacity-90"
                />
                <Image
                  src="/assets/svg/egales-art.svg"
                  alt="Eagles art"
                  width={120}
                  height={120}
                  className="absolute -top-4 left-16 lg:left-20 w-24 lg:w-32 rotate-12 opacity-90"
                />
              </div>
              {/* Paintings cluster - all in one div, tightly overlapping */}
              <div className="absolute -top-44 lg:-top-52 left-20 lg:left-28 w-[30rem] h-[28rem] lg:w-[38rem] lg:h-[34rem]">
                <Image
                  src="/assets/svg/jellyfish-art.svg"
                  alt="Jellyfish art"
                  width={600}
                  height={650}
                  className="absolute top-0 left-0 w-96 lg:w-[28rem] rotate-[-5deg]"
                />
                <Image
                  src="/assets/svg/seahorse-art.svg"
                  alt="Seahorse art"
                  width={550}
                  height={600}
                  className="absolute top-4 left-28 lg:left-36 w-80 lg:w-96 rotate-[8deg]"
                />
                <Image
                  src="/assets/svg/flowers-paint.svg"
                  alt="Flowers"
                  width={550}
                  height={480}
                  className="absolute top-40 lg:top-48 left-12 lg:left-16 w-80 lg:w-96 -rotate-2"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Mobile: Simplified cluster */}
        <div className="absolute bottom-4 right-2 lg:hidden">
          <div className="relative">
            <Image
              src="/assets/svg/shell3-art.svg"
              alt="Shell art"
              width={130}
              height={130}
              className="w-32 -rotate-6 opacity-95"
            />
            <Image
              src="/assets/svg/jellyfish-art.svg"
              alt="Jellyfish art"
              width={100}
              height={110}
              className="absolute -top-10 left-20 w-24 rotate-3 opacity-90"
            />
          </div>
        </div>
      </div>

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
