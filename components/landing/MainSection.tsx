"use client";

import Image from "next/image";
import { EB_Garamond } from "next/font/google";
import { usePageContent } from "@/hooks/usePageContent";
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
    <section id="main-section" className="py-16 md:py-24 relative ">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="flex justify-center md:justify-start w-full md:w-1/2">
              <div className="relative w-fit h-[400px] md:h-[500px] rounded-[2.5rem] overflow-hidden shadow-lg">
                <Image
                  src="/assets/images/CoastalCreationsStreet.jpeg"
                  alt="Studio with Tables"
                  width={350}
                  height={420}
                  className="object-cover w-full h-full"
                  priority
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 536px"
                  quality={100}
                />
              </div>
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h3
                className={`${ebGaramond.className} text-3xl md:text-5xl font-bold mb-6 text-gray-900 text-center`}
              >
                {content?.homepage?.mainSection?.title || DEFAULT_TEXT.homepage.mainSection.title}
              </h3>
              <p
                className={`${ebGaramond.className} text-lg font-bold md:text-xl text-gray-600 leading-relaxed text-justify`}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
