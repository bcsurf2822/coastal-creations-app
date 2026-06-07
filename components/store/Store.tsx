"use client";

// TEMPORARY: Design review mode for client approval.
// Remove this selector and keep only the chosen variant once Ashley approves.

import type { ReactElement } from "react";
import { useState } from "react";
import VariantA from "./variants/VariantA";
import VariantB from "./variants/VariantB";
import VariantC from "./variants/VariantC";
import VariantD from "./variants/VariantD";
import VariantE from "./variants/VariantE";
import VariantF from "./variants/VariantF";

type Variant = "a" | "b" | "c" | "d" | "e" | "f";

const VARIANTS: { id: Variant; label: string; description: string }[] = [
  { id: "a", label: "Classic", description: "Clean & simple" },
  { id: "b", label: "Coastal", description: "Brand-aligned" },
  { id: "c", label: "Studio", description: "Bold & artsy" },
  { id: "d", label: "Warm", description: "Craft-market feel" },
  { id: "e", label: "List", description: "Boutique row view" },
  { id: "f", label: "Spotlight", description: "Featured hero" },
];

export default function Store(): ReactElement {
  const [variant, setVariant] = useState<Variant>("a");

  return (
    <div>
      {/* Design selector bar */}
      <div
        className="sticky top-0 z-50 border-b border-gray-200 py-3 px-4"
        style={{ background: "rgba(255,255,255,0.97)", backdropFilter: "blur(8px)" }}
      >
        <div className="mx-auto max-w-7xl flex items-center flex-wrap gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-2">
            Design Preview:
          </span>
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium transition-all border"
              style={
                variant === v.id
                  ? {
                      background: "#0c4a6e",
                      color: "white",
                      borderColor: "#0c4a6e",
                    }
                  : {
                      background: "white",
                      color: "#374151",
                      borderColor: "#d1d5db",
                    }
              }
            >
              {v.label}
              <span className="text-xs opacity-60">— {v.description}</span>
            </button>
          ))}
          <span className="ml-auto text-xs italic text-gray-400 hidden sm:block">
            Client review mode
          </span>
        </div>
      </div>

      {variant === "a" && <VariantA />}
      {variant === "b" && <VariantB />}
      {variant === "c" && <VariantC />}
      {variant === "d" && <VariantD />}
      {variant === "e" && <VariantE />}
      {variant === "f" && <VariantF />}
    </div>
  );
}
