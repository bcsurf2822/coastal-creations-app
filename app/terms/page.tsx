import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service",
  description:
    "The Terms of Service governing your use of the Coastal Creations Studio website, class and event bookings, and online store in Ocean City, NJ.",
};

const LAST_UPDATED = "June 19, 2026";
const CONTACT_EMAIL = "info@coastalcreationsstudio.com";

type Section = {
  heading: string;
  body: ReactNode;
};

const ReviewNote = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    className="my-3 rounded-md border-l-4 px-3 py-2 text-sm font-medium"
    style={{ backgroundColor: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" }}
  >
    <span className="font-bold">NEEDS FROM ASHLEY:</span> {children}
  </div>
);

const linkClass =
  "text-[var(--color-secondary)] underline-offset-2 hover:underline";

const listClass =
  "list-disc space-y-2 pl-6 text-[var(--color-text-subtle)] leading-relaxed";

const sections: Section[] = [
  {
    heading: "1. Acceptance of These Terms",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          Welcome to Coastal Creations Studio. These Terms of Service (the
          &ldquo;Terms&rdquo;) govern your access to and use of our website at{" "}
          <a href="https://coastalcreationsstudio.com" className={linkClass}>
            coastalcreationsstudio.com
          </a>{" "}
          (the &ldquo;Site&rdquo;), our class and event registrations, and our
          online store (together, the &ldquo;Services&rdquo;). Coastal Creations
          Studio is an art studio located in Ocean City, New Jersey, owned and
          operated by Ashley Mathers.
        </p>
        <ReviewNote>Confirm the exact legal business name and entity type (for example, &ldquo;Coastal Creations Studio LLC&rdquo; vs. a sole proprietorship) and the U.S. state where it is registered.</ReviewNote>
        <p className="mt-4 leading-relaxed text-[var(--color-text-subtle)]">
          By accessing the Site, creating an account, booking a class or event,
          or placing an order, you agree to be bound by these Terms and by our{" "}
          <Link href="/privacy" className={linkClass}>
            Privacy Policy
          </Link>
          . If you do not agree, please do not use the Services.
        </p>
      </>
    ),
  },
  {
    heading: "2. Eligibility",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          You must be at least 18 years of age to make a purchase, complete a
          booking, create an account, or otherwise transact with us. By using
          the Services, you represent and warrant that you meet this requirement
          and that the information you provide is accurate.
        </p>
        <p className="mt-4 leading-relaxed text-[var(--color-text-subtle)]">
          Many of our offerings, including kids&rsquo; classes and camps, are
          intended for minors. Any registration or booking for a participant
          under 18 must be made by a parent or legal guardian who is at least 18
          years old and who agrees to these Terms on the minor&rsquo;s behalf.
        </p>
        <ReviewNote>Confirm the minimum age a child may attend a class with, versus without, a parent or guardian present, and confirm this matches the in-person liability waiver you use.</ReviewNote>
      </>
    ),
  },
  {
    heading: "3. User Accounts",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          Some features may require an account. We are introducing customer
          accounts that you can access by signing in with Google or through a
          passwordless email sign-in link. When you create or use an account,
          you agree to:
        </p>
        <ul className={`mt-4 ${listClass}`}>
          <li>
            Provide accurate, current, and complete information and keep it up to
            date.
          </li>
          <li>
            Keep your sign-in method and email account secure, and not share
            access with others.
          </li>
          <li>
            Take responsibility for all activity that occurs under your account.
          </li>
          <li>
            Notify us promptly at{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              {CONTACT_EMAIL}
            </a>{" "}
            if you suspect any unauthorized use of your account.
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: "4. Class & Event Bookings and Registration",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          We offer art classes, camps, workshops, private parties, and day
          reservations that can be booked and paid for online. When you register,
          you agree to provide accurate participant information, including the
          names and any necessary details of attendees.
        </p>
        <p className="mt-4 leading-relaxed text-[var(--color-text-subtle)]">
          Schedules, instructors, locations, and offerings are subject to change.
          We will make reasonable efforts to communicate material changes to a
          booking you have made. A confirmed booking reserves a spot for the
          listed participant(s) only and is not transferable except as permitted
          by the studio.
        </p>
      </>
    ),
  },
  {
    heading: "5. Payments & Pricing",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          Payments are processed securely through Square, our third-party payment
          processor. By submitting a payment, you authorize us (through Square) to
          charge the payment method you provide for the total amount shown,
          including any applicable taxes and fees.
        </p>
        <ul className={`mt-4 ${listClass}`}>
          <li>All prices are listed and charged in U.S. Dollars (USD).</li>
          <li>
            Applicable sales tax, where required, is calculated and added at
            checkout.
          </li>
          <li>
            We strive for accuracy, but if a price or product is listed
            incorrectly, we reserve the right to cancel or correct the order and
            refund any amount charged in error.
          </li>
          <li>
            Card data is handled by Square; we do not store full payment card
            numbers on our systems.
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: "6. Cancellations, Refunds & Rescheduling",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          Cancellation and refund terms for classes, camps, workshops, private
          events, and reservations apply as described at the time of booking or
          as communicated by the studio. If a cancellation or refund policy is
          not stated for a particular offering, please contact the studio for
          assistance.
        </p>
        <p className="mt-4 leading-relaxed text-[var(--color-text-subtle)]">
          The studio may cancel or reschedule a class or event for reasons
          including, but not limited to, low enrollment, instructor availability,
          inclement weather, or circumstances beyond our control. If we cancel,
          we will offer you a refund or a credit toward a future offering. We are
          not responsible for incidental costs (such as travel) associated with a
          cancelled or rescheduled session.
        </p>
        <ReviewNote>Provide your actual cancellation and refund rules: How far in advance can a customer cancel a class, camp, or workshop for a refund? Refund or studio credit? Are private-event deposits non-refundable? What is the no-show policy?</ReviewNote>
      </>
    ),
  },
  {
    heading: "7. Online Store Purchases & Shipping",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          Our online store sells physical products, such as Art Kits, that are
          shipped to you. Your submission of an order is an offer to purchase; an
          order is only accepted once we confirm it and process payment. We may
          decline or cancel an order at our discretion, including where items are
          unavailable or where we suspect an error or fraud.
        </p>
        <ul className={`mt-4 ${listClass}`}>
          <li>
            Shipping is fulfilled with the help of Shippo and third-party
            carriers.
          </li>
          <li>
            Delivery time estimates are provided for convenience only and are not
            guaranteed.
          </li>
          <li>
            Risk of loss and title for products pass to you upon our delivery of
            the items to the carrier.
          </li>
          <li>
            You are responsible for providing a complete and accurate shipping
            address.
          </li>
        </ul>
        <ReviewNote>Confirm shipping details: Do you ship within the U.S. only? What is the typical processing/handling time before an order ships? Which carriers do you use?</ReviewNote>
      </>
    ),
  },
  {
    heading: "8. Returns",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          If you are not satisfied with a physical product, please contact us at{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
            {CONTACT_EMAIL}
          </a>{" "}
          to discuss a return or exchange. Returns may be subject to reasonable
          conditions, such as the item being unused and in its original
          condition, and may require return within a reasonable period after
          delivery. Certain items may be non-returnable. We will work with you in
          good faith to resolve any issue with your order.
        </p>
        <ReviewNote>Provide your store return policy: Do you accept returns? Within how many days of delivery? What item condition is required? Who pays return shipping? Refund to original payment or store credit? Any non-returnable items? (Note: under New Jersey law, if no return policy is posted, customers may return within 20 days for a refund or credit.)</ReviewNote>
      </>
    ),
  },
  {
    heading: "9. Intellectual Property",
    body: (
      <p className="leading-relaxed text-[var(--color-text-subtle)]">
        All content on the Site, including text, graphics, logos, images,
        photographs, artwork, designs, and the &ldquo;Coastal Creations
        Studio&rdquo; name and branding, is owned by or licensed to Coastal
        Creations Studio and is protected by intellectual property laws. You may
        not copy, reproduce, distribute, modify, or create derivative works from
        any of this content without our prior written permission. Nothing in
        these Terms grants you any right or license to our intellectual property
        except the limited right to use the Site for its intended purpose.
      </p>
    ),
  },
  {
    heading: "10. User Conduct & Acceptable Use",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          When using the Services, you agree not to:
        </p>
        <ul className={`mt-4 ${listClass}`}>
          <li>Violate any applicable law or regulation.</li>
          <li>
            Provide false, misleading, or fraudulent information, or impersonate
            another person.
          </li>
          <li>
            Interfere with, disrupt, or attempt to gain unauthorized access to
            the Site, our systems, or other users&rsquo; accounts.
          </li>
          <li>
            Use the Services to transmit harmful code, spam, or unsolicited
            communications.
          </li>
          <li>
            Use any automated means to access or scrape the Site without our
            permission.
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: "11. Studio Rules & Safety",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          Our classes and events take place in person and involve art materials,
          tools, and shared studio spaces. For everyone&rsquo;s safety, all
          participants and guardians must follow posted rules and the
          instructions of our staff at all times.
        </p>
        <p className="mt-4 leading-relaxed text-[var(--color-text-subtle)]">
          You understand and acknowledge that participation in art studio
          activities carries inherent risks, including but not limited to
          exposure to paints and other materials, use of tools, slips and falls,
          and other injuries. To the fullest extent permitted by law, you
          voluntarily assume these risks and agree to participate (and to allow
          any minor in your care to participate) at your own risk. You release and
          hold harmless Coastal Creations Studio, its owner, and its staff from
          claims arising out of ordinary participation in studio activities,
          except to the extent caused by our gross negligence or willful
          misconduct. Parents and guardians are responsible for the supervision,
          conduct, and safety of minors in their care while at the studio, except
          where the studio expressly provides supervision as part of an offering.
        </p>
        <ReviewNote>Confirm this assumption-of-risk and release language is acceptable and matches the paper liability waiver you use in person. An attorney should review the release wording.</ReviewNote>
      </>
    ),
  },
  {
    heading: "12. Disclaimers",
    body: (
      <p className="leading-relaxed text-[var(--color-text-subtle)]">
        The Services are provided on an &ldquo;as is&rdquo; and &ldquo;as
        available&rdquo; basis without warranties of any kind, whether express or
        implied. To the fullest extent permitted by law, we disclaim all
        warranties, including implied warranties of merchantability, fitness for a
        particular purpose, title, and non-infringement. We do not warrant that
        the Site will be uninterrupted, secure, or error-free, or that any
        content is accurate or complete.
      </p>
    ),
  },
  {
    heading: "13. Limitation of Liability",
    body: (
      <p className="leading-relaxed text-[var(--color-text-subtle)]">
        To the fullest extent permitted by law, Coastal Creations Studio, its
        owner, and its staff will not be liable for any indirect, incidental,
        special, consequential, or punitive damages, or for any loss of profits,
        data, or goodwill, arising out of or related to your use of the Services.
        Our total liability for any claim arising out of or relating to the
        Services or these Terms will not exceed the amount you paid to us for the
        specific class, event, or product giving rise to the claim. Some
        jurisdictions do not allow certain limitations, so some of the above may
        not apply to you.
      </p>
    ),
  },
  {
    heading: "14. Indemnification",
    body: (
      <p className="leading-relaxed text-[var(--color-text-subtle)]">
        You agree to indemnify, defend, and hold harmless Coastal Creations
        Studio, its owner, and its staff from and against any claims, damages,
        losses, liabilities, and expenses (including reasonable attorneys&rsquo;
        fees) arising out of or related to your use of the Services, your
        violation of these Terms, or your violation of any rights of a third
        party.
      </p>
    ),
  },
  {
    heading: "15. Third-Party Services",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          We rely on trusted third-party providers to deliver the Services. Your
          use of these providers may be subject to their own terms and privacy
          policies, which we encourage you to review:
        </p>
        <ul className={`mt-4 ${listClass}`}>
          <li>
            <strong>Square</strong> &mdash; payment processing.
          </li>
          <li>
            <strong>Shippo</strong> &mdash; shipping rates, labels, and tracking.
          </li>
          <li>
            <strong>Google</strong> &mdash; account sign-in.
          </li>
        </ul>
        <p className="mt-4 leading-relaxed text-[var(--color-text-subtle)]">
          We are not responsible for the acts, omissions, or policies of these
          third parties.
        </p>
      </>
    ),
  },
  {
    heading: "16. Changes to These Terms",
    body: (
      <p className="leading-relaxed text-[var(--color-text-subtle)]">
        We may update these Terms from time to time. When we do, we will revise
        the &ldquo;Last Updated&rdquo; date above. Material changes may be
        communicated through the Site or by email. Your continued use of the
        Services after changes become effective constitutes your acceptance of
        the revised Terms.
      </p>
    ),
  },
  {
    heading: "17. Governing Law",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          These Terms are governed by and construed in accordance with the laws
          of the State of New Jersey, USA, without regard to its
          conflict-of-laws rules. You agree that any dispute arising out of or
          relating to these Terms or the Services will be subject to the
          exclusive jurisdiction of the state and federal courts located in New
          Jersey.
        </p>
        <ReviewNote>Confirm your preferred venue/county for any disputes (for example, Cape May County, New Jersey).</ReviewNote>
      </>
    ),
  },
  {
    heading: "18. Contact Us",
    body: (
      <>
        <p className="leading-relaxed text-[var(--color-text-subtle)]">
          If you have questions about these Terms, please contact us:
        </p>
        <ul className={`mt-4 ${listClass}`}>
          <li>Coastal Creations Studio</li>
          <li>411 E 8th Street, Ocean City, NJ 08226, USA</li>
          <li>
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              {CONTACT_EMAIL}
            </a>
          </li>
        </ul>
      </>
    ),
  },
];

