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

          <div className="flex flex-wrap justify-center gap-6 mt-10">
            <Link
              href="/classes"
              className="bg-slate-800 hover:bg-slate-700 text-white font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-lg tracking-wide"
            >
              Explore Classes
            </Link>
            <Link
              href="/about"
              className="bg-white hover:bg-gray-50 border-2 border-slate-600 text-slate-700 font-semibold px-8 py-3.5 rounded-lg transition-all duration-300 hover:scale-105 shadow-md hover:shadow-lg text-lg tracking-wide"
            >
              About Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
