import Image from "next/image";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Studio Section */}
      <section className="py-20 md:py-28">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative w-full h-[600px] md:h-[800px] rounded-2xl overflow-hidden">
                <Image
                  src="/assets/images/ashleyAbout.jpeg"
                  alt="Laura Epsom"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <h2 className="font-serif text-6xl md:text-7xl font-bold text-primary mb-8">
                  Our Studio
                </h2>
                <p className="text-gray-600 text-lg md:text-xl mb-6 leading-relaxed">
                  Laura Epsom tax and a space for an image. Lorem ipsum dolor
                  sit amet, consectetur adipiscing elit. Nullam in dui mauris.
                  Vivamus hendrerit arcu sed erat molestie vehicula. Sed auctor
                  neque eu tellus rhoncus ut eleifend nibh porttitor.
                </p>
                <p className="text-gray-600 text-lg md:text-xl leading-relaxed">
                  Fusce dapibus, tellus ac cursus commodo, tortor mauris
                  condimentum nibh, ut fermentum massa justo sit amet risus.
                  Cras mattis consectetur purus sit amet fermentum.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
