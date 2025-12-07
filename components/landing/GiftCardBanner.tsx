"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";

export default function GiftCardBanner() {
  return (
    <section className="py-16 md:py-20 relative overflow-hidden my-12 md:my-16 rounded-3xl mx-4 md:mx-8">
      <div className="container mx-auto px-6 md:px-12 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 max-w-6xl mx-auto">
          {/* Text Content */}
          <div className="flex-1 text-center md:text-left">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/80 backdrop-blur-sm text-primary text-sm font-bold mb-4 shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                New Arrival
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 font-serif mb-3">
                Gift Cards
              </h2>
              <p className="text-gray-600 text-lg max-w-xl">
                Our digital gift cards are redeemable for classes, camps,
                workshops, and private events.
              </p>
            </motion.div>
          </div>

          {/* CTA & Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex-shrink-0"
          >
            <div className="bg-white p-2 rounded-2xl shadow-xl transform rotate-1 hover:rotate-0 transition-transform duration-300">
              <div className="bg-gradient-to-br from-white via-gray-50 to-white p-8 rounded-xl w-80 relative overflow-hidden group border border-gray-200">
                <div className="relative z-10">
                  {/* Logo prominently displayed */}
                  <div className="flex justify-center mb-6">
                    <Image
                      src="/assets/logos/coastalLogoFull.png"
                      alt="Coastal Creations Studio"
                      width={160}
                      height={64}
                      className="object-contain"
                    />
                  </div>

                  <div className="text-center mb-6">
                    <h3 className="text-xl font-serif font-bold text-gray-800">
                      Coastal Creations Studio
                    </h3>
                    <p className="text-primary font-semibold text-sm mt-1">Gift Card</p>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                    <p className="font-mono text-gray-400 text-sm tracking-wider">
                      **** **** ****
                    </p>
                    <Link
                      href="/gift-cards"
                      className="bg-primary text-white px-5 py-2 rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors shadow-md"
                    >
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
