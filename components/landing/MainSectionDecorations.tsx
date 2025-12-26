"use client";

import Image from "next/image";

/**
 * MainSectionDecorations
 *
 * SVG decorations for the MainSection component.
 * All positions are relative to the CENTER of the viewport using calc(50% + Xpx).
 * This ensures decorations stay fixed relative to the centered content container,
 * just like the main content does with max-w-6xl mx-auto.
 *
 * Desktop/Tablet (768px+): Fixed positions relative to center - no movement
 * Mobile (<768px): Hidden
 */
export default function MainSectionDecorations() {
  return (
    // Hide on mobile, show on tablet and up
    <div className="hidden md:block">
      {/* Starfish on top-left of storefront image */}
      <div
        className="absolute z-20 pointer-events-none"
        style={{
          top: '32px',
          left: 'calc(50% - 693px)', // Positioned left of center
        }}
      >
        <Image
          src="/assets/svg/starfish.svg"
          alt="Starfish"
          width={240}
          height={240}
          className="-rotate-12 opacity-95"
        />
      </div>

      {/* Decorative SVG Clusters */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">

        {/* Star near title - top right */}
        <div
          className="absolute"
          style={{
            top: '40px',
            left: 'calc(50% + 450px)',
          }}
        >
          <Image
            src="/assets/svg/star.svg"
            alt="Star"
            width={193}
            height={193}
            className="-rotate-[30deg] opacity-90"
          />
        </div>

        {/* Paintings cluster - jellyfish, seahorse, flowers - right side */}
        <div
          className="absolute"
          style={{
            top: '50%',
            left: 'calc(50% + 455px)',
            transform: 'translateY(-50%)',
            width: '608px',
            height: '544px',
          }}
        >
          <Image
            src="/assets/svg/jellyfish-art.svg"
            alt="Jellyfish art"
            width={448}
            height={485}
            className="absolute top-0 left-0 rotate-[-5deg]"
          />
          <Image
            src="/assets/svg/seahorse-art.svg"
            alt="Seahorse art"
            width={383}
            height={418}
            className="absolute rotate-[8deg]"
            style={{
              top: '16px',
              left: '144px',
            }}
          />
          <Image
            src="/assets/svg/flowers-paint.svg"
            alt="Flowers"
            width={383}
            height={334}
            className="absolute -rotate-2"
            style={{
              top: '193px',
              left: '65px',
            }}
          />
        </div>

        {/* Shells cluster - bottom center-right */}
        <div
          className="absolute"
          style={{
            bottom: '20px',
            left: 'calc(50% + 250px)',
          }}
        >
          <Image
            src="/assets/svg/shell3-art.svg"
            alt="Shell art"
            width={223}
            height={223}
            className="-rotate-6 opacity-95"
          />
          <Image
            src="/assets/svg/shell2.svg"
            alt="Shell"
            width={144}
            height={144}
            className="absolute rotate-12 opacity-85"
            style={{
              top: '49px',
              left: '162px',
            }}
          />
        </div>

        {/* Mosaic - bottom left */}
        <div
          className="absolute"
          style={{
            bottom: '-50px',
            left: 'calc(50% - 550px)',
          }}
        >
          <Image
            src="/assets/svg/mosaic-art.svg"
            alt="Mosaic art"
            width={193}
            height={193}
            className="opacity-90"
          />
        </div>

        {/* Rock and Eagles - bottom center */}
        <div
          className="absolute"
          style={{
            bottom: '-20px',
            left: 'calc(50% + 95px)',
          }}
        >
          <Image
            src="/assets/svg/rock-art.svg"
            alt="Rock art"
            width={128}
            height={128}
            className="-rotate-6 opacity-90"
          />
          <Image
            src="/assets/svg/egales-art.svg"
            alt="Eagles art"
            width={128}
            height={128}
            className="absolute rotate-12 opacity-90"
            style={{
              top: '-4px',
              left: '79px',
            }}
          />
        </div>
      </div>
    </div>
  );
}
