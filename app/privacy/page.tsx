import type { Metadata } from "next";
import type { ReactElement, ReactNode } from "react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy for Coastal Creations Studio in Ocean City, NJ. Learn what information we collect when you book classes or shop our store, how we use it, who we share it with, and your privacy rights.",
};

const LAST_UPDATED = "June 19, 2026";

const linkClass =
  "text-[var(--color-secondary)] hover:underline underline-offset-2";

interface PolicySection {
  heading: string;
  body: ReactNode;
}

const ReviewNote = ({ children }: { children: ReactNode }): ReactElement => (
  <div
    className="my-3 rounded-md border-l-4 px-3 py-2 text-sm font-medium"
    style={{ backgroundColor: "#fef3c7", borderColor: "#f59e0b", color: "#92400e" }}
  >
    <span className="font-bold">NEEDS FROM ASHLEY:</span> {children}
  </div>
);

const sections: PolicySection[] = [
  {
    heading: "1. Introduction",
    body: (
      <>
        <p className="mb-4">
          Coastal Creations Studio (&ldquo;Coastal Creations Studio,&rdquo;
          &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) is an art
          studio located in Ocean City, New Jersey, owned and operated by Ashley
          Mathers. This Privacy Policy explains what personal information we
          collect through our website at{" "}
          <a
            href="https://coastalcreationsstudio.com"
            className={linkClass}
            target="_blank"
            rel="noopener noreferrer"
          >
            coastalcreationsstudio.com
          </a>{" "}
          (the &ldquo;Site&rdquo;), how we use and share it, and the choices you
          have.
        </p>
        <ReviewNote>
          Confirm the exact legal business name and entity type (for example,
          &ldquo;Coastal Creations Studio LLC&rdquo; vs. a sole proprietorship)
          and the U.S. state where it is registered.
        </ReviewNote>
        <p>
          By using the Site, booking a class or event, or placing an order, you
          agree to the practices described in this Policy. Please also review our{" "}
          <Link href="/terms" className={linkClass}>
            Terms of Service
          </Link>
          , which govern your use of the Site.
        </p>
      </>
    ),
  },
  {
    heading: "2. Information We Collect",
    body: (
      <>
        <p className="mb-3">
          <span className="font-semibold">Information you provide to us</span>
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <span className="font-semibold">
              Class &amp; event booking and registration:
            </span>{" "}
            when you register for a class, camp, workshop, or private event, we
            collect participant first and last names, email address, phone
            number, billing information, and the class, camp, or workshop dates
            you select.
          </li>
          <li>
            <span className="font-semibold">Online store orders:</span> when you
            purchase physical products (such as Art Kits), we collect your
            shipping address, contact information, and order details.
          </li>
          <li>
            <span className="font-semibold">Newsletter sign-ups:</span> if you
            subscribe to our newsletter (for example, through the form in the
            Site footer), we collect your email address.
          </li>
          <li>
            <span className="font-semibold">Account information:</span> we are
            introducing customer accounts. If you create one, you may sign in
            using Google Sign-In or a passwordless email link, and we collect the
            associated name and email address.
          </li>
          <li>
            <span className="font-semibold">Communications:</span> if you contact
            us through the Site, we collect the information you choose to share,
            such as your name, email, and message.
          </li>
        </ul>
        <p className="mb-3">
          <span className="font-semibold">
            Information collected automatically
          </span>
        </p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            <span className="font-semibold">Usage and analytics data:</span> we
            use Google Analytics to understand how visitors use the Site,
            including pages viewed, traffic sources, and general usage patterns.
          </li>
          <li>
            <span className="font-semibold">Device and technical data:</span>{" "}
            information such as your browser type, device type, IP address, and
            similar technical details.
          </li>
          <li>
            <span className="font-semibold">Cookies:</span> cookies and similar
            technologies used for authentication, sessions, and analytics (see
            the Cookies &amp; Tracking Technologies section below).
          </li>
        </ul>
        <ReviewNote>
          Do you photograph or video participants (including children) during
          classes for the gallery, social media, or marketing? If yes, we will
          add a photo/media consent clause describing this.
        </ReviewNote>
      </>
    ),
  },
  {
    heading: "3. How We Use Your Information",
    body: (
      <>
        <p className="mb-3">We use the information we collect to:</p>
        <ul className="list-disc space-y-2 pl-6">
          <li>
            Process and manage class, camp, workshop, and private event bookings
            and registrations.
          </li>
          <li>
            Process online store orders, payments, shipping, and order
            fulfillment.
          </li>
          <li>
            Send transactional emails such as order confirmations, registration
            confirmations, and shipping updates.
          </li>
          <li>
            Send newsletters and marketing communications where you have opted
            in, which you can unsubscribe from at any time.
          </li>
          <li>
            Create and manage customer accounts and authenticate sign-ins.
          </li>
          <li>
            Respond to your questions, requests, and customer service needs.
          </li>
          <li>
            Operate, maintain, secure, and improve the Site and our services.
          </li>
          <li>
            Comply with legal obligations and enforce our Terms of Service.
          </li>
        </ul>
      </>
    ),
  },
  {
    heading: "4. How We Share Information",
    body: (
      <>
        <p className="mb-4">
          We do not sell your personal information. We share information only
          with service providers who help us operate the Site and our business,
          and only as needed for them to perform their services. These providers
          include:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>
            <span className="font-semibold">Square</span> — payment processing
            for bookings and store orders.
          </li>
          <li>
            <span className="font-semibold">Shippo</span> — shipping rate
            quotes, label generation, and package tracking for store orders.
          </li>
          <li>
            <span className="font-semibold">Resend</span> — delivery of
            transactional and marketing email.
          </li>
          <li>
            <span className="font-semibold">Google</span> — account
            authentication (Google Sign-In) and website analytics (Google
            Analytics).
          </li>
          <li>
            <span className="font-semibold">Sanity</span> — content management
            for Site content.
          </li>
          <li>
            <span className="font-semibold">MongoDB Atlas</span> — database
            hosting for booking, order, and account data.
          </li>
          <li>
            <span className="font-semibold">Vercel</span> — website hosting and
            infrastructure.
          </li>
        </ul>
        <p>
          We may also disclose information when required by law, to protect our
          rights or the safety of others, or in connection with a business
          transfer. We do not sell your personal information to third parties.
        </p>
        <ReviewNote>
          Confirm the complete list of analytics and marketing tools you use,
          e.g., Google Analytics only, or also Meta/Facebook Pixel, Mailchimp,
          or others, so we can list them accurately.
        </ReviewNote>
      </>
    ),
  },
  {
    heading: "5. Payment Processing",
    body: (
      <p>
        Payments are processed by Square, our third-party payment processor.
        When you make a payment, your card details are collected and handled
        directly by Square in accordance with its own privacy practices and
        security standards. We do not store full payment card numbers on our
        systems. We may retain limited transaction details (such as an order
        amount and a payment reference) to manage your booking or order.
      </p>
    ),
  },
  {
    heading: "6. Cookies & Tracking Technologies",
    body: (
      <>
        <p className="mb-4">
          We use cookies and similar technologies to keep you signed in,
          maintain your session and shopping cart, and measure Site usage
          through Google Analytics. Some cookies are necessary for the Site to
          function, while others help us understand traffic and improve our
          services.
        </p>
        <p>
          You can usually control or disable cookies through your browser
          settings. Please note that disabling certain cookies may affect the
          functionality of the Site, including authentication and checkout.
        </p>
      </>
    ),
  },
  {
    heading: "7. Data Retention",
    body: (
      <>
        <p>
          We retain personal information for as long as needed to provide our
          services, fulfill bookings and orders, comply with our legal and
          accounting obligations, resolve disputes, and enforce our agreements.
          When information is no longer needed, we take reasonable steps to
          delete or anonymize it.
        </p>
        <ReviewNote>
          Any specific data-retention period you want to commit to (e.g., keep
          customer/order records for X years), or leave as &ldquo;as long as
          needed.&rdquo;
        </ReviewNote>
      </>
    ),
  },
  {
    heading: "8. Data Security",
    body: (
      <p>
        We use reasonable administrative, technical, and organizational measures
        to protect personal information against unauthorized access, loss,
        misuse, or alteration. However, no method of transmission over the
        Internet or electronic storage is completely secure, and we cannot
        guarantee absolute security.
      </p>
    ),
  },
  {
    heading: "9. Children's Privacy",
    body: (
      <>
        <p className="mb-4">
          Our studio offers classes and camps for children, but the Site is
          intended for use by adults, such as parents and guardians, who book
          and register on behalf of their children. When you register a child
          for a class or camp, you do so as the parent or guardian and are
          responsible for the information you provide.
        </p>
        <p>
          Consistent with the Children&rsquo;s Online Privacy Protection Act
          (COPPA), we do not knowingly collect personal information directly from
          children under 13 without verifiable parental consent. If you believe a
          child under 13 has provided us personal information without parental
          consent, please contact us and we will take appropriate steps to delete
          it.
        </p>
      </>
    ),
  },
  {
    heading: "10. Your Privacy Rights",
    body: (
      <>
        <p className="mb-4">
          Depending on your location, you may have rights regarding your
          personal information, including the right to:
        </p>
        <ul className="mb-4 list-disc space-y-2 pl-6">
          <li>Access the personal information we hold about you.</li>
          <li>Request correction of inaccurate or incomplete information.</li>
          <li>Request deletion of your personal information.</li>
          <li>
            Opt out of marketing emails at any time, using the unsubscribe link
            in our emails or by contacting us.
          </li>
        </ul>
        <p>
          Residents of California and certain other states may have additional
          rights under applicable privacy laws, such as the California Consumer
          Privacy Act (CCPA), including rights to know, delete, and opt out of
          the sale of personal information (note that we do not sell personal
          information). To exercise any of these rights, contact us using the
          details in the Contact Us section below.
        </p>
      </>
    ),
  },
  {
    heading: "11. Third-Party Links",
    body: (
      <p>
        The Site may contain links to third-party websites or services that we
        do not operate or control. This Privacy Policy does not apply to those
        sites, and we are not responsible for their content or privacy
        practices. We encourage you to review the privacy policies of any
        third-party sites you visit.
      </p>
    ),
  },
  {
    heading: "12. Changes to This Policy",
    body: (
      <p>
        We may update this Privacy Policy from time to time. When we do, we will
        revise the &ldquo;Last Updated&rdquo; date at the top of this page.
        Material changes may be communicated through the Site or by email where
        appropriate. Your continued use of the Site after an update means you
        accept the revised Policy.
      </p>
    ),
  },
  {
    heading: "13. Contact Us",
    body: (
      <>
        <p className="mb-4">
          If you have questions about this Privacy Policy or how we handle your
          personal information, please contact us:
        </p>
        <p className="mb-1 font-semibold">Coastal Creations Studio</p>
        <p className="mb-1">411 E 8th Street</p>
        <p className="mb-1">Ocean City, NJ 08226, USA</p>
        <p className="mb-4">
          Email:{" "}
          <a href="mailto:info@coastalcreationsstudio.com" className={linkClass}>
            info@coastalcreationsstudio.com
          </a>
        </p>
        <p>
          This Privacy Policy is governed by the laws of the State of New Jersey,
          USA. See also our{" "}
          <Link href="/terms" className={linkClass}>
            Terms of Service
          </Link>
          .
        </p>
        <ReviewNote>
          Confirm the mailing address and email to publish for privacy and legal
          requests: use 411 E 8th Street and info@coastalcreationsstudio.com, or
          do you want a dedicated privacy email and/or a PO box?
        </ReviewNote>
      </>
    ),
  },
];

