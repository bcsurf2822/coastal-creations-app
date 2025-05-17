import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { EventEmailTemplate } from "@/components/email-templates/EventEmailTemplate";
import { CustomerDetailsTemplate } from "@/components/email-templates/CustomerDetailsTemplate";
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

    // Get the event name for the subject line
    const eventTitle = event.eventName || "your event";

    // Array to store email sending results
    const emailResults = [];

    // Only send customer email if they provided an email address
    if (customerDoc.billingInfo.emailAddress) {
      // Render customer email template
      const customerEmailHtml = await render(
        React.createElement(EventEmailTemplate, {
          customer,
          event,
        })
      );

      // Send email to customer
      const customerEmailResult = await resend.emails.send({
        from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
        to: [customer.billingInfo.emailAddress],
        subject: `You've signed up for ${eventTitle}`,
        html: customerEmailHtml,
      });

      emailResults.push({
        type: "customer",
        success: !customerEmailResult.error,
        error: customerEmailResult.error,
      });
    }

    // Render admin notification email template
    const adminEmailHtml = await render(
      React.createElement(CustomerDetailsTemplate, {
        customer,
        event,
      })
    );

    // Send email to admin
    const adminEmailResult = await resend.emails.send({
      from: "Coastal Creations Studio <no-reply@resend.coastalcreationsstudio.com>",
      to: ["ashley@coastalcreationsstudio.com"],
      subject: `New Registration: ${eventTitle}`,
      html: adminEmailHtml,
    });

    emailResults.push({
      type: "admin",
      success: !adminEmailResult.error,
      error: adminEmailResult.error,
    });

    // Check for any errors
    const hasErrors = emailResults.some((result) => result.error);

    if (hasErrors) {
      console.error("Error sending emails:", emailResults);
      return NextResponse.json(
        { error: "Failed to send one or more emails", details: emailResults },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Emails sent successfully",
      details: emailResults,
    });
  } catch (error) {
    console.error("Error sending emails:", error);
    return NextResponse.json(
      { error: "An error occurred while sending emails" },
      { status: 500 }
    );
  }
}
