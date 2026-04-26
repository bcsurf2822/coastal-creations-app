"use client";

import type { ReactElement } from "react";
import Image from "next/image";

export interface WalkInImageSlotProps {
  src?: string;
  alt: string;
  label: string;
  aspectClass?: string;
  objectPosition?: string;
  objectFit?: "contain" | "cover";
  rounded?: boolean;
  bleedClass?: string;
  imageClass?: string;
}

export default function WalkInImageSlot({
  src,
  alt,
  label,
  aspectClass = "aspect-[4/3]",
  objectPosition,
  objectFit = "contain",
  rounded = false,
  bleedClass = "",
  imageClass = "",
}: WalkInImageSlotProps): ReactElement {
  if (src) {
    const isCover = objectFit === "cover";
    return (
      <div
        className={`relative w-full ${aspectClass} ${bleedClass} ${
          isCover ? "overflow-hidden" : "overflow-visible"
        } ${rounded ? "rounded-2xl" : ""}`}
      >
        <Image
          src={src}
          alt={alt}
          fill
          className={imageClass}
          style={{
            objectFit,
            ...(objectPosition ? { objectPosition } : {}),
          }}
          sizes="(min-width: 768px) 50vw, 90vw"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex w-full ${aspectClass} items-center justify-center rounded-2xl border-2 border-dashed border-[var(--color-secondary)]/40 bg-[var(--color-light)]/60 px-6 text-center`}
    >
      <p
        className="text-xs font-semibold uppercase tracking-wider text-[var(--color-secondary)]/80 md:text-sm"
        style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
      >
        {label}
      </p>
    </div>
  );
}
