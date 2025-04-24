export default function Blog() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full max-w-3xl">
        <h1 className="text-4xl font-bold text-center sm:text-5xl">Our Blog</h1>

        <div className="w-full p-8 bg-white shadow-md rounded-lg">
          <h2 className="text-2xl font-semibold text-center mb-4">
            Coming Soon!
          </h2>
        </div>

        <div className="w-full p-6 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-center text-blue-600">
            Want to be notified when our blog launches?
            <a href="/contact" className="underline ml-1 font-medium">
              Contact us
            </a>{" "}
            to join our mailing list.
          </p>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center"></footer>
    </div>
  );
}
