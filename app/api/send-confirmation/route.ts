import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { EventEmailTemplate } from "@/components/email-templates/EventEmailTemplate";
import { NextResponse } from "next/server";
import { connectMongo } from "@/lib/mongoose";
import Customer from "@/lib/models/Customer";
import Event from "@/lib/models/Event";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // Connect to database using the project's connection pattern
    await connectMongo();

    // Get data from request
    const { customerId, eventId } = await request.json();

    if (!customerId || !eventId) {
      return NextResponse.json(
        { error: "Customer ID and Event ID are required" },
        { status: 400 }
      );
    }

    // Get customer and event data
    const customerDoc = await Customer.findById(customerId).lean();
    const eventDoc = await Event.findById(eventId).lean();

    if (!customerDoc) {
      return NextResponse.json(
        { error: "Customer not found" },
        { status: 404 }
      );
    }

    if (!eventDoc) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Only proceed if customer has email
    if (!customerDoc.billingInfo.emailAddress) {
      return NextResponse.json(
        { message: "No email address provided, skipping email confirmation" },
        { status: 200 }
      );
    }

    // Convert the MongoDB documents to plain objects
    // This is necessary to avoid type issues with the email template
    const customer = JSON.parse(JSON.stringify(customerDoc));
    const event = JSON.parse(JSON.stringify(eventDoc));

    // Ensure object IDs are strings
    if (customer._id && typeof customer._id !== "string") {
      customer._id = customer._id.toString();
    }

    if (event._id && typeof event._id !== "string") {
      event._id = event._id.toString();
    }

    // Render email template
    const emailHtml = await render(
      React.createElement(EventEmailTemplate, {
        customer,
        event,
      })
    );

    // Get the event name for the subject line
    const eventTitle = event.eventName || "your event";

    // Send email to customer
    const { data, error } = await resend.emails.send({
      from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
      to: [customer.billingInfo.emailAddress],
      subject: `You've signed up for ${eventTitle}`,
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending confirmation email:", error);
      return NextResponse.json(
        { error: "Failed to send confirmation email" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Confirmation email sent successfully",
      data,
    });
  } catch (error) {
    console.error("Error sending confirmation email:", error);
    return NextResponse.json(
      { error: "An error occurred while sending the confirmation email" },
      { status: 500 }
    );
  }
}
