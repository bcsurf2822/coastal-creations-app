import Image from "next/image";

export default function About() {
  return (
    <div className="container mx-auto px-6 md:px-12 py-16 md:py-24">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative w-full h-[550px] md:h-[750px] rounded-3xl overflow-hidden shadow-xl border-2 border-gray-100">
            <Image
              src="/assets/images/ashleyInCC.png"
              alt="Laura Epsom"
              fill
              className="object-cover object-center"
              priority
            />
          </div>
          <div className="bg-white p-8 rounded-2xl shadow-sm">
            <h2 className="font-serif text-5xl md:text-6xl font-bold text-primary mb-8 leading-tight">
              Our Studio
            </h2>
            <div className="space-y-6">
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
                Coastal Creations is a community-focused art studio located in
                the heart of Ocean City, New Jersey. Born from a lifelong dream
                and a love for creativity, our studio is a space where
                imagination thrives and artistic connections grow.
              </p>
              <p className="text-gray-700 text-lg md:text-xl leading-relaxed italic px-6">
                &ldquo; Since I was 16, I&apos;ve dreamed of creating a place
                where people of all ages and backgrounds could come together to
                express themselves through art — and now, that dream is a
                reality. &rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
