import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { CustomerContactTemplate } from "@/components/email-templates/CustomerContactTemplate";

const resend = new Resend(process.env.RESEND_API_KEY);

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  description: string;
}

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, description }: ContactFormData =
      await request.json();

    if (!name || typeof name !== "string") {
      return Response.json({ error: "Name is required" }, { status: 400 });
    }

    if (!email || typeof email !== "string") {
      return Response.json({ error: "Email is required" }, { status: 400 });
    }

    if (!subject || typeof subject !== "string") {
      return Response.json({ error: "Subject is required" }, { status: 400 });
    }

    if (!description || typeof description !== "string") {
      return Response.json({ error: "Message is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Response.json({ error: "Invalid email format" }, { status: 400 });
    }

    if (name.length < 2 || name.length > 100) {
      return Response.json(
        { error: "Name must be between 2 and 100 characters" },
        { status: 400 }
      );
    }

    if (subject.length < 2 || subject.length > 200) {
      return Response.json(
        { error: "Subject must be between 2 and 200 characters" },
        { status: 400 }
      );
    }

    if (description.length < 10 || description.length > 2000) {
      return Response.json(
        { error: "Message must be between 10 and 2000 characters" },
        { status: 400 }
      );
    }

    if (phone && phone.trim() !== "") {
      const phoneRegex = /^[\d\s\-\(\)\+\.]{10,20}$/;
      if (!phoneRegex.test(phone)) {
        return Response.json(
          { error: "Invalid phone number format" },
          { status: 400 }
        );
      }
    }

    console.log("[ContactAPI-POST] Processing contact form submission", {
      name,
      email,
      subject,
    });

    const emailHtml = await render(
      React.createElement(CustomerContactTemplate, {
        name: name.trim(),
        email: email.trim(),
        phone: phone?.trim() || "",
        subject: subject.trim(),
        description: description.trim(),
        // baseUrl: baseUrl,
      })
    );

    // Send notification email to owner
    const { error } = await resend.emails.send({
      from: "Coastal Creations <no-reply@resend.coastalcreationsstudio.com>",
      to: [process.env.STUDIO_EMAIL || "info@coastalcreationsstudio.com"],
      subject: `New Contact Message: ${subject.trim()}`,
      html: emailHtml,
      replyTo: email.trim(),
    });

    if (error) {
      console.error("[ContactAPI-POST] Error sending email:", error);
      return Response.json(
        { error: "Failed to send message" },
        { status: 500 }
      );
    }

    console.log("[ContactAPI-POST] Contact message sent successfully");

    return Response.json({
      success: true,
      message: "Your message has been sent successfully",
    });
  } catch (error) {
    console.error("[ContactAPI-POST] Contact form submission error:", error);
    return Response.json(
      {
        error: "An error occurred while processing your request",
      },
      { status: 500 }
    );
  }
}
