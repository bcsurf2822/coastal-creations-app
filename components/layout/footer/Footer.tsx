"use client";

import { FaFacebook, FaInstagram } from "react-icons/fa";
import Image from "next/image";
import Link from "next/link";
import { useState, FormEvent, useEffect } from "react";
import { motion } from "motion/react";

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

const DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/events/classes-workshops", label: "Classes" },
  { href: "/calendar", label: "Calendar" },
  { href: "/gallery", label: "Gallery" },
  { href: "/blog", label: "Blog" },
  { href: "/about", label: "About" },
  { href: "/contact-us", label: "Contact" },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [hoursData, setHoursData] = useState<HoursData | null>(null);
  const [loading, setLoading] = useState(true);

  const logoVariants = {
    initial: { scale: 0.9 },
    animate: {
      scale: 1,
      transition: {
        type: "spring" as const,
        stiffness: 300,
        damping: 20,
        duration: 0.5,
      },
    },
    hover: {
      scale: 1.05,
      rotate: 2,
      transition: { duration: 0.3 },
    },
  };

  useEffect(() => {
    const fetchHours = async () => {
      try {
        const response = await fetch("/api/hours");
        const result = await response.json();
        setHoursData(result.data || result);
      } catch (error) {
        console.error("[Footer-fetchHours] Error fetching hours:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHours();
  }, []);

  const formatDayHours = (day: DayHours | undefined): string => {
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
      console.error(
        "[Footer-handleSubscribe] Newsletter subscription error:",
        error
      );
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="mt-auto border-t border-gray-100 bg-white/90 text-[var(--color-text-primary)]">
      {/* Main footer content */}
      <div className="container mx-auto px-6 py-12 lg:px-12">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1: Logo + Social */}
          <div className="flex flex-col items-center sm:items-start">
            <motion.div
              className="relative h-36 w-36 xl:h-40 xl:w-40"
              variants={logoVariants}
              initial="initial"
              animate="animate"
              whileHover="hover"
            >
              <Link href="/" className="relative block h-full w-full cursor-pointer">
                <Image
                  src="/assets/logos/coastalLogoFull.png"
                  alt="Coastal Creations Logo"
                  fill
                  sizes="(min-width: 1280px) 160px, 144px"
                  className="object-contain"
                  loading="lazy"
                />
              </Link>
            </motion.div>

            <p className="mt-3 text-sm text-[var(--color-text-subtle)] text-center sm:text-left">
              Ocean City&apos;s creative art studio for all ages.
            </p>

            <div className="mt-4 flex space-x-4">
              <Link
                href="https://www.facebook.com/p/Coastal-Creations-Studio-61574989546371"
                className="text-[var(--color-text-subtle)] hover:text-[var(--color-secondary)] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebook size={22} />
              </Link>
              <Link
                href="https://www.instagram.com/coastalcreationsocnj/?igsh=MTZrMG5odHJ4bXZrZA%3D%3D"
                className="text-[var(--color-text-subtle)] hover:text-[var(--color-secondary)] transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram size={22} />
              </Link>
            </div>
          </div>

          {/* Column 2: Studio Hours */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              Studio Hours
            </h3>
            <div className="mb-4 h-px w-10 bg-[var(--color-accent)]" />
            {loading ? (
              <p className="text-sm text-[var(--color-text-subtle)]">
                Loading hours...
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {DAYS.map((day) => (
                  <li key={day} className="flex justify-between gap-4">
                    <span className="font-medium capitalize text-[var(--color-text-muted)]">
                      {day}
                    </span>
                    <span className="text-[var(--color-text-subtle)]">
                      {hoursData
                        ? formatDayHours(hoursData[day])
                        : "Not available"}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Column 3: Contact */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              Contact Us
            </h3>
            <div className="mb-4 h-px w-10 bg-[var(--color-accent)]" />
            <div className="space-y-4 text-sm">
              <div className="text-[var(--color-text-subtle)] leading-relaxed">
                <p>411 E 8th Street</p>
                <p>Ocean City, NJ 08226</p>
              </div>
              <div>
                <Link
                  href={`mailto:${process.env.NEXT_PUBLIC_STUDIO_EMAIL || "info@coastalcreationsstudio.com"}`}
                  className="text-[var(--color-secondary)] hover:underline transition-colors break-words"
                >
                  {process.env.NEXT_PUBLIC_STUDIO_EMAIL ||
                    "info@coastalcreationsstudio.com"}
                </Link>
              </div>
            </div>
          </div>

          {/* Column 4: Newsletter */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              Newsletter
            </h3>
            <div className="mb-4 h-px w-10 bg-[var(--color-accent)]" />
            <p className="mb-4 text-sm leading-relaxed text-[var(--color-text-subtle)]">
              Sign up for updates on classes, events, and workshops.
            </p>
            <form className="flex flex-col gap-3" onSubmit={handleSubscribe} suppressHydrationWarning>
              <input
                type="email"
                placeholder="Enter your email"
                className="h-10 rounded-lg border border-gray-300 bg-white px-3 text-sm text-[var(--color-text-primary)] placeholder-gray-400 outline-none transition-colors focus:border-[var(--color-secondary)] focus:ring-1 focus:ring-[var(--color-secondary)]"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                suppressHydrationWarning
              />
              <button
                type="submit"
                {...(isSubmitting ? { disabled: true } : {})}
                className="h-10 rounded-lg bg-[var(--color-accent)] px-4 text-sm font-semibold text-white transition-colors hover:brightness-110 disabled:opacity-50"
              >
                {isSubmitting ? "Subscribing..." : "Subscribe"}
              </button>
            </form>
            {message && (
              <p
                className={`mt-2 text-sm ${
                  message.includes("error") || message.includes("wrong")
                    ? "text-[var(--color-error)]"
                    : "text-[var(--color-success-text)]"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-gray-100 bg-white/90">
        <div className="container mx-auto px-6 py-5 lg:px-12">
          <nav className="mb-3 flex flex-wrap justify-center gap-x-6 gap-y-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-secondary)]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <nav className="mb-2 flex flex-wrap justify-center gap-x-6 gap-y-2">
            <Link
              href="/privacy"
              className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-secondary)]"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-xs font-medium uppercase tracking-wide text-[var(--color-text-subtle)] transition-colors hover:text-[var(--color-secondary)]"
            >
              Terms of Service
            </Link>
          </nav>
          <p className="text-center text-xs text-[var(--color-text-subtle)]" suppressHydrationWarning>
            &copy; {new Date().getFullYear()} Coastal Creations Studio. All
            rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
