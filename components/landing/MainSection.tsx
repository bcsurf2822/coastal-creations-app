import Image from "next/image";
import Link from "next/link";

export default function MainSection() {
  return (
    <section className="py-16 md:py-24 bg-white relative">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full h-[500px] md:h-[600px] mb-8 overflow-hidden">
            <Image
              src="/assets/images/ccStudio1.png"
              alt="Group Collage"
              fill
              className="object-cover rounded-lg"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1072px"
              quality={100}
              style={{ objectPosition: "center" }}
            />
          </div>
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="serif text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Our Creative Space
            </h3>
            <p className="text-base md:text-lg text-gray-600 mb-6 leading-relaxed">
              &ldquo;Welcome to Coastal Creations, where creativity meets the
              coast! Our art studio offers a vibrant space to walk in and
              unleash your inner artist. From canvas painting and collage making
              to mosaics and exciting workshops, there&apos;s something for
              everyone. Whether you&apos;re celebrating a birthday or simply
              seeking inspiration, we invite you to create with courage and
              explore your artistic potential. Join us at Coastal Creations –
              where every creation is a masterpiece in the making!&rdquo;
            </p>
            <Link
              href="/about"
              className="inline-block bg-primary text-white px-6 py-2 rounded-lg text-base font-medium hover:bg-primary-dark transition-colors"
            >
              Learn more about the studio
            </Link>
          </div>
        </div>
      </div>
      {/* Gradient overlay for smooth transition */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-[#7CD4D2] via-[#7CD4D2]/50 to-transparent"></div>
    </section>
  );
}
