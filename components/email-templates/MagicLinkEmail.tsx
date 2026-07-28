import * as React from "react";
import { Text, Button } from "@react-email/components";
import { EmailShell, emailText } from "./shared";

export interface MagicLinkEmailProps {
  url: string;
}

export function MagicLinkEmail({ url }: MagicLinkEmailProps): React.ReactElement {
  return (
    <EmailShell
      preview="Your sign-in link — Coastal Creations Studio"
      showDisclaimer={false}
    >
      <Text style={emailText.heroTitle}>Sign in to Coastal Creations Studio</Text>
      <Text style={emailText.paragraph}>
        Click the button below to sign in. For your security this link expires in
        10 minutes and can only be used once.
      </Text>
      <Button
        href={url}
        style={{
          display: "inline-block",
          backgroundColor: "#0c4a6e",
          color: "#ffffff",
          fontSize: "15px",
          fontWeight: 700,
          padding: "12px 28px",
          borderRadius: "8px",
          textDecoration: "none",
          margin: "8px 0 20px",
        }}
      >
        Sign in
      </Button>
      <Text style={emailText.subParagraph}>
        If you didn&apos;t request this email, you can safely ignore it — no
        account will be created or accessed.
      </Text>
    </EmailShell>
  );
}

export default MagicLinkEmail;
