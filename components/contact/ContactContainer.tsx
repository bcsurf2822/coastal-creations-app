"use client";

import PageHeader from "@/components/classes/PageHeader";
import ContactForm from "./ContactForm";
import { FaEnvelope } from "react-icons/fa";
import { GiPaintBrush } from "react-icons/gi";

export default function ContactContainer() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Contact Us"
        subtitle="Have questions about our classes, workshops, or studio? We'd love to hear from you. Send us a message and we'll get back to you as soon as possible."
        leftIcon={<FaEnvelope />}
        rightIcon={<GiPaintBrush />}
      />

      <section className="py-12 md:py-16">
        <div className="container mx-auto px-6 md:px-12">
          <div className="max-w-2xl mx-auto">
            {/* Contact Info Bar */}
            <div className="mb-10 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-10 text-sm text-[var(--color-text-muted)]">
              <div className="flex items-center gap-2">
                <svg className="h-4 w-4 text-[var(--color-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>411 E 8th Street, Ocean City, NJ 08226</span>
              </div>
              <a
                href={`mailto:${process.env.NEXT_PUBLIC_STUDIO_EMAIL || "info@coastalcreationsstudio.com"}`}
                className="flex items-center gap-2 text-[var(--color-secondary)] hover:underline"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span>{process.env.NEXT_PUBLIC_STUDIO_EMAIL || "info@coastalcreationsstudio.com"}</span>
              </a>
            </div>

            {/* Form Card */}
            <div className="rounded-2xl border border-gray-200 bg-white p-8 md:p-10 shadow-sm">
              <h2
                className="mb-8 text-center text-2xl font-bold text-[var(--color-primary)]"
                style={{ fontFamily: "var(--font-eb-garamond), serif" }}
              >
                Send us a Message
              </h2>
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
