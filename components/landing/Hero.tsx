import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="absolute inset-0 z-0">
        <Image
          src="/assets/backgrounds/seaAndBrushSolidBG.png"
          alt="Coastal pattern background"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-white/60" />
      </div>

      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-serif text-5xl md:text-6xl font-bold text-primary leading-tight mb-8">
            Welcome to Coastal Creations Studio
          </h2>

          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/classes"
              className="bg-neutral-900 hover:bg-neutral-600 text-white font-medium px-8 py-3 rounded-md transition duration-300"
            >
              Classes
            </Link>
            <Link
              href="/about"
              className="bg-white border border-gray-300 hover:border-gray-600 text-primary hover:bg-light font-medium px-8 py-3 rounded-md transition duration-300"
            >
              About
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