export default function TermsPage(): ReactElement {
  return (
    <div className="min-h-screen">
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <div
            className="mb-8 rounded-lg border-l-4 px-4 py-3 text-sm"
            style={{ backgroundColor: "#fffbeb", borderColor: "#f59e0b", color: "#92400e" }}
          >
            <span className="font-bold">Draft pending review.</span> These Terms of Service
            are a working draft under owner and legal review. Items marked &ldquo;NEEDS
            FROM ASHLEY&rdquo; must be confirmed before publication.
          </div>
          <h1 className="text-3xl font-bold text-[var(--color-primary)] md:text-4xl">
            Terms of Service
          </h1>
          <p className="mt-3 text-sm text-[var(--color-text-muted)]">
            Last Updated: {LAST_UPDATED}
          </p>
          <div
            className="mt-6 h-1 w-20 rounded-full"
            style={{ backgroundColor: "var(--color-accent)" }}
          />

          <div className="mt-10 space-y-10 text-[var(--color-text-primary)]">
            {sections.map((section) => (
              <section key={section.heading}>
                <h2 className="text-xl font-semibold text-[var(--color-primary)] md:text-2xl">
                  {section.heading}
                </h2>
                <div className="mt-3">{section.body}</div>
              </section>
            ))}
          </div>

          <p className="mt-12 text-sm text-[var(--color-text-subtle)]">
            See also our{" "}
            <Link href="/privacy" className={linkClass}>
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </div>
  );
}
