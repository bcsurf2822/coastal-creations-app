import * as React from "react";
import { Html, Section, Heading, Text, Link } from "@react-email/components";

interface NewsletterEmailTemplateProps {
  subscriberEmail: string;
}

export const NewsletterEmailTemplate: React.FC<
  Readonly<NewsletterEmailTemplateProps>
> = ({ subscriberEmail }) => (
  <Html lang="en" dir="ltr">
    <Section style={styles.header}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <img
          src="https://coastalcreationsstudio.com/assets/logos/coastalLogoFull.png"
          alt="Coastal Creations Studio Logo"
          style={{
            maxWidth: "350px",
            width: "100%",
            height: "auto",
            display: "block",
            margin: "0 auto",
          }}
        />
      </div>
    </Section>

    {/* Main Content */}
    <Section style={styles.mainContent}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Heading as="h2" style={styles.sectionTitle}>
          NEW NEWSLETTER SUBSCRIBER
        </Heading>
      </div>
      <div style={{ textAlign: "left", ...styles.mainContentText }}>
        <Text style={styles.paragraph}>
          A new user has subscribed to your newsletter.
        </Text>
      </div>
    </Section>

    {/* Subscriber Details */}
    <Section style={styles.detailsBoxOuter}>
      <div style={styles.detailsBoxInner}>
        <Heading as="h3" style={styles.boxTitle}>
          SUBSCRIBER INFORMATION
        </Heading>
        <div style={{ marginTop: 18 }}>
          <Text style={styles.detailValue}>
            <strong style={styles.detailLabel}>EMAIL ADDRESS:</strong>{" "}
            {subscriberEmail}
          </Text>
        </div>
      </div>
    </Section>

    {/* Admin Note */}
    <Section style={styles.mainContent}>
      <div style={{ textAlign: "left", ...styles.mainContentText }}>
        <Text style={styles.paragraph}>
          You should add this email to your newsletter mailing list.
        </Text>
      </div>
    </Section>

    <Section style={styles.footer}>
      <Text style={styles.footerText}>
        Coastal Creations Studio
        <br />
        411 E 8th Street, Ocean City, NJ 08226
      </Text>
      <Text style={styles.footerText}>
        <Link
          href="mailto:info@coastalcreationsstudio.com"
          style={styles.footerLink}
        >
          info@coastalcreationsstudio.com
        </Link>
      </Text>
    </Section>
  </Html>
);

// Styles
const styles = {
  body: {
    backgroundColor: "#ffffff",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
  },
  container: {
    margin: "0 auto",
    padding: "20px 0",
    maxWidth: "600px",
  },
  header: {
    backgroundColor: "#E5EAEB",
    padding: "40px 0",
    textAlign: "center" as const,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 0 10px",
  },
  headerSubtitle: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "normal",
    margin: 0,
  },
  mainContent: {
    backgroundColor: "#ffffff",
    color: "#2E6F89",
    padding: "40px 0 40px 0",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  },
  mainContentText: {
    padding: "0 24px",
    fontFamily: "Comic Sans MS, Comic Sans",
  },
  sectionTitle: {
    color: "#2E6F89",
    fontSize: "30px",
    fontWeight: "700",
    margin: "0 0 20px",
    fontFamily: "Impact, fantasy",
  },
  detailsBoxOuter: {
    backgroundColor: "#ffffff",
    padding: "0 0 30px 0",
    display: "flex",
    justifyContent: "center",
  },
  detailsBoxInner: {
    backgroundColor: "#E5F2F3",
    borderRadius: "28px",
    padding: "28px 24px 28px 24px",
    maxWidth: "95%",
    width: "100%",
    margin: "0 auto",
    border: "none",
    boxSizing: "border-box" as const,
  },
  boxTitle: {
    color: "#32325d",
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 15px",
  },
  subSectionTitle: {
    margin: "15px 0 10px",
    color: "#2E6F89",
    fontSize: "22px",
    fontWeight: "400",
    fontFamily: "Impact, fantasy",
  },
  paragraph: {
    color: "#32325d",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 20px",
    fontFamily: "Comic Sans MS, Comic Sans",
  },
  detailLabel: {
    color: "#2E6F89",
    fontSize: "16px",
    fontWeight: "400",
    margin: "8px 0",
    fontFamily: "Impact, fantasy",
  },
  detailValue: {
    color: "#32325d",
    fontSize: "15px",
    margin: "8px 0",
    fontFamily: "Comic Sans MS, Comic Sans",
  },
  participantBlock: {
    marginBottom: "10px",
  },
  participantName: {
    color: "#32325d",
    fontSize: "15px",
    fontWeight: "500",
    margin: "5px 0",
    fontFamily: "Comic Sans MS, Comic Sans",
  },
  optionsText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: "3px 0 3px 10px",
    fontFamily: "Comic Sans MS, Comic Sans",
  },
  button: {
    backgroundColor: "#5A87B0",
    borderRadius: "4px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "100%",
    padding: "12px 0",
    marginTop: "30px",
  },
  footer: {
    backgroundColor: "#ffffff",
    textAlign: "center" as const,
    padding: "20px 0",
  },
  footerText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: "5px 0",
  },
  footerLink: {
    color: "#5A87B0",
    textDecoration: "none",
  },
};
