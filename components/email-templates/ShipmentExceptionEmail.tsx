import * as React from "react";
import { Text, Button } from "@react-email/components";
import { EmailShell, InfoCard, DetailRow, emailText } from "./shared";

export interface ShipmentExceptionEmailProps {
  orderNumber: string;
  customerName: string;
  carrier: string;
  trackingNumber: string;
  /** Carrier tracking status reported by Shippo, e.g. "FAILURE" or "RETURNED". */
  carrierStatus: string;
  /** Optional human-readable detail from the carrier (substatus text). */
  statusDetails?: string;
  trackingUrlProvider?: string;
}

export function ShipmentExceptionEmail({
  orderNumber,
  customerName,
  carrier,
  trackingNumber,
  carrierStatus,
  statusDetails,
  trackingUrlProvider,
}: ShipmentExceptionEmailProps): React.ReactElement {
  return (
    <EmailShell
      preview={`Shipping issue on order ${orderNumber}`}
      showDisclaimer={false}
    >
      <Text style={emailText.heroTitle}>Shipping issue needs attention</Text>
      <Text style={emailText.paragraph}>
        The carrier reported a problem with order <strong>{orderNumber}</strong>.
        This was flagged automatically from carrier tracking — please review and
        follow up with the customer if needed.
      </Text>

      <InfoCard title="Shipment Status">
        <DetailRow label="Status">{carrierStatus}</DetailRow>
        {statusDetails && <DetailRow label="Details">{statusDetails}</DetailRow>}
        <DetailRow label="Carrier">{carrier}</DetailRow>
        <DetailRow label="Tracking">{trackingNumber}</DetailRow>
      </InfoCard>

      <InfoCard title="Order">
        <DetailRow label="Order">{orderNumber}</DetailRow>
        <DetailRow label="Customer">{customerName}</DetailRow>
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
          View Carrier Tracking →
        </Button>
      )}
    </EmailShell>
  );
}

export default ShipmentExceptionEmail;
