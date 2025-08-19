import type { Metadata } from "next";
import ContactContainer from "@/components/contact/ContactContainer";

export const metadata: Metadata = {
  title: "Contact Us | Coastal Creations Studio",
  description: "Get in touch with Coastal Creations Studio. Questions about our art classes, workshops, or studio space? Send us a message and we'll get back to you soon.",
  keywords: "contact, art studio, Ocean City NJ, questions, classes, workshops",
};

export default function ContactUsPage() {
  return (
    <main>
      <ContactContainer />
    </main>
  );
}