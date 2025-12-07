import * as React from "react";
import {
  Html,
  Section,
  Heading,
  Text,
  Link,
} from "@react-email/components";

interface GiftCardEmailTemplateProps {
  recipientName: string;
  senderName: string;
  amount: number;
  gan: string;
  personalMessage?: string;
}

export const GiftCardEmailTemplate = ({
  recipientName,
  senderName,
  amount,
  gan,
  personalMessage,
}: GiftCardEmailTemplateProps): React.ReactElement => {
  return (
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

      <Section style={styles.mainContent}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Heading as="h2" style={styles.sectionTitle}>
            YOU RECEIVED A GIFT CARD!
          </Heading>
        </div>
        <div style={{ textAlign: "left", ...styles.mainContentText }}>
          <Text style={styles.paragraph}>
            Hi {recipientName},
          </Text>
          <Text style={styles.paragraph}>
            Great news! <strong>{senderName}</strong> has sent you a gift card to Coastal Creations Studio!
          </Text>
          {personalMessage && (
            <div style={styles.messageBox}>
              <Text style={styles.messageLabel}>Personal Message:</Text>
              <Text style={styles.messageText}>&quot;{personalMessage}&quot;</Text>
            </div>
          )}
        </div>
      </Section>

      <Section style={styles.detailsBoxOuter}>
        <div style={styles.detailsBoxInner}>
          <Heading as="h3" style={styles.boxTitle}>
            YOUR GIFT CARD
          </Heading>
          <div style={styles.giftCardDisplay}>
            <Text style={styles.amountLabel}>Value</Text>
            <Text style={styles.amountValue}>${amount.toFixed(2)}</Text>
            <Text style={styles.ganLabel}>Gift Card Number</Text>
            <Text style={styles.ganValue}>{gan}</Text>
          </div>
          <Text style={styles.instructionText}>
            Use this number at checkout to redeem your gift card balance.
          </Text>
        </div>
      </Section>

      <Section style={styles.mainContent}>
        <div style={{ textAlign: "left", padding: "0 24px" }}>
          <Text style={styles.paragraph}>
            Ready to use your gift card? Visit us at the studio or book an event online at{" "}
            <Link href="https://coastalcreationsstudio.com" style={styles.link}>
              coastalcreationsstudio.com
            </Link>
          </Text>
          <Text style={styles.smallText}>
            This gift card does not expire. The full balance can be used across multiple visits.
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
            href={`mailto:${process.env.STUDIO_EMAIL || "info@coastalcreationsstudio.com"}`}
            style={styles.footerLink}
          >
            {process.env.STUDIO_EMAIL || "info@coastalcreationsstudio.com"}
          </Link>
        </Text>
      </Section>
    </Html>
  );
};

const styles = {
  header: {
    backgroundColor: "#E5EAEB",
    padding: "40px 0",
    textAlign: "center" as const,
  },
  mainContent: {
    backgroundColor: "#ffffff",
    color: "#2E6F89",
    padding: "40px 0",
  },
  mainContentText: {
    padding: "0 24px",
    fontFamily: "Comic Sans MS, Comic Sans, sans-serif",
  },
  sectionTitle: {
    color: "#2E6F89",
    fontSize: "30px",
    fontWeight: "700",
    margin: "0 0 20px",
    fontFamily: "Impact, fantasy",
  },
  paragraph: {
    color: "#32325d",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 20px",
    fontFamily: "Comic Sans MS, Comic Sans, sans-serif",
  },
  messageBox: {
    backgroundColor: "#f7f7f7",
    borderRadius: "8px",
    padding: "16px",
    margin: "20px 0",
    borderLeft: "4px solid #2E6F89",
  },
  messageLabel: {
    color: "#666",
    fontSize: "12px",
    fontWeight: "600",
    margin: "0 0 8px",
    textTransform: "uppercase" as const,
  },
  messageText: {
    color: "#32325d",
    fontSize: "16px",
    fontStyle: "italic",
    margin: 0,
    fontFamily: "Comic Sans MS, Comic Sans, sans-serif",
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
    padding: "28px 24px",
    maxWidth: "95%",
    width: "100%",
    margin: "0 auto",
    textAlign: "center" as const,
  },
  boxTitle: {
    color: "#32325d",
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 20px",
  },
  giftCardDisplay: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    padding: "24px",
    margin: "0 0 20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
  },
  amountLabel: {
    color: "#666",
    fontSize: "12px",
    fontWeight: "600",
    margin: "0 0 4px",
    textTransform: "uppercase" as const,
  },
  amountValue: {
    color: "#2E6F89",
    fontSize: "42px",
    fontWeight: "bold",
    margin: "0 0 20px",
    fontFamily: "Impact, fantasy",
  },
  ganLabel: {
    color: "#666",
    fontSize: "12px",
    fontWeight: "600",
    margin: "0 0 8px",
    textTransform: "uppercase" as const,
  },
  ganValue: {
    color: "#32325d",
    fontSize: "20px",
    fontWeight: "bold",
    margin: 0,
    fontFamily: "monospace",
    letterSpacing: "2px",
  },
  instructionText: {
    color: "#666",
    fontSize: "14px",
    margin: 0,
  },
  link: {
    color: "#2E6F89",
    textDecoration: "underline",
  },
  smallText: {
    color: "#999",
    fontSize: "13px",
    margin: "20px 0 0",
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

export default GiftCardEmailTemplate;
