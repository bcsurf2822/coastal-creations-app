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
import VariantG from "./variants/VariantG";
import VariantH from "./variants/VariantH";
import VariantI from "./variants/VariantI";
import VariantJ from "./variants/VariantJ";
import VariantK from "./variants/VariantK";
import VariantL from "./variants/VariantL";

type Variant =
  | "a"
  | "b"
  | "c"
  | "d"
  | "e"
  | "f"
  | "g"
  | "h"
  | "i"
  | "j"
  | "k"
  | "l";

const VARIANTS: { id: Variant; label: string }[] = [
  { id: "a", label: "A" },
  { id: "b", label: "B" },
  { id: "c", label: "C" },
  { id: "d", label: "D" },
  { id: "e", label: "E" },
  { id: "f", label: "F" },
  { id: "g", label: "G" },
  { id: "h", label: "H" },
  { id: "i", label: "I" },
  { id: "j", label: "J" },
  { id: "k", label: "K" },
  { id: "l", label: "L" },
];

export default function Store(): ReactElement {
  const [variant, setVariant] = useState<Variant>("a");

  return (
    <div>
      {/* Design selector bar. The NavBar is fixed and hides on scroll-down, so
          this sticks to top-0 (where the nav has vacated) but sits BELOW the nav
          in z-order (z-40 < the nav's z-50) so the nav always wins on overlap. */}
      <div
        className="sticky top-0 z-40 border-b border-gray-200 py-3 px-4"
        style={{
          background: "rgba(255,255,255,0.97)",
          backdropFilter: "blur(8px)",
        }}
      >
        <div className="mx-auto max-w-7xl flex items-center flex-wrap gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-gray-400 mr-2">
            Design Preview:
          </span>
          {VARIANTS.map((v) => (
            <button
              key={v.id}
              onClick={() => setVariant(v.id)}
              className="flex items-center justify-center w-9 h-9 rounded-full text-sm font-semibold transition-all border"
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
            </button>
          ))}
        </div>
      </div>

      {variant === "a" && <VariantA />}
      {variant === "b" && <VariantB />}
      {variant === "c" && <VariantC />}
      {variant === "d" && <VariantD />}
      {variant === "e" && <VariantE />}
      {variant === "f" && <VariantF />}
      {variant === "g" && <VariantG />}
      {variant === "h" && <VariantH />}
      {variant === "i" && <VariantI />}
      {variant === "j" && <VariantJ />}
      {variant === "k" && <VariantK />}
      {variant === "l" && <VariantL />}
    </div>
  );
}
