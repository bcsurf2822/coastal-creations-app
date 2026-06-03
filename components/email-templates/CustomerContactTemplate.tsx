import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  CardText,
  emailText,
} from "./shared";

interface CustomerContactTemplateProps {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  description: string;
  baseUrl?: string;
}

export const CustomerContactTemplate: React.FC<
  Readonly<CustomerContactTemplateProps>
> = ({ name, email, phone, subject, description }) => (
  <EmailShell preview={`New contact message: ${subject}`} showDisclaimer={false}>
    <Text style={emailText.heroTitle}>New contact message</Text>
    <Text style={emailText.paragraph}>
      Someone reached out through the website contact form.
    </Text>

    <InfoCard title="Contact Information">
      <DetailRow label="Name">{name}</DetailRow>
      <DetailRow label="Email">{email}</DetailRow>
      {phone && <DetailRow label="Phone">{phone}</DetailRow>}
      <DetailRow label="Subject">{subject}</DetailRow>
    </InfoCard>

    <InfoCard title="Message">
      <CardText>{description}</CardText>
    </InfoCard>
  </EmailShell>
);

export default CustomerContactTemplate;
