import * as React from "react";
import { Text, Link, Button } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  emailText,
  getStudioEmail,
} from "./shared";

export interface ShippingConfirmationEmailProps {
  customerFirstName: string;
  orderNumber: string;
  carrier: string;
  trackingNumber: string;
  trackingUrlProvider?: string;
}

export const ShippingConfirmationEmail = ({
  customerFirstName,
  orderNumber,
  carrier,
  trackingNumber,
  trackingUrlProvider,
}: ShippingConfirmationEmailProps) => (
  <EmailShell preview={`Your order ${orderNumber} has shipped! — Coastal Creations Studio`}>
    <Text style={emailText.badge}>📦 YOUR ORDER HAS SHIPPED</Text>
    <Text style={emailText.heroTitle}>It&apos;s on its way!</Text>
    <Text style={emailText.paragraph}>
      Hi {customerFirstName}, great news — your order{" "}
      <strong>{orderNumber}</strong> has been packed and picked up by the
      carrier. You can track your package using the info below.
    </Text>

    <InfoCard title="Tracking Info">
      <DetailRow label="Order">{orderNumber}</DetailRow>
      <DetailRow label="Carrier">{carrier}</DetailRow>
      <DetailRow label="Tracking">{trackingNumber}</DetailRow>
    </InfoCard>

    {trackingUrlProvider && (
      <Button
        href={trackingUrlProvider}
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
        Track Your Package →
      </Button>
    )}

    <Text style={emailText.subParagraph}>
      Estimated delivery times vary by carrier. If you have any questions,
      reply to this email or reach us at{" "}
      <Link href={`mailto:${getStudioEmail()}`}>{getStudioEmail()}</Link>.
    </Text>
  </EmailShell>
);

export default ShippingConfirmationEmail;
