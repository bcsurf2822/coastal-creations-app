"use client";

import { ReactElement, ReactNode } from "react";

export interface PageHeaderProps {
  title: string;
  subtitle: string;
  variant?: "adult" | "kid" | "events" | "camps" | "all";
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  leftIcon,
  rightIcon,
}: PageHeaderProps): ReactElement {
  return (
    <section className="bg-white pb-6 pt-10 md:pb-8 md:pt-14">
      <div className="container mx-auto px-4">
        <div className="mx-auto max-w-3xl text-center">
          <div className="mb-4 flex items-center justify-center gap-2 sm:gap-3">
            {leftIcon ? (
              <span className="text-lg text-[var(--color-secondary)] opacity-75 sm:text-xl">
                {leftIcon}
              </span>
            ) : null}
            <h1
              className="text-3xl font-bold leading-tight text-[var(--color-primary)] md:text-4xl lg:text-5xl"
              style={{ fontFamily: "var(--font-eb-garamond), serif" }}
            >
              {title}
            </h1>
            {rightIcon ? (
              <span className="text-lg text-[var(--color-secondary)] opacity-75 sm:text-xl">
                {rightIcon}
              </span>
            ) : null}
          </div>

          <div className="mx-auto mb-5 h-1 w-16 rounded-full bg-[var(--color-accent)]" />

          <p
            className="mx-auto max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)] sm:text-base md:text-lg"
            style={{ fontFamily: "var(--font-montserrat), sans-serif" }}
          >
            {subtitle}
          </p>
        </div>
      </div>
    </section>
  );
}
