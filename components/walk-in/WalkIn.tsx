"use client";

import type { ReactElement } from "react";
import WalkInCard from "./WalkInCard";
import WalkInImageSlot from "./WalkInImageSlot";

export default function WalkIn(): ReactElement {
  return (
    <section className="relative overflow-hidden py-12 md:py-20">
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
      </div>
    </section>
  );
}
