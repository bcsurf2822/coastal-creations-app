import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  emailText,
  getStudioEmail,
} from "./shared";

export interface RefundLineItem {
  name: string;
  quantity: number;
  amountFormatted: string; // e.g. "$24.99"
}

export interface RefundConfirmationData {
  customerName: string;
  /** Human reference, e.g. "Order CC-LXYZ-4821" or an event title. */
  referenceLabel: string;
  refundAmountFormatted: string; // e.g. "$24.99"
  reason?: string;
  /** Optional itemized lines (store refunds). Events pass an amount only. */
  lineItems?: RefundLineItem[];
  /** Whether this fully refunds the purchase (changes the closing copy). */
  isFullRefund?: boolean;
}

interface RefundConfirmationEmailProps {
  data: RefundConfirmationData;
}

export const RefundConfirmationEmail = ({
  data,
}: RefundConfirmationEmailProps) => (
  <EmailShell
    preview={`Refund processed for ${data.referenceLabel} — Coastal Creations Studio`}
  >
    <Text style={emailText.badge}>↩ REFUND PROCESSED</Text>
    <Text style={emailText.heroTitle}>Your refund is on its way</Text>
    <Text style={emailText.paragraph}>
      Hi {data.customerName}, we&apos;ve processed a refund of{" "}
      <strong>{data.refundAmountFormatted}</strong> for{" "}
      <strong>{data.referenceLabel}</strong>. Refunds typically take 5–10
      business days to appear on your original payment method.
    </Text>

    <InfoCard title="Refund Details">
      {data.lineItems && data.lineItems.length > 0
        ? data.lineItems.map((item, i) => (
            <DetailRow key={i} label={`${item.quantity}×`}>
              {item.name}
              {"  "}
              <span style={{ color: "#64748b", fontSize: "13px" }}>
                ({item.amountFormatted})
              </span>
            </DetailRow>
          ))
        : null}
      <DetailRow label="Refund Total">
        <strong>{data.refundAmountFormatted}</strong>
      </DetailRow>
      {data.reason ? <DetailRow label="Reason">{data.reason}</DetailRow> : null}
    </InfoCard>

    <Text style={emailText.subParagraph}>
      {data.isFullRefund
        ? "This order has been fully refunded."
        : "If you have questions about this refund, just reply to this email or contact us at "}
      {data.isFullRefund ? null : (
        <a href={`mailto:${getStudioEmail()}`}>{getStudioEmail()}</a>
      )}
      {data.isFullRefund ? null : "."}
    </Text>
  </EmailShell>
);

export default RefundConfirmationEmail;
