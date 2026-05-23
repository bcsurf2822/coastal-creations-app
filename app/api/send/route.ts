import { EmailTemplate } from "@/components/email-templates/EmailTemplate";
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  try {
    const emailHtml = await render(
      React.createElement(EmailTemplate, { firstName: "John" })
    );

    const recipient =
      process.env.VERCEL_ENV === "production"
        ? process.env.STUDIO_EMAIL
        : process.env.DEV_EMAIL;

    if (!recipient) {
      return Response.json(
        { error: "Email recipient is not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Coastal Creations <no-reply@resend.coastalcreationsstudio.com>",
      to: [recipient],
      subject: "Welcome to Coastal Creations Studio",
      html: emailHtml,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}

export async function GET() {
  try {
    const emailHtml = await render(
      React.createElement(EmailTemplate, { firstName: "Visitor" })
    );

    const recipient =
      process.env.VERCEL_ENV === "production"
        ? process.env.STUDIO_EMAIL
        : process.env.DEV_EMAIL;

    if (!recipient) {
      return Response.json(
        { error: "Email recipient is not configured" },
        { status: 500 }
      );
    }

    const { data, error } = await resend.emails.send({
      from: "Coastal Creations <no-reply@resend.coastalcreationsstudio.com>",
      to: [recipient],
      subject: "Welcome to Coastal Creations Studio",
      html: emailHtml,
    });

    if (error) {
      return Response.json({ error }, { status: 500 });
    }

    return Response.json(data);
  } catch (error) {
    return Response.json({ error }, { status: 500 });
  }
}
