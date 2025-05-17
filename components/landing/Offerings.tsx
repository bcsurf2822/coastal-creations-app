import Image from "next/image";
import Link from "next/link";

export default function Offerings() {
  return (
    <section className="py-20 md:py-28 ">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-16 flex flex-col items-start">
            <div className="mb-6">
              <h4 className="text-secondary uppercase tracking-widest text-sm font-medium mb-3">
                What We Offer
              </h4>
              <h3 className="serif text-4xl font-bold text-primary">
                Creative Experiences
              </h3>
            </div>
            <p className="text-neutral-900 max-w-md mx-auto text-center  font-semibold">
              We provide a variety of classes, workshops, and creative
              opportunities for artists of all ages and skill levels.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="group p-8 border border-neutral-100 bg-neutral-50 rounded-lg hover:border-primary shadow-[-8px_8px_15px_rgba(0,0,0,0.15)] hover:shadow-lg transition duration-300 flex flex-col h-full">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/paintingAction1.jpeg"
                  alt="Canvas and Collage"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
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
                Art Camps
              </h4>
              <p className="text-gray-600 mb-6 group-hover:text-gray-800 transition duration-300">
                Hands-on art camps where kids explore creativity, build skills,
                and have fun together.
              </p>
              <div className="mt-auto flex justify-end">
                <Link
                  href={"/classes"}
                  className="inline-flex items-center px-4 py-2 bg-light text-dark font-medium rounded-lg shadow-md hover:bg-primary hover:text-blue-900 hover:shadow-lg transition duration-300"
                >
                  <span className="mr-2">Learn more</span>
                  <i data-lucide="arrow-right" className="w-4 h-4"></i>
                </Link>
              </div>
            </div>
            <div className="group p-8 border border-neutral-100 bg-neutral-50 rounded-lg hover:border-primary shadow-[-8px_8px_15px_rgba(0,0,0,0.15)] hover:shadow-lg transition duration-300 flex flex-col h-full">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/cupcakePainting.png"
                  alt="Workshops"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
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
                Weekly workshops offering focused, guided art sessions for kids
                and adults of all skill levels.
              </p>
              <div className="mt-auto flex justify-end">
                <Link
                  href={"/classes"}
                  className="inline-flex items-center px-4 py-2 bg-light text-dark font-medium rounded-lg shadow-md hover:bg-primary hover:text-blue-900 hover:shadow-lg transition duration-300"
                >
                  <span className="mr-2">Learn more</span>
                  <i data-lucide="arrow-right" className="w-4 h-4"></i>
                </Link>
              </div>
            </div>
            <div className="group p-8 border border-neutral-100 bg-neutral-50 rounded-lg hover:border-primary shadow-[-8px_8px_15px_rgba(0,0,0,0.15)] hover:shadow-lg transition duration-300 flex flex-col h-full">
              <div className="relative w-full h-48 mb-6 rounded-lg overflow-hidden">
                <Image
                  src="/assets/images/groupCollage.jpeg"
                  alt="Birthday Parties"
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover object-[center_40%]"
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
                Our art-themed celebrations include guided projects, materials,
                and colorful memories!
              </p>
              <div className="mt-auto flex justify-end">
                <Link
                  href={"/classes/birthday-parties"}
                  className="inline-flex items-center px-4 py-2 bg-light text-dark font-medium rounded-lg shadow-md hover:bg-primary hover:text-blue-900 hover:shadow-lg transition duration-300"
                >
                  <span className="mr-2">Learn more</span>
                  <i data-lucide="arrow-right" className="w-4 h-4"></i>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
