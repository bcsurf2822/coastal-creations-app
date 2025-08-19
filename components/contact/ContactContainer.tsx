import { EB_Garamond } from "next/font/google";
import ContactForm from "./ContactForm";

const ebGaramond = EB_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function ContactContainer() {
  return (
    <section className="py-16 md:py-24 relative bg-gray-50">
      <div className="container mx-auto px-6 md:px-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1
              className={`${ebGaramond.className} text-4xl md:text-6xl font-bold mb-6 text-gray-900`}
            >
              Contact Us
            </h1>
            <p
              className={`${ebGaramond.className} text-xl md:text-2xl text-gray-600 leading-relaxed max-w-3xl mx-auto`}
            >
              Have questions about our classes, workshops, or studio? We&apos;d love to hear from you! 
              Send us a message and we&apos;ll get back to you as soon as possible.
            </p>
          </div>

          {/* Contact Form */}
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
            <h2
              className={`${ebGaramond.className} text-2xl md:text-3xl font-bold mb-6 text-gray-900 text-center`}
            >
              Send us a Message
            </h2>
            <ContactForm />
          </div>
        </div>
      </div>
    </section>
  );
}