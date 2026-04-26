"use client";

import type { ReactElement } from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { FaEnvelope } from "react-icons/fa";
import { Button } from "@/components/ui";
import WalkInCard from "./WalkInCard";
import WalkInImageSlot from "./WalkInImageSlot";

export default function WalkIn(): ReactElement {
  const studioEmail =
    process.env.NEXT_PUBLIC_STUDIO_EMAIL ||
    "info@coastalcreationsstudio.com";

  return (
    <section
      className="relative overflow-hidden py-12 md:py-20"
      style={{
        background:
          "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 55%, #f0f9ff 100%)",
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        style={{
          background:
            "radial-gradient(circle at 10% 0%, rgba(125,211,252,0.25), transparent 45%), radial-gradient(circle at 90% 100%, rgba(251,146,60,0.18), transparent 45%)",
        }}
      />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-5xl space-y-8 md:space-y-12">
          <WalkInCard
            index={0}
            largeImage
            title="Mosaics"
            description={
              <p>
                Choose a board shape to design! Come back to grout your piece
                or we can do it for you!
              </p>
            }
            imageSlot={
              <WalkInImageSlot
                src="/assets/images/walk-in/mosaics.png"
                alt="Examples of finished mosaic projects"
                label="Mosaic Samples Image"
                aspectClass="aspect-[5/4] md:aspect-[5/4]"
                imageClass="object-center md:object-right-bottom"
                bleedClass="origin-center scale-[1.25] md:origin-bottom-right md:scale-[1.6]"
              />
            }
          />

          <WalkInCard
            index={1}
            largeImage
            title="Canvas Mixed Media"
            description={
              <>
                <p className="mb-3">
                  We have supplies to create a Vision Board, Collage, Stencils
                  and Samples for Canvas Painting. Choose the size you would
                  like to create on!
                </p>
                <p className="font-semibold text-[var(--color-secondary)]">
                  You can also bring your own project for a fee.
                </p>
              </>
            }
            imageSlot={
              <WalkInImageSlot
                src="/assets/images/walk-in/canvas-mixed-media.png"
                alt="Canvas mixed media studio space"
                label="Studio / Canvas Image"
                aspectClass="aspect-[4/3] md:aspect-[5/4]"
                objectFit="cover"
                objectPosition="center"
                rounded
              />
            }
          />

          <WalkInCard
            index={2}
            largeImage
            title="Art Kits"
            description={
              <>
                <p className="mb-3">
                  Take-home art kits with everything you need to create. Pick
                  your favorite project and bring the studio experience home
                  with you.
                </p>
                <p className="font-semibold text-[var(--color-secondary)]">
                  Great for gifts, travel, or rainy-day creativity.
                </p>
              </>
            }
            imageSlot={
              <WalkInImageSlot
                src="/assets/images/walk-in/art-kits.png"
                alt="A selection of take-home art kits"
                label="Art Kits Image"
                aspectClass="aspect-[4/3] md:aspect-[5/4]"
                objectFit="contain"
                objectPosition="right center"
                bleedClass="md:origin-right md:scale-[1.45] md:-mr-12 lg:-mr-20 xl:-mr-28"
              />
            }
          />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="mx-auto mt-12 max-w-3xl rounded-3xl bg-white/80 p-8 text-center shadow-[0_10px_30px_rgba(12,74,110,0.1)] ring-1 ring-[var(--color-border-lighter)] backdrop-blur md:mt-16 md:p-10"
        >
          <div className="mb-3 flex items-center justify-center text-[var(--color-secondary)]">
            <FaEnvelope className="text-2xl md:text-3xl" />
          </div>
          <h3
            className="mb-3 text-xl font-bold text-[var(--color-primary)] md:text-2xl"
            style={{ fontFamily: "var(--font-eb-garamond), serif" }}
          >
            Ready to drop in?
          </h3>
          <p
            className="mx-auto mb-6 max-w-xl text-sm text-[var(--color-text-muted)] md:text-base"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            Walk-ins are welcome during studio hours. Have a question first?
            Reach out and we will be happy to help plan your visit.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link href="/contact-us">
              <Button variant="pill" size="md">
                Contact the Studio
              </Button>
            </Link>
            <a href={`mailto:${studioEmail}`}>
              <Button variant="ghost" size="md">
                {studioEmail}
              </Button>
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
