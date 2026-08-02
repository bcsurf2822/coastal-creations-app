import type { Metadata } from "next";
import Image from "next/image";
import Hero from "@/components/landing/Hero";
import MainSection from "@/components/landing/MainSection";
import Offerings from "@/components/landing/Offerings";
import Calendar from "@/components/landing/Calendar";
import ShopPreview from "@/components/landing/ShopPreview";
import GiftCardBanner from "@/components/landing/GiftCardBanner";
// TEMP DISABLED (Ben, 2026-08-02): Google Reviews isn't wired to real data yet —
// keep it out of prod until the Places API key is actually configured.
// import GoogleReviews from "@/components/landing/GoogleReviews";
import SectionDivider from "@/components/landing/SectionDivider";
import PhotoCorral from "@/components/gallery/PhotoCorral";
// Only referenced inside the disabled GoogleReviews block below — commented out with it.
// import { isShopEnabled } from "@/lib/constants/featureFlags";

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
      {/* TEMP DISABLED (Ben, 2026-08-02): not wired to real data yet, don't show in prod.
          Was previously gated behind the shop launch flag alongside the store (client request);
          re-enable that gate (isShopEnabled()) once real reviews are wired up. */}
      {/* {isShopEnabled() && (
        <>
          <GoogleReviews />
          <SectionDivider />
        </>
      )} */}
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
