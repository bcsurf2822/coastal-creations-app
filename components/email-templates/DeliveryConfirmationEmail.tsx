import * as React from "react";
import { Text, Link } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  emailText,
  getStudioEmail,
} from "./shared";

/**
 * Sent automatically when the Shippo tracking webhook reports DELIVERED
 * (diagram step 8). Triggered from app/api/webhooks/shippo, once per order.
 */
export interface DeliveryConfirmationEmailProps {
  customerFirstName: string;
  orderNumber: string;
  carrier?: string;
  trackingNumber?: string;
}

export const DeliveryConfirmationEmail = ({
  customerFirstName,
  orderNumber,
  carrier,
  trackingNumber,
}: DeliveryConfirmationEmailProps): React.ReactElement => (
  <EmailShell preview={`Your order ${orderNumber} was delivered — Coastal Creations Studio`}>
    <Text style={emailText.badge}>✅ DELIVERED</Text>
    <Text style={emailText.heroTitle}>Your order has arrived!</Text>
    <Text style={emailText.paragraph}>
      Hi {customerFirstName}, your order <strong>{orderNumber}</strong> has been
      delivered. We hope you love it!
    </Text>

    <InfoCard title="Delivery Details">
      <DetailRow label="Order">{orderNumber}</DetailRow>
      {carrier && <DetailRow label="Carrier">{carrier}</DetailRow>}
      {trackingNumber && <DetailRow label="Tracking">{trackingNumber}</DetailRow>}
    </InfoCard>

    <Text style={emailText.subParagraph}>
      Something not right with your order? Reply to this email or reach us at{" "}
      <Link href={`mailto:${getStudioEmail()}`}>{getStudioEmail()}</Link>.
    </Text>
  </EmailShell>
);

export default DeliveryConfirmationEmail;
