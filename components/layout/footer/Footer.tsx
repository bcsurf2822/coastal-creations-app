"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useState, FormEvent, useEffect } from "react";

// Define type for hours data to match new schema
type DayHours = {
  isClosed?: boolean;
  hours?: {
    open?: string;
    close?: string;
  };
};

type HoursData = {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [hoursData, setHoursData] = useState<HoursData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const response = await fetch("/api/hours");
        const data = await response.json();
        setHoursData(data);
      } catch (error) {
        console.error("Error fetching hours:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, []);

  const formatDayHours = (day: DayHours | undefined) => {
    if (!day || day.isClosed) {
      return "Closed";
    }
    if (day.hours?.open && day.hours.close) {
      return `${day.hours.open} - ${day.hours.close}`;
    }
    return "Not specified";
  };

  const handleSubscribe = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage("Thank you for subscribing!");
        setEmail("");
      } else {
        setMessage(data.error || "Something went wrong. Please try again.");
      }
    } catch (error: unknown) {
      console.error("Newsletter subscription error:", error);
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            {loading ? (
              <p>Loading hours...</p>
            ) : (
              <ul className="space-y-1 text-black text-sm">
                <li className="flex justify-between">
                  <span className="font-semibold">Monday:</span>
                  <span>
                    {hoursData
                      ? formatDayHours(hoursData.monday)
                      : "Not available"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold">Tuesday:</span>
                  <span>
                    {hoursData
                      ? formatDayHours(hoursData.tuesday)
                      : "Not available"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold">Wednesday:</span>
                  <span>
                    {hoursData
                      ? formatDayHours(hoursData.wednesday)
                      : "Not available"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold">Thursday:</span>
                  <span>
                    {hoursData
                      ? formatDayHours(hoursData.thursday)
                      : "Not available"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold">Friday:</span>
                  <span>
                    {hoursData
                      ? formatDayHours(hoursData.friday)
                      : "Not available"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold">Saturday:</span>
                  <span>
                    {hoursData
                      ? formatDayHours(hoursData.saturday)
                      : "Not available"}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span className="font-semibold">Sunday:</span>
                  <span>
                    {hoursData
                      ? formatDayHours(hoursData.sunday)
                      : "Not available"}
                  </span>
                </li>
              </ul>
            )}
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
                <span className="font-bold">Email:</span>{" "}
                <Link
                  href="mailto:info@coastalcreationsstudio.com"
                  className="hover:underline"
                >
                  info@coastalcreationsstudio.com
                </Link>
              </p>
            </div>
            <div className="mt-4 flex space-x-4">
              <Link
                href="https://www.facebook.com/p/Coastal-Creations-Studio-61574989546371"
                className="text-black hover:text-blue-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook size={20} />
              </Link>
              <Link
                href="https://www.instagram.com/coastalcreationsocnj/?igsh=MTZrMG5odHJ4bXZrZA%3D%3D"
                className="text-black hover:text-pink-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram size={20} />
              </Link>
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Sign Up for our Newsletter
            </h3>

            <form className="flex flex-col gap-2" onSubmit={handleSubscribe}>
              <input
                type="email"
                placeholder="Enter your email"
                className="px-3 py-1.5 rounded text-gray-900 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-sm transition-colors disabled:opacity-70 cursor-pointer"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
              {message && (
                <p
                  className={`text-sm ${message.includes("error") || message.includes("wrong") ? "text-red-600" : "text-green-600"}`}
                >
                  {message}
                </p>
              )}
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
