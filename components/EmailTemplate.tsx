import * as React from "react";

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => (
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
        textAlign: "center",
        color: "#000",
      }}
    >
      <h1 style={{ margin: 0 }}>Coastal Creations Studio</h1>
    </div>
    <div style={{ padding: "20px" }}>
      <h2>Welcome, {firstName}!</h2>
      <p>
        Thank you for joining the Coastal Creations community. We&apos;re
        excited to have you with us!
      </p>
      <p>
        Here at Coastal Creations Studio, we offer a variety of creative classes
        and events that celebrate the beauty of coastal living.
      </p>
      <p>Feel free to visit our studio at:</p>
      <p style={{ fontWeight: "bold" }}>
        411 E 8th Street
        <br />
        Ocean City, NJ 08226
      </p>
      <p>
        If you have any questions, please don&apos;t hesitate to contact us at:
      </p>
      <p style={{ fontWeight: "bold" }}>
        Phone: (609) 399-0030
        <br />
        Email: info@coastalcreationsstudio.com
      </p>
    </div>
    <div
      style={{
        backgroundColor: "#f5f5f5",
        padding: "15px",
        textAlign: "center",
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
