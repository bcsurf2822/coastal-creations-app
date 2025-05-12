import Image from "next/image";

export default function MainSection() {
  return (
    <section id="main-section" className="py-16 md:py-24 relative ">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto overflow-hidden">
          <div className="flex flex-col md:flex-row">
            <div className="relative w-full md:w-1/2 h-[400px] md:h-[500px]">
              <Image
                src="/assets/images/ccStudio1.png"
                alt="Studio with Tables"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 536px"
                quality={100}
              />
            </div>
            <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
              <h3 className="serif text-3xl md:text-4xl font-bold mb-6 text-gray-900 text-center">
                Our Creative Space
              </h3>
              <p className="text-base md:text-lg text-gray-600 leading-relaxed">
                &ldquo;Welcome to Coastal Creations, where creativity meets the
                coast! Our art studio offers a vibrant space to walk in and
                unleash your inner artist. From canvas painting and collage
                making to mosaics and exciting workshops, there&apos;s something
                for everyone. Whether you&apos;re celebrating a birthday or
                simply seeking inspiration, we invite you to create with courage
                and explore your artistic potential. Join us at Coastal
                Creations – where every creation is a masterpiece in the
                making!&rdquo;
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
