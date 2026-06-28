import * as React from "react";
import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Link,
  Img,
  Hr,
  Button,
} from "@react-email/components";

/**
 * The studio's public contact address. Single source of truth so templates stop
 * hardcoding it. STUDIO_EMAIL in prod; a sensible fallback otherwise.
 */
export const getStudioEmail = (): string =>
  process.env.STUDIO_EMAIL || "ashley@coastalcreationsstudio.com";

/**
 * Shared email design system for Coastal Creations transactional emails.
 * Aligned to the app design tokens (app/globals.css): sky-based primary
 * palette, orange accent, clean system typography. Uses table-based layout
 * (React Email Row/Column) for broad email-client compatibility - no flexbox.
 */
export const emailTheme = {
  font: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  colors: {
    primary: "#0c4a6e", // sky-900
    secondary: "#0369a1", // sky-700
    accent: "#fb923c", // orange-400
    light: "#f0f9ff", // sky-50
    lightBorder: "#e0f2fe", // sky-100
    ink: "#0f172a", // slate-900
    body: "#334155", // slate-700
    muted: "#64748b", // slate-500
    success: "#16a34a", // green-600
    successBg: "#f0fdf4", // green-50
    successBorder: "#bbf7d0", // green-200
    white: "#ffffff",
    pageBg: "#eef2f6", // slate tint so the white card pops
  },
};

const c = emailTheme.colors;

const LOGO_SRC =
  "https://coastalcreationsstudio.com/assets/logos/coastalLogoFull.png";

interface EmailShellProps {
  preview: string;
  children: React.ReactNode;
  /** Show the "you received this because you registered/purchased" line.
   *  Defaults to true (customer emails); pass false for internal/admin emails. */
  showDisclaimer?: boolean;
}

/**
 * Outer email chrome: head, preview text, page background, centered white
 * card with a branded header band and a standard footer.
 */
export const EmailShell = ({
  preview,
  children,
  showDisclaimer = true,
}: EmailShellProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{preview}</Preview>
    <Body style={shell.body}>
      <Container style={shell.container}>
        <Section style={shell.headerBand}>
          <Img
            src={LOGO_SRC}
            alt="Coastal Creations Studio"
            width="260"
            style={shell.logo}
          />
        </Section>
        <Section style={shell.content}>{children}</Section>
        <EmailFooter />
      </Container>
      {showDisclaimer && (
        <Text style={shell.disclaimer}>
          You received this email because you registered or made a purchase at
          Coastal Creations Studio.
        </Text>
      )}
    </Body>
  </Html>
);

/**
 * A titled, rounded information card. `tone` switches the accent color of
 * the title eyebrow bar.
 */
export const InfoCard = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => (
  <Section style={card.outer}>
    <table
      role="presentation"
      width="100%"
      cellPadding={0}
      cellSpacing={0}
      style={card.box}
    >
      <tbody>
        <tr>
          <td style={card.pad}>
            <Heading as="h3" style={card.title}>
              {title}
            </Heading>
            <table role="presentation" width="100%" cellPadding={0} cellSpacing={0}>
              <tbody>{children}</tbody>
            </table>
          </td>
        </tr>
      </tbody>
    </table>
  </Section>
);

/**
 * A label/value row inside an InfoCard. Renders as a table row so it stays
 * aligned in every email client.
 */
export const DetailRow = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <tr>
    <td style={detail.labelCell}>{label}</td>
    <td style={detail.valueCell}>{children}</td>
  </tr>
);

/**
 * Full-width free-text block inside an InfoCard (e.g. a message body).
 * Renders as a single-cell row so it spans the card. Preserves line breaks.
 */
export const CardText = ({ children }: { children: React.ReactNode }) => (
  <tr>
    <td style={detail.blockCell}>{children}</td>
  </tr>
);

/**
 * "View Square Receipt" link button — a subtle outlined CTA so it never competes
 * with a primary action. Renders nothing when no receipt URL is available.
 */
export const ReceiptButton = ({ href }: { href?: string }) => {
  if (!href) return null;
  return (
    <Button
      href={href}
      style={{
        display: "inline-block",
        border: `1px solid ${c.lightBorder}`,
        color: c.secondary,
        backgroundColor: c.white,
        fontSize: "14px",
        fontWeight: 600,
        padding: "10px 22px",
        borderRadius: "8px",
        textDecoration: "none",
        margin: "0 0 16px",
      }}
    >
      View Square Receipt
    </Button>
  );
};

