import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { NewsletterEmailTemplate } from "@/components/NewsletterEmailTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    // Validate email format using regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    // Render email template
    const emailHtml = await render(
      React.createElement(NewsletterEmailTemplate, { subscriberEmail: email })
    );

    // Send notification email to admin
    const { error } = await resend.emails.send({
      from: "Coastal Creations <no-reply@resend.coastalcreationsstudio.com>",
      to: ["info@coastalcreationsstudio.com"],
      subject: "New Newsletter Subscriber",
      html: emailHtml,
    });

    if (error) {
      console.error("Error sending email:", error);
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Here you would typically also add the email to your newsletter service
    // e.g., Mailchimp, ConvertKit, etc.

    return Response.json({
      success: true,
      message: "Successfully subscribed to newsletter",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return Response.json(
      {
        error: "An error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}
