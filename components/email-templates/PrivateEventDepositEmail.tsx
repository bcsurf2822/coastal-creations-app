import * as React from "react";
import { Text, Link } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  ReceiptButton,
  emailText,
} from "./shared";

export interface PrivateEventDepositEmailProps {
  customerFirstName: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  eventTitle: string;
  /** Deposit paid, in dollars. */
  depositPaid: number;
  /** Full event price, in dollars (used to show the remaining balance). */
  fullPrice?: number;
  /** Square-hosted receipt link for the deposit payment, when available. */
  receiptUrl?: string;
  /** Admin notification variant (vs. the customer confirmation). */
  isAdmin?: boolean;
}

const usd = (n: number): string =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const PrivateEventDepositEmail = ({
  customerFirstName,
  customerName,
  customerEmail,
  customerPhone,
  eventTitle,
  depositPaid,
  fullPrice,
  receiptUrl,
  isAdmin = false,
}: PrivateEventDepositEmailProps) => {
  const balanceDue =
    fullPrice != null && fullPrice > depositPaid
      ? fullPrice - depositPaid
      : undefined;

  if (isAdmin) {
    return (
      <EmailShell
        preview={`New private event deposit — ${eventTitle}`}
        showDisclaimer={false}
      >
        <Text style={emailText.badge}>💰 NEW PRIVATE EVENT DEPOSIT</Text>
        <Text style={emailText.heroTitle}>{eventTitle}</Text>
        <Text style={emailText.paragraph}>
          <strong>{customerName}</strong> paid a deposit to book the private
          event below. Reach out to finalize the details.
        </Text>

        <InfoCard title="Booking Details">
          <DetailRow label="Event">{eventTitle}</DetailRow>
          <DetailRow label="Deposit Paid">{usd(depositPaid)}</DetailRow>
          {balanceDue != null && (
            <DetailRow label="Balance Due">{usd(balanceDue)}</DetailRow>
          )}
        </InfoCard>

        <InfoCard title="Customer">
          <DetailRow label="Name">{customerName}</DetailRow>
          {customerEmail && (
            <DetailRow label="Email">
              <Link href={`mailto:${customerEmail}`}>{customerEmail}</Link>
            </DetailRow>
          )}
          {customerPhone && <DetailRow label="Phone">{customerPhone}</DetailRow>}
        </InfoCard>
      </EmailShell>
    );
  }

  return (
    <EmailShell preview={`Deposit received for ${eventTitle}`}>
      <Text style={emailText.badge}>✓ DEPOSIT RECEIVED</Text>
      <Text style={emailText.heroTitle}>Your event is reserved!</Text>
      <Text style={emailText.paragraph}>
        Hi {customerFirstName}, thank you! We&apos;ve received your deposit for{" "}
        <strong>{eventTitle}</strong>. Your date is being held and a member of
        our team will reach out shortly to finalize all the details.
      </Text>

      <InfoCard title="Booking Details">
        <DetailRow label="Event">{eventTitle}</DetailRow>
        <DetailRow label="Deposit Paid">{usd(depositPaid)}</DetailRow>
        {balanceDue != null && (
          <DetailRow label="Balance Due">{usd(balanceDue)}</DetailRow>
        )}
        <DetailRow label="Location">
          Coastal Creations Studio
          <br />
          411 E 8th Street
          <br />
          Ocean City, NJ 08226
        </DetailRow>
      </InfoCard>

      <ReceiptButton href={receiptUrl} />

      <Text style={emailText.subParagraph}>
        Any balance is settled when we confirm the final details of your event.
        Questions? Just reply to this email and we&apos;ll be happy to help.
      </Text>
    </EmailShell>
  );
};

export default PrivateEventDepositEmail;
