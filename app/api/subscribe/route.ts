import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { NewsletterEmailTemplate } from "@/components/email-templates/NewsletterEmailTemplate";
import { NewsletterWelcomeTemplate } from "@/components/email-templates/NewsletterWelcomeTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = "Coastal Creations <no-reply@resend.coastalcreationsstudio.com>";

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

    const isProduction = process.env.VERCEL_ENV === "production";
    const adminRecipient = isProduction
      ? process.env.STUDIO_EMAIL
      : process.env.DEV_EMAIL;
    const customerRecipient = isProduction ? email : process.env.DEV_EMAIL;

    if (!adminRecipient) {
      return Response.json(
        { error: "Email recipient is not configured" },
        { status: 500 }
      );
    }

    // Admin notification
    const adminHtml = await render(
      React.createElement(NewsletterEmailTemplate, { subscriberEmail: email })
    );
    const { error: adminError } = await resend.emails.send({
      from: FROM,
      to: [adminRecipient],
      subject: "New Newsletter Subscriber",
      html: adminHtml,
    });

    if (adminError) {
      console.error("[SUBSCRIBE-POST] Admin email error:", adminError);
      return Response.json({ error: "Failed to send email" }, { status: 500 });
    }

    // Customer welcome email
    if (customerRecipient) {
      const welcomeHtml = await render(
        React.createElement(NewsletterWelcomeTemplate, {
          subscriberEmail: email,
        })
      );
      const { error: welcomeError } = await resend.emails.send({
        from: FROM,
        to: [customerRecipient],
        subject: "Welcome to Coastal Creations Studio",
        html: welcomeHtml,
      });

      if (welcomeError) {
        // Don't fail the subscription if only the welcome email fails
        console.error("[SUBSCRIBE-POST] Welcome email error:", welcomeError);
      }
    }

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
