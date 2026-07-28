/**
 * Admin notification email when a customer submits a refund request.
 * Admin-only recipient (STUDIO_EMAIL in prod, DEV_EMAIL otherwise). Never throws —
 * a failed notification must not fail the request submission.
 */
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import {
  RefundRequestAdminEmail,
  type RefundRequestAdminData,
} from "@/components/email-templates/RefundRequestAdminEmail";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>";

export async function sendRefundRequestAdmin(
  data: RefundRequestAdminData
): Promise<void> {
  try {
    const isProduction = process.env.VERCEL_ENV === "production";
    const adminRecipient = isProduction
      ? (process.env.STUDIO_EMAIL ?? "ashley@coastalcreationsstudio.com")
      : process.env.DEV_EMAIL;
    if (!adminRecipient) return;

    const html = await render(
      React.createElement(RefundRequestAdminEmail, { data })
    );
    await resend.emails.send({
      from: FROM,
      to: [adminRecipient],
      subject: `Refund requested — ${data.referenceLabel}`,
      html,
    });
  } catch (error) {
    console.error(
      "[SEND-REFUND-REQUEST-ADMIN] Email send failed (non-fatal):",
      error
    );
  }
}
