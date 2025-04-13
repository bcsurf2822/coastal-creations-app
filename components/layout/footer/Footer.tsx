import { FaFacebook, FaInstagram, FaTwitter } from "react-icons/fa";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-blue-100 text-black py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Studio Info */}
          <div>
            <div className="relative w-32 h-32 mb-4">
              <Image
                src="/assets/logos/coastalLogo.png"
                alt="Coastal Creations Logo"
                fill
                className="object-contain"
              />
            </div>
          </div>

          {/* Hours */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Hours</h3>
            <ul className="space-y-1 text-black text-sm">
              <li>Monday - Friday: 9:00 AM - 6:00 PM</li>
              <li>Saturday: 10:00 AM - 4:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-2">Contact Us</h3>
            <div className="space-y-1 text-black text-sm">
              <p>123 Asbury Ave</p>
              <p>Ocean City, NJ 08226</p>
              <p>Phone: (609) 399-0030</p>
              <p>Email: info@coastalcreations.com</p>
            </div>
            <div className="mt-3 flex space-x-3">
              <a
                href="#"
                className="text-black hover:text-gray-700 transition-colors"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="#"
                className="text-black hover:text-gray-700 transition-colors"
              >
                <FaInstagram size={20} />
              </a>
              <a
                href="#"
                className="text-black hover:text-gray-700 transition-colors"
              >
                <FaTwitter size={20} />
              </a>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Sign Up for our Newsletter
            </h3>

            <form className="flex flex-col gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3 py-1.5 rounded text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="submit"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm transition-colors"
              >
                Subscribe
              </button>
            </form>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-gray-600 text-center text-black text-sm">
          <p>
            &copy; {new Date().getFullYear()} Coastal Creation Studios. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
