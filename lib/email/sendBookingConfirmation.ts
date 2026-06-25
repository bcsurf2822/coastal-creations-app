/**
 * Booking confirmation emails (server-side, direct — no HTTP hop).
 *
 * Sends the customer "you're signed up" email + the admin "new registration"
 * notification for a completed Event booking. Extracted from
 * /api/send-confirmation so the consolidated /api/checkout/booking route and the
 * legacy route share one implementation. Never throws — an email failure must
 * not fail an already-completed (already-charged) booking.
 *
 * Coverage: `Event` bookings send the full registration confirmation;
 * `PrivateEvent` bookings send a deposit-received confirmation. `Reservation`
 * bookings still send no confirmation email (no template wired today).
 */
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { EventEmailTemplate } from "@/components/email-templates/EventEmailTemplate";
import { CustomerDetailsTemplate } from "@/components/email-templates/CustomerDetailsTemplate";
import { PrivateEventDepositEmail } from "@/components/email-templates/PrivateEventDepositEmail";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import Event from "@/lib/models/Event";
import PrivateEvent from "@/lib/models/PrivateEvent";
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
    if (!customerDoc) {
      console.warn(
        "[SEND-BOOKING-CONFIRMATION] Skipping email — customer not found",
        { customerId, eventId }
      );
      return;
    }

    const customerEmail = customerDoc.billingInfo.emailAddress;
    const receiptUrl = customerDoc.squareReceiptUrl;
    const { customer: customerRecipient, admin: adminRecipient } =
      resolveEmailRecipients(customerEmail);

    // Private events send a deposit-received confirmation instead of the full
    // registration email (no class date/time; the team finalizes details later).
    if (customerDoc.eventType === "PrivateEvent") {
      const privateEventDoc = await PrivateEvent.findById(eventId).lean();
      if (!privateEventDoc) {
        console.warn(
          "[SEND-BOOKING-CONFIRMATION] Skipping email — private event not found",
          { customerId, eventId }
        );
        return;
      }
      const customerName =
        `${customerDoc.billingInfo.firstName} ${customerDoc.billingInfo.lastName}`.trim();
      const shared = {
        customerFirstName: customerDoc.billingInfo.firstName,
        customerName,
        customerEmail: customerEmail ?? undefined,
        customerPhone: customerDoc.billingInfo.phoneNumber,
        eventTitle: privateEventDoc.title,
        depositPaid: customerDoc.total,
        fullPrice: privateEventDoc.price,
        receiptUrl,
      };

      if (customerEmail && customerRecipient) {
        const html = await render(
          React.createElement(PrivateEventDepositEmail, shared)
        );
        await resend.emails.send({
          from: FROM,
          to: [customerRecipient],
          subject: `Deposit received for ${privateEventDoc.title}`,
          html,
        });
      }
      if (adminRecipient) {
        const html = await render(
          React.createElement(PrivateEventDepositEmail, { ...shared, isAdmin: true })
        );
        await resend.emails.send({
          from: FROM,
          to: [adminRecipient],
          subject: `New Private Event Deposit: ${privateEventDoc.title}`,
          html,
        });
      }
      return;
    }

    // Reservations have no confirmation template wired today.
    if (customerDoc.eventType !== "Event") return;

    const eventDoc = await Event.findById(eventId).lean();
    if (!eventDoc) {
      console.warn(
        "[SEND-BOOKING-CONFIRMATION] Skipping email — event not found",
        { customerId, eventId }
      );
      return;
    }

    // Plain objects so the email templates don't choke on Mongoose internals.
    const customer = JSON.parse(JSON.stringify(customerDoc));
    const event = JSON.parse(JSON.stringify(eventDoc));
    const eventTitle = event.eventName || "your event";

    // Customer email only when they gave an address and we have a recipient.
    if (customerEmail && customerRecipient) {
      const html = await render(
        React.createElement(EventEmailTemplate, { customer, event, receiptUrl })
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
