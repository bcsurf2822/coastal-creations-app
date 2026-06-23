/**
 * Refund confirmation emails (server-side, direct — no HTTP hop).
 *
 * Sends the customer a "your refund was processed" email plus an admin copy,
 * for BOTH store-order refunds (itemized) and event-booking refunds
 * (amount-only). Mirrors the dev/prod routing used elsewhere
 * (lib/email/sendBookingConfirmation.ts, app/api/store/checkout). Never throws —
 * an email failure must not fail an already-processed (already-refunded)
 * transaction.
 */
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import {
  RefundConfirmationEmail,
  type RefundConfirmationData,
} from "@/components/email-templates/RefundConfirmationEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>";

export async function sendRefundConfirmation(params: {
  customerEmail?: string | null;
  data: RefundConfirmationData;
}): Promise<void> {
  try {
    const isProduction = process.env.VERCEL_ENV === "production";
    const customerRecipient = isProduction
      ? params.customerEmail
      : (process.env.DEV_EMAIL ?? params.customerEmail);
    const adminRecipient = isProduction
      ? (process.env.STUDIO_EMAIL ?? "ashley@coastalcreationsstudio.com")
      : (process.env.DEV_EMAIL ?? params.customerEmail);

    const html = await render(
      React.createElement(RefundConfirmationEmail, { data: params.data })
    );
    const subject = `Refund processed — ${params.data.referenceLabel}`;

    const sends: Promise<unknown>[] = [];
    if (customerRecipient) {
      sends.push(
        resend.emails.send({
          from: FROM,
          to: [customerRecipient],
          subject,
          html,
        })
      );
    }
    // Admin copy — skip when it would duplicate the customer recipient (dev: both DEV_EMAIL).
    if (adminRecipient && adminRecipient !== customerRecipient) {
      sends.push(
        resend.emails.send({
          from: FROM,
          to: [adminRecipient],
          subject: `[Admin] ${subject}`,
          html,
        })
      );
    }

    await Promise.allSettled(sends);
  } catch (error) {
    console.error(
      "[SEND-REFUND-CONFIRMATION] Email send failed (non-fatal):",
      error
    );
  }
}
