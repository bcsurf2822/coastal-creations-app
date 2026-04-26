"use client";

import PageHeader from "@/components/classes/PageHeader";
import WalkIn from "@/components/walk-in/WalkIn";
import { GiPaintBrush, GiPalette } from "react-icons/gi";

export default function WalkInPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Walk In and Create!"
        subtitle="No reservation needed. Drop by the studio, choose a project, and let your creativity flow. Pick from mosaics, canvas mixed media, or take-home art kits."
        leftIcon={<GiPalette />}
        rightIcon={<GiPaintBrush />}
      />
      <WalkIn />
    </div>
  );
}
