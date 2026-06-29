import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/guards";
import { EmailTemplate } from "@/components/email-templates/EmailTemplate";
import { Resend } from "resend";
import { render } from "@react-email/render";
import * as React from "react";
import { EMAIL_FROM } from "@/lib/email/recipients";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST() {
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

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
      from: EMAIL_FROM,
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
  const guard = await requireAdmin();
  if (guard instanceof NextResponse) return guard;

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
      from: EMAIL_FROM,
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
