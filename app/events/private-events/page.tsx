"use client";

import PageHeader from "@/components/classes/PageHeader";
import PrivateEvents from "@/components/classes/privateEvents/PrivateEvents";
import PhotoCorral from "@/components/gallery/PhotoCorral";
import { FaBirthdayCake } from "react-icons/fa";
import { GiBalloons } from "react-icons/gi";

export default function PrivateEventsPage() {
  return (
    <div className="min-h-screen">
      <PageHeader
        title="Private Events"
        subtitle="Celebrate your special occasion with a private creative experience at our studio. Birthday parties, team building, bridal showers, and more."
        leftIcon={<FaBirthdayCake />}
        rightIcon={<GiBalloons />}
      />
      <PhotoCorral destination="private-event" />
      <PrivateEvents />
    </div>
  );
}
