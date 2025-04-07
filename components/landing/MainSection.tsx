import Image from "next/image";

export default function MainSection() {
  return (
    <section className="py-16 md:py-24 bg-light">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full h-[600px] md:h-[800px]">
            <Image
              src="/assets/images/groupCollage.jpeg"
              alt="Group Collage"
              fill
              className="object-cover rounded-lg"
              priority
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 1072px"
              quality={100}
            />
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark/70 to-transparent text-white p-8 md:p-12 rounded-b-lg">
              <div className="max-w-2xl">
                <h3 className="serif text-5xl font-bold mb-4">
                  Our Creative Space
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
