import { FaFacebook, FaInstagram } from "react-icons/fa";
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
            <h3 className="text-lg font-semibold mb-3">Hours</h3>
            <ul className="space-y-2 text-black">
              <li>
                <span className="font-semibold">Monday - Friday:</span> 9:00 AM
                - 6:00 PM
              </li>
              <li>
                <span className="font-semibold">Saturday:</span> 10:00 AM - 4:00
                PM
              </li>
              <li>
                <span className="font-semibold">Sunday:</span> Closed
              </li>
            </ul>
          </div>

          {/* Contact & Social */}
          <div>
            <h3 className="text-lg font-semibold mb-3">Contact Us</h3>
            <div className="space-y-2 text-black">
              <p className="flex items-center">
                <span>411 E 8th Street</span>
              </p>
              <p>Ocean City, NJ 08226</p>
              <p>
                <span className="font-bold">Phone:</span> (609) 399-0030
              </p>
              <p>
                <span className="font-bold">Email:</span>{" "}
                <a
                  href="mailto:ashley@coastalcreationsstudio.com"
                  className="hover:underline"
                >
                  ashley@coastalcreationsstudio.com
                </a>
              </p>
            </div>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://www.facebook.com/p/Coastal-Creations-Studio-61574989546371"
                className="text-black hover:text-blue-700 transition-colors"
              >
                <FaFacebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/coastalcreationsocnj/?igsh=MTZrMG5odHJ4bXZrZA%3D%3D"
                className="text-black hover:text-pink-600 transition-colors"
              >
                <FaInstagram size={20} />
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
