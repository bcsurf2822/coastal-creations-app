import Image from "next/image";

export default function Offerings() {
  return (
    <section className="py-20 md:py-28">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16">
            <div>
              <h4 className="text-secondary uppercase tracking-widest text-sm font-medium mb-3">
                What We Offer
              </h4>
              <h3 className="serif text-4xl font-bold text-primary">
                Creative Experiences
              </h3>
            </div>
            <p className="text-gray-600 max-w-md mt-4 md:mt-0">
              We provide a variety of classes, workshops, and creative
              opportunities for artists of all ages and skill levels.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 border border-gray-200 rounded-lg hover:border-primary hover:shadow-lg transition duration-300">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/paintingAction1.jpeg"
                  alt="Canvas and Collage"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-12 h-12 bg-light rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary transition duration-300">
                <i
                  data-lucide="paintbrush"
                  className="w-6 h-6 text-primary group-hover:text-white transition duration-300"
                ></i>
              </div>
              <h4 className="text-xl font-semibold text-primary mb-4">
                Canvas & Collage
              </h4>
              <p className="text-gray-600 mb-6 group-hover:text-gray-800 transition duration-300">
                Regular classes in various mediums including watercolor,
                acrylics, oils, collage, and mixed media.
              </p>
              <a href="#" className="flex items-center text-secondary">
                <span className="mr-2">Learn more</span>
                <i data-lucide="arrow-right" className="w-4 h-4"></i>
              </a>
            </div>
            <div className="group p-8 border border-gray-200 rounded-lg hover:border-primary hover:shadow-lg transition duration-300">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/studio.jpeg"
                  alt="Workshops"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-12 h-12 bg-light rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary transition duration-300">
                <i
                  data-lucide="calendar"
                  className="w-6 h-6 text-primary group-hover:text-white transition duration-300"
                ></i>
              </div>
              <h4 className="text-xl font-semibold text-primary mb-4">
                Workshops
              </h4>
              <p className="text-gray-600 mb-6 group-hover:text-gray-800 transition duration-300">
                Focused sessions on specific techniques, coastal themes, and
                guest artist presentations.
              </p>
              <a href="#" className="flex items-center text-secondary">
                <span className="mr-2">Learn more</span>
                <i data-lucide="arrow-right" className="w-4 h-4"></i>
              </a>
            </div>
            <div className="group p-8 border border-gray-200 rounded-lg hover:border-primary hover:shadow-lg transition duration-300">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/groupCollage.jpeg"
                  alt="Birthday Parties"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="w-12 h-12 bg-light rounded-lg flex items-center justify-center mb-6 group-hover:bg-primary transition duration-300">
                <i
                  data-lucide="image"
                  className="w-6 h-6 text-primary group-hover:text-white transition duration-300"
                ></i>
              </div>
              <h4 className="text-xl font-semibold text-primary mb-4">
                Birthday Parties
              </h4>
              <p className="text-gray-600 mb-6 group-hover:text-gray-800 transition duration-300">
                Celebrate your child&apos;s birthday with a fun and creative
                party
              </p>
              <a href="#" className="flex items-center text-secondary">
                <span className="mr-2">Learn more</span>
                <i data-lucide="arrow-right" className="w-4 h-4"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
