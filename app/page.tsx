import Hero from "@/components/landing/Hero";
import MainSection from "@/components/landing/MainSection";

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Hero />

      {/* Main Section */}
      <MainSection />

      {/* Creative Experiences Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-center text-2xl font-bold">
            Creative Experiences
          </h2>
        </div>
      </section>

      {/* Calendar Section */}
      <section className="py-20 md:py-28 bg-light">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-center text-2xl font-bold">Calendar</h2>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 md:py-16 bg-white border-t border-gray-100">
        <div className="container mx-auto px-6 md:px-12">
          <h2 className="text-center text-2xl font-bold">Footer</h2>
        </div>
      </footer>
    </div>
  );
}
