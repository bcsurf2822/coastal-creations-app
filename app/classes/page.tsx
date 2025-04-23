export default function Classes() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-4xl">
        <h1 className="text-3xl font-bold text-center mb-8">Our Classes</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* Canvas Easel Party */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-2">Canvas Easel Party</h2>
            <p className="text-lg font-medium text-blue-600 mb-4">
              $30 per child (10 child minimum)
            </p>

            <h3 className="text-lg font-medium mb-2">What&apos;s Included:</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>1.5 Hours Studio Rental</li>
              <li>Guided Instruction</li>
              <li>Pre-Designed Canvas</li>
              <li>
                Easel, Canvas Pad, Paint, and a Travel Friendly Carrying Case
              </li>
            </ul>

            <p className="text-gray-700">
              Choose up to 6 unique pre-designed canvas options! Our instructor
              will guide your group through the painting process. Each child
              will take home their very own masterpiece and a travel tote with a
              canvas pad and paint for future creative adventures.
            </p>
          </div>

          {/* Expressive Paint Party */}
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            <h2 className="text-2xl font-semibold mb-2">
              Expressive Paint Party
            </h2>
            <p className="text-lg font-medium text-blue-600 mb-4">
              $25 per child (10 child minimum)
            </p>

            <h3 className="text-lg font-medium mb-2">What&apos;s Included:</h3>
            <ul className="list-disc pl-5 mb-4">
              <li>1.5 Hours Studio Rental</li>
              <li>Facilitator for Assistance</li>
              <li>8x10 Canvas and Paint</li>
              <li>Specialty tool, brushes, and textures</li>
            </ul>

            <p className="text-gray-700">
              Children receive an 8x10 canvas with all paints, brushes,
              specialty tools, and textures to create an abstract masterpiece.
              This party does not have guidelines to paint. Grab a tool &amp;
              paint your heart out!
            </p>
          </div>
        </div>

        <div className="text-center mt-8">
          <p className="mb-4">Contact us for availability!</p>
          <a
            href="/contact"
            className="inline-block bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Book Now
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
