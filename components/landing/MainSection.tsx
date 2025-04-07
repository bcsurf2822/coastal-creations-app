import Image from "next/image";
import Link from "next/link";

export default function MainSection() {
  return (
    <section className="py-16 md:py-24 bg-gray-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full h-[600px] md:h-[800px]">
            <Image
              src="/assets/images/mainSection.jpg"
              alt="Group Collage"
              fill
              className="object-cover rounded-lg"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1072px"
              quality={100}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="p-8 md:p-12 rounded-lg max-w-4xl mx-6 backdrop-blur-sm border-2 border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                <h3 className="serif text-4xl md:text-5xl font-bold mb-6 text-white">
                  Our Creative Space
                </h3>
                <p className="text-lg md:text-xl text-gray-200 mb-8 leading-relaxed">
                  &ldquo;Welcome to Coastal Creations, where creativity meets
                  the coast! Our art studio offers a vibrant space to walk in
                  and unleash your inner artist. From canvas painting and
                  collage making to mosaics and exciting workshops, there&apos;s
                  something for everyone. Whether you&apos;re celebrating a
                  birthday or simply seeking inspiration, we invite you to
                  create with courage and explore your artistic potential. Join
                  us at Coastal Creations – where every creation is a
                  masterpiece in the making!&rdquo;
                </p>
                <Link
                  href="/about"
                  className="inline-block bg-primary text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-dark transition-colors"
                >
                  Learn more about the studio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
