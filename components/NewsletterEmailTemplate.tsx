import * as React from "react";

interface NewsletterEmailTemplateProps {
  subscriberEmail: string;
}

export const NewsletterEmailTemplate: React.FC<
  Readonly<NewsletterEmailTemplateProps>
> = ({ subscriberEmail }) => (
  <div
    style={{
      fontFamily: "Arial, sans-serif",
      maxWidth: "600px",
      margin: "0 auto",
    }}
  >
    <div
      style={{
        backgroundColor: "#87CEEB",
        padding: "20px",
        textAlign: "center" as const,
        color: "#000",
      }}
    >
      <h1 style={{ margin: 0 }}>Coastal Creations Studio</h1>
    </div>
    <div style={{ padding: "20px" }}>
      <h2>New Newsletter Subscriber!</h2>
      <p>A new user has subscribed to your newsletter.</p>
      <p>
        <strong>Email Address:</strong> {subscriberEmail}
      </p>
      <p>You should add this email to your newsletter mailing list.</p>
    </div>
    <div
      style={{
        backgroundColor: "#f5f5f5",
        padding: "15px",
        textAlign: "center" as const,
        fontSize: "12px",
      }}
    >
      <p>
        &copy; {new Date().getFullYear()} Coastal Creation Studios. All rights
        reserved.
      </p>
    </div>
  </div>
);