export default function PrivacyPolicyPage(): ReactElement {
  return (
    <div className="min-h-screen">
      <section className="py-16 md:py-20">
        <div className="container mx-auto max-w-3xl px-6">
          <div
            className="mb-8 rounded-lg border-l-4 px-4 py-3 text-sm"
            style={{ backgroundColor: "#fffbeb", borderColor: "#f59e0b", color: "#92400e" }}
          >
            <span className="font-bold">Draft pending review.</span> This Privacy Policy is
            a working draft under owner and legal review. Items marked &ldquo;NEEDS FROM
            ASHLEY&rdquo; must be confirmed before publication.
          </div>
          <h1
            className="text-4xl font-bold tracking-tight md:text-5xl"
            style={{ color: "var(--color-primary)" }}
          >
            Privacy Policy
          </h1>
          <p
            className="mt-3 text-sm"
            style={{ color: "var(--color-text-subtle)" }}
          >
            Last Updated: {LAST_UPDATED}
          </p>
          <hr
            className="mt-6 border-t-2"
            style={{ borderColor: "var(--color-accent)" }}
          />

          <div
            className="mt-10 space-y-10 leading-relaxed"
            style={{ color: "var(--color-text-primary)" }}
          >
            {sections.map((section) => (
              <section key={section.heading}>
                <h2
                  className="mb-4 text-2xl font-semibold"
                  style={{ color: "var(--color-primary)" }}
                >
                  {section.heading}
                </h2>
                <div style={{ color: "var(--color-text-muted)" }}>
                  {section.body}
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
