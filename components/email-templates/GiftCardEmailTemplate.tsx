import * as React from "react";
import { Text, Section, Link } from "@react-email/components";
import { EmailShell, emailText, emailTheme } from "./shared";

const c = emailTheme.colors;

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
}: GiftCardEmailTemplateProps): React.ReactElement => (
  <EmailShell preview={`${senderName} sent you a Coastal Creations gift card`}>
    <Text style={emailText.badge}>🎁 GIFT CARD</Text>
    <Text style={emailText.heroTitle}>You&apos;ve received a gift card!</Text>
    <Text style={emailText.paragraph}>
      Hi {recipientName}, <strong>{senderName}</strong> has sent you a gift card
      to Coastal Creations Studio.
    </Text>

    {personalMessage && (
      <Section style={styles.messageBox}>
        <Text style={styles.messageLabel}>Personal Message</Text>
        <Text style={styles.messageText}>&ldquo;{personalMessage}&rdquo;</Text>
      </Section>
    )}

    {/* Gift card visual */}
    <Section style={styles.cardOuter}>
      <table
        role="presentation"
        width="100%"
        cellPadding={0}
        cellSpacing={0}
        style={styles.card}
      >
        <tbody>
          <tr>
            <td style={styles.cardPad}>
              <Text style={styles.cardBrand}>Coastal Creations Studio</Text>
              <Text style={styles.cardLabel}>Value</Text>
              <Text style={styles.cardValue}>${amount.toFixed(2)}</Text>
              <Text style={styles.cardLabel}>Gift Card Number</Text>
              <Text style={styles.cardGan}>{gan}</Text>
            </td>
          </tr>
        </tbody>
      </table>
    </Section>

    <Text style={emailText.paragraph}>
      Enter this number at checkout to redeem your balance, online at{" "}
      <Link href="https://coastalcreationsstudio.com" style={styles.link}>
        coastalcreationsstudio.com
      </Link>{" "}
      or in the studio. This gift card does not expire and can be used across
      multiple visits.
    </Text>
  </EmailShell>
);

const styles = {
  messageBox: {
    backgroundColor: c.light,
    borderLeft: `4px solid ${c.accent}`,
    borderRadius: "8px",
    padding: "14px 18px",
    margin: "0 0 20px",
  },
  messageLabel: {
    color: c.secondary,
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase" as const,
    margin: "0 0 4px",
    fontFamily: emailTheme.font,
  },
  messageText: {
    color: c.ink,
    fontSize: "16px",
    fontStyle: "italic",
    lineHeight: "24px",
    margin: 0,
    fontFamily: emailTheme.font,
  },
  cardOuter: {
    padding: "0 0 20px",
  },
  card: {
    backgroundColor: c.primary,
    backgroundImage: `linear-gradient(135deg, ${c.primary}, ${c.secondary})`,
    borderRadius: "16px",
  },
  cardPad: {
    padding: "28px 26px",
    textAlign: "center" as const,
  },
  cardBrand: {
    color: "#bae6fd",
    fontSize: "13px",
    fontWeight: 600,
    letterSpacing: "0.04em",
    margin: "0 0 18px",
    fontFamily: emailTheme.font,
  },
  cardLabel: {
    color: "#bae6fd",
    fontSize: "11px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    margin: "0 0 4px",
    fontFamily: emailTheme.font,
  },
  cardValue: {
    color: c.white,
    fontSize: "44px",
    fontWeight: 800,
    lineHeight: "1",
    margin: "0 0 18px",
    fontFamily: emailTheme.font,
  },
  cardGan: {
    color: c.white,
    fontSize: "22px",
    fontWeight: 700,
    fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
    letterSpacing: "3px",
    margin: 0,
  },
  link: {
    color: c.secondary,
    fontWeight: 600,
    textDecoration: "underline",
  },
};

export default GiftCardEmailTemplate;
