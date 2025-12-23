"use client";

import { ReactElement, ReactNode } from "react";
import Image from "next/image";

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  variant?: "adult" | "kid" | "events" | "camps" | "all";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variantConfig = {
  adult: {
    svgLeft: "/assets/svg/flowers-paint.svg",
    svgRight: "/assets/svg/shell-paint.svg",
  },
  kid: {
    svgLeft: "/assets/svg/starfish.svg",
    svgRight: "/assets/svg/turtle.svg",
  },
  events: {
    svgLeft: "/assets/svg/mosaic-art.svg",
    svgRight: "/assets/svg/seahorse-art.svg",
  },
  camps: {
    svgLeft: "/assets/svg/jellyfish-art.svg",
    svgRight: "/assets/svg/octopus.svg",
  },
  all: {
    svgLeft: "/assets/svg/rock-art.svg",
    svgRight: "/assets/svg/shell3-art.svg",
  },
};

export default function PageHeader({
  title,
  subtitle,
  variant = "all",
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  leftIcon,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  rightIcon,
}: PageHeaderProps): ReactElement {
  const config = variantConfig[variant];

  return (
    <div className="py-12 md:py-16">
      <div className="container mx-auto px-4">
        {/* Centered card with content */}
        <div className="relative max-w-3xl mx-auto">
          {/* Background card */}
          <div className="relative bg-gradient-to-br from-[#e3f0f7] via-[#d8e8f0] to-[#cfe3ed] rounded-2xl md:rounded-3xl px-8 py-8 md:px-12 md:py-10 shadow-sm overflow-hidden">
            {/* Subtle texture overlay */}
            <div className="absolute inset-0 opacity-[0.02] bg-[url('/assets/backgrounds/spatterBg.png')] bg-cover bg-center rounded-2xl md:rounded-3xl" />

            {/* Left SVG decoration - positioned inside card */}
            <div className="absolute left-0 top-0 -translate-x-2 -translate-y-2 transform -rotate-45">
              <Image
                src={config.svgLeft}
                alt=""
                width={160}
                height={160}
                className="w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40"
              />
            </div>

            {/* Right SVG decoration - positioned inside card */}
            <div className="absolute right-0 top-0 translate-x-2 -translate-y-2 transform rotate-45">
              <Image
                src={config.svgRight}
                alt=""
                width={160}
                height={160}
                className="w-20 h-20 md:w-32 md:h-32 lg:w-40 lg:h-40"
              />
            </div>

            {/* Content */}
            <div className="relative z-10 text-center px-8 md:px-12 pt-12 md:pt-20 pb-2">
              {/* Title with icons */}
              <div className="flex items-center justify-center gap-2 md:gap-3 mb-4">
                <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-[var(--color-primary)] font-serif">
                  {title}
                </h1>
              </div>

              {/* Subtitle */}
              <p className="text-sm md:text-base text-[var(--color-text-secondary)] leading-relaxed max-w-2xl mx-auto">
                {subtitle}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
