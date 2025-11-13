"use client";

import Image from "next/image";
import { usePageContent } from "@/hooks/usePageContent";
import { DEFAULT_TEXT } from "@/lib/constants/defaultPageContent";
import { portableTextToPlainText } from "@/lib/utils/portableTextHelpers";

export default function About() {
  const { content } = usePageContent();

  // Get description as plain text
  const description = content?.otherPages?.about?.description
    ? portableTextToPlainText(content.otherPages.about.description)
    : DEFAULT_TEXT.otherPages.about.description;

  return (
    <div className="container mx-auto px-6 md:px-12 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative w-full h-[550px] md:h-[750px] rounded-3xl overflow-hidden shadow-xl ">
            <Image
              src="/assets/images/ashley_about.jpeg"
              alt="Laura Epsom"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="bg-white/80 p-8 rounded-2xl shadow-sm">
            <h2
              className="font-bold text-5xl md:text-6xl text-primary mb-8 leading-tight"
              style={{ fontFamily: "Comic Neue", fontWeight: 700 }}
            >
              {content?.otherPages?.about?.title || DEFAULT_TEXT.otherPages.about.title}
            </h2>
            <div className="space-y-6">
              <p
                className="text-gray-700 text-lg md:text-xl leading-relaxed text-justify"
                style={{ fontFamily: "Comic Neue", fontWeight: 700 }}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
