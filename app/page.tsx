import type { Metadata } from "next";
import Image from "next/image";
import Hero from "@/components/landing/Hero";
import MainSection from "@/components/landing/MainSection";
import Offerings from "@/components/landing/Offerings";
import Calendar from "@/components/landing/Calendar";
import ShopPreview from "@/components/landing/ShopPreview";
import GiftCardBanner from "@/components/landing/GiftCardBanner";
import SectionDivider from "@/components/landing/SectionDivider";
import PhotoCorral from "@/components/gallery/PhotoCorral";

export const metadata: Metadata = {
  title: "Coastal Creations Studio | Art Classes & Workshops in Ocean City, NJ",
  description:
    "Discover art classes, workshops, camps, and private events at Coastal Creations Studio in Ocean City, NJ. Creative experiences for all ages and skill levels.",
};

export default function Home() {
  return (
    <div className="min-h-screen m-0 p-0 bg-transparent">
      <Hero />
      <MainSection />
      <div className="pointer-events-none relative mx-auto flex w-full max-w-[var(--container-max)] items-center justify-center px-4 sm:px-6 lg:px-8" aria-hidden="true">
        <Image
          src="/assets/svg/page-break/waes.svg"
          alt=""
          width={500}
          height={500}
          className="mx-auto h-28 w-full object-contain opacity-50 sm:h-40"
        />
      </div>
      <PhotoCorral destination="home-page" />
      <SectionDivider />
      <Offerings />
      <SectionDivider />
      <ShopPreview />
      <SectionDivider />
      <GiftCardBanner />
      <SectionDivider />
      <Calendar />
    </div>
  );
}
