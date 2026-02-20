import type { Metadata } from "next";
import Hero from "@/components/landing/Hero";
import MainSection from "@/components/landing/MainSection";
import Offerings from "@/components/landing/Offerings";
import Calendar from "@/components/landing/Calendar";
import GiftCardBanner from "@/components/landing/GiftCardBanner";
import SectionDivider from "@/components/landing/SectionDivider";

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
      <SectionDivider />
      <Offerings />
      <SectionDivider />
      <GiftCardBanner />
      <SectionDivider />
      <Calendar />
    </div>
  );
}
