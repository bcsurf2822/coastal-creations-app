import Hero from "@/components/landing/Hero";
import MainSection from "@/components/landing/MainSection";
import Offerings from "@/components/landing/Offerings";
import Calendar from "@/components/landing/Calendar";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Main Section */}
      <MainSection />

      {/* Creative Experiences Section */}
      <Offerings />

      {/* Calendar Section */}
      <Calendar />
    </div>
  );
}
