/**
 * Booking confirmation emails (server-side, direct — no HTTP hop).
 *
 * Sends the customer "you're signed up" email + the admin "new registration"
 * notification for a completed Event booking. Extracted from
 * /api/send-confirmation so the consolidated /api/checkout/booking route and the
 * legacy route share one implementation. Never throws — an email failure must
 * not fail an already-completed (already-charged) booking.
 *
 * Parity note: confirmation emails are only sent for `eventType === "Event"`
 * (the existing templates load the Event model). PrivateEvent/Reservation
 * bookings do not send a confirmation email today; this preserves that behavior.
 */
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { EventEmailTemplate } from "@/components/email-templates/EventEmailTemplate";
import { CustomerDetailsTemplate } from "@/components/email-templates/CustomerDetailsTemplate";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import Event from "@/lib/models/Event";
import { resolveEmailRecipients, EMAIL_FROM } from "@/lib/email/recipients";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = EMAIL_FROM;

export async function sendBookingConfirmationEmails(
  customerId: string,
  eventId: string
): Promise<void> {
  try {
    await connectMongo();

    const customerDoc = await Customer.findById(customerId).lean();
    const eventDoc = await Event.findById(eventId).lean();
    if (!customerDoc || !eventDoc) {
      console.warn(
        "[SEND-BOOKING-CONFIRMATION] Skipping email — customer or event not found",
        { customerId, eventId }
      );
      return;
    }

    // Plain objects so the email templates don't choke on Mongoose internals.
    const customer = JSON.parse(JSON.stringify(customerDoc));
    const event = JSON.parse(JSON.stringify(eventDoc));
    const eventTitle = event.eventName || "your event";

    const { customer: customerRecipient, admin: adminRecipient } =
      resolveEmailRecipients(customerDoc.billingInfo.emailAddress);

    // Customer email only when they gave an address and we have a recipient.
    if (customerDoc.billingInfo.emailAddress && customerRecipient) {
      const html = await render(
        React.createElement(EventEmailTemplate, { customer, event })
      );
      await resend.emails.send({
        from: FROM,
        to: [customerRecipient],
        subject: `You've signed up for ${eventTitle}`,
        html,
      });
    }

    if (adminRecipient) {
      const html = await render(
        React.createElement(CustomerDetailsTemplate, { customer, event })
      );
      await resend.emails.send({
        from: FROM,
        to: [adminRecipient],
        subject: `New Registration: ${eventTitle}`,
        html,
      });
    }
  } catch (error) {
    console.error("[SEND-BOOKING-CONFIRMATION] Email send failed (non-fatal):", error);
  }
}
