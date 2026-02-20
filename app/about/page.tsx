import type { Metadata } from "next";
import About from "@/components/about/About";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about Coastal Creations Studio in Ocean City, NJ. Our story, our mission, and our passion for bringing creative experiences to the community.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen ">
      {/* Studio Section */}
      <section className="py-20 md:py-28">
        <About />
      </section>
    </div>
  );
}
