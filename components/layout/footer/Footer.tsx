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
    <footer className="bg-gradient-to-r from-white to-orange-300 text-black py-8 border-t-4 border-neutral-200">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Logo Container */}
          <div className="md:w-1/4 flex flex-col items-center justify-center">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <Image
                src="/assets/logos/coastalLogoShell.png"
                alt="Coastal Creations Logo"
                fill
                className="object-contain"
                priority
              />
            </div>

            {/* Social icons moved under logo */}
            <div className="mt-4 flex space-x-6 justify-center">
              <Link
                href="https://www.facebook.com/p/Coastal-Creations-Studio-61574989546371"
                className="text-black hover:text-blue-700 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook size={32} />
              </Link>
              <Link
                href="https://www.instagram.com/coastalcreationsocnj/?igsh=MTZrMG5odHJ4bXZrZA%3D%3D"
                className="text-black hover:text-pink-600 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram size={32} />
              </Link>
            </div>
          </div>

          {/* Information Sections Container */}
          <div className="md:w-3/4 flex flex-col gap-6">
            {/* Top Row: Hours and Contact */}
            <div className="flex flex-col md:flex-row justify-between gap-8 h-full">
              {/* Hours */}
              <div className="bg-white rounded-lg p-6 shadow-md md:w-[48%] border border-orange-200 flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-orange-200">
                  Hours
                </h3>
                {loading ? (
                  <p>Loading hours...</p>
                ) : (
                  <ul className="space-y-4 text-black text-sm flex-grow flex flex-col justify-between py-2">
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
              <div className="bg-white rounded-lg p-6 shadow-md md:w-[48%] border border-orange-200 flex flex-col h-full">
                <h3 className="text-lg font-semibold mb-4 pb-2 border-b border-orange-200">
                  Contact Us
                </h3>
                <div className="space-y-3 text-black">
                  <p className="flex items-center">
                    <span>411 E 8th Street</span>
                  </p>
                  <p>Ocean City, NJ 08226</p>

                  <div>
                    <p className="font-bold">Email:</p>
                    <Link
                      href="mailto:info@coastalcreationsstudio.com"
                      className="hover:underline text-sm break-words"
                    >
                      info@coastalcreationsstudio.com
                    </Link>
                  </div>
                </div>

                {/* Newsletter - Moved to Contact container */}
                <div className="mt-6 pt-4 border-t border-orange-200">
                  <h3 className="text-lg font-semibold mb-2 text-center">
                    Sign Up for our Newsletter
                  </h3>

                  <form
                    className="flex flex-col gap-3"
                    onSubmit={handleSubscribe}
                  >
                    <div className="flex-grow">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className="w-full px-3 py-2 rounded text-gray-900 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 border border-gray-200"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm transition-colors disabled:opacity-70 cursor-pointer"
                    >
                      {isSubmitting ? "Subscribing..." : "Subscribe"}
                    </button>
                  </form>
                  {message && (
                    <p
                      className={`text-sm mt-2 text-center ${message.includes("error") || message.includes("wrong") ? "text-red-600" : "text-green-600"}`}
                    >
                      {message}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-orange-200 text-center text-black text-sm">
          <p>
            &copy; {new Date().getFullYear()} Coastal Creation Studios. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
