import * as React from "react";
import { Text } from "@react-email/components";
import { EmailShell, InfoCard, DetailRow, emailText } from "./shared";

export interface RefundRequestAdminData {
  referenceLabel: string; // "Order CC-1234" or event name
  type: "order" | "booking";
  customerName: string;
  customerEmail: string;
  requestedAmountFormatted: string;
  reason: string;
  lineItems?: Array<{ name: string; quantity: number }>;
}

interface RefundRequestAdminEmailProps {
  data: RefundRequestAdminData;
}

export const RefundRequestAdminEmail = ({
  data,
}: RefundRequestAdminEmailProps) => (
  <EmailShell
    preview={`Refund requested — ${data.referenceLabel}`}
    showDisclaimer={false}
  >
    <Text style={emailText.heroTitle}>New refund request</Text>
    <Text style={emailText.paragraph}>
      {data.customerName} requested a refund on{" "}
      {data.type === "order" ? "a store order" : "a booking"}. Review and resolve
      it in the admin Refunds queue.
    </Text>

    <InfoCard title="Request">
      <DetailRow label="Reference">{data.referenceLabel}</DetailRow>
      <DetailRow label="Customer">{data.customerName}</DetailRow>
      <DetailRow label="Email">{data.customerEmail}</DetailRow>
      {data.lineItems && data.lineItems.length > 0
        ? data.lineItems.map((item, i) => (
            <DetailRow key={i} label={i === 0 ? "Items" : ""}>
              {item.quantity}× {item.name}
            </DetailRow>
          ))
        : null}
      <DetailRow label="Est. amount">{data.requestedAmountFormatted}</DetailRow>
      <DetailRow label="Reason">{data.reason}</DetailRow>
    </InfoCard>

    <Text style={emailText.subParagraph}>
      Open the dashboard → Refunds to approve &amp; issue or decline this request.
    </Text>
  </EmailShell>
);

export default RefundRequestAdminEmail;