export const EmailFooter = () => {
  const studioEmail = getStudioEmail();
  return (
    <Section style={footer.wrap}>
      <Hr style={footer.rule} />
      <Text style={footer.brand}>Coastal Creations Studio</Text>
      <Text style={footer.text}>411 E 8th Street, Ocean City, NJ 08226</Text>
      <Text style={footer.text}>
        <Link href={`mailto:${studioEmail}`} style={footer.link}>
          {studioEmail}
        </Link>
      </Text>
    </Section>
  );
};

const shell = {
  body: {
    backgroundColor: c.pageBg,
    fontFamily: emailTheme.font,
    margin: 0,
    padding: "24px 0",
  },
  container: {
    margin: "0 auto",
    maxWidth: "600px",
    width: "100%",
    backgroundColor: c.white,
    borderRadius: "16px",
    overflow: "hidden",
    boxShadow: "0 6px 24px rgba(12, 74, 110, 0.12)",
  },
  headerBand: {
    backgroundColor: c.light,
    backgroundImage: `linear-gradient(180deg, ${c.lightBorder}, ${c.light})`,
    padding: "32px 24px",
    textAlign: "center" as const,
    borderBottom: `3px solid ${c.accent}`,
  },
  logo: {
    margin: "0 auto",
    display: "block",
    maxWidth: "260px",
    width: "100%",
    height: "auto",
  },
  content: {
    padding: "32px 28px 8px",
  },
  disclaimer: {
    color: c.muted,
    fontSize: "12px",
    lineHeight: "18px",
    textAlign: "center" as const,
    maxWidth: "600px",
    margin: "16px auto 0",
    padding: "0 24px",
  },
};

const card = {
  outer: {
    padding: "0 0 16px",
  },
  box: {
    backgroundColor: c.light,
    border: `1px solid ${c.lightBorder}`,
    borderRadius: "14px",
  },
  pad: {
    padding: "20px 22px",
  },
  title: {
    color: c.primary,
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.08em",
    textTransform: "uppercase" as const,
    margin: "0 0 14px",
    fontFamily: emailTheme.font,
  },
};

const detail = {
  labelCell: {
    width: "130px",
    verticalAlign: "top" as const,
    padding: "6px 0",
    color: c.secondary,
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    fontFamily: emailTheme.font,
  },
  valueCell: {
    verticalAlign: "top" as const,
    padding: "6px 0",
    color: c.ink,
    fontSize: "15px",
    lineHeight: "22px",
    fontFamily: emailTheme.font,
  },
  blockCell: {
    padding: "4px 0",
    color: c.ink,
    fontSize: "15px",
    lineHeight: "23px",
    fontFamily: emailTheme.font,
    whiteSpace: "pre-wrap" as const,
  },
};

const footer = {
  wrap: {
    padding: "8px 28px 28px",
    textAlign: "center" as const,
  },
  rule: {
    borderColor: c.lightBorder,
    margin: "8px 0 20px",
  },
  brand: {
    color: c.primary,
    fontSize: "15px",
    fontWeight: 700,
    margin: "0 0 4px",
    fontFamily: emailTheme.font,
  },
  text: {
    color: c.muted,
    fontSize: "13px",
    lineHeight: "20px",
    margin: "2px 0",
    fontFamily: emailTheme.font,
  },
  link: {
    color: c.secondary,
    textDecoration: "none",
  },
};

// Shared text styles for use inside templates
export const emailText = {
  heroTitle: {
    color: c.primary,
    fontSize: "26px",
    fontWeight: 700,
    lineHeight: "32px",
    margin: "0 0 8px",
    fontFamily: emailTheme.font,
  },
  paragraph: {
    color: c.body,
    fontSize: "15px",
    lineHeight: "24px",
    margin: "0 0 16px",
    fontFamily: emailTheme.font,
  },
  badge: {
    display: "inline-block",
    backgroundColor: c.successBg,
    border: `1px solid ${c.successBorder}`,
    color: c.success,
    fontSize: "13px",
    fontWeight: 700,
    letterSpacing: "0.03em",
    padding: "6px 14px",
    borderRadius: "999px",
    margin: "0 0 16px",
    fontFamily: emailTheme.font,
  },
  subParagraph: {
    color: c.body,
    fontSize: "14px",
    lineHeight: "22px",
    margin: "0 0 12px",
    fontFamily: emailTheme.font,
  },
};
