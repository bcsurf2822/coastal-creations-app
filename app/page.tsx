import Hero from "@/components/landing/Hero";
import MainSection from "@/components/landing/MainSection";
import Offerings from "@/components/landing/Offerings";
import Calendar from "@/components/landing/Calendar";
import GiftCardBanner from "@/components/landing/GiftCardBanner";

export default function Home() {
  return (
    <div className="min-h-screen m-0 p-0 bg-transparent">
      <Hero />
      <MainSection />
      <Offerings />
      <GiftCardBanner />
      <Calendar />
    </div>
  );
}
