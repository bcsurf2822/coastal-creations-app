import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  emailText,
  getStudioEmail,
} from "./shared";

interface EmailTemplateProps {
  firstName: string;
}

export const EmailTemplate: React.FC<Readonly<EmailTemplateProps>> = ({
  firstName,
}) => {
  const studioEmail = getStudioEmail();
  return (
    <EmailShell preview={`Welcome to Coastal Creations Studio, ${firstName}`}>
      <Text style={emailText.heroTitle}>Welcome, {firstName}!</Text>
      <Text style={emailText.paragraph}>
        Thanks for joining the Coastal Creations community. We offer creative
        classes, camps, and workshops that celebrate coastal living &mdash; come
        make something with us.
      </Text>

      <InfoCard title="Visit Us">
        <DetailRow label="Studio">
          411 E 8th Street
          <br />
          Ocean City, NJ 08226
        </DetailRow>
        <DetailRow label="Phone">(609) 399-0030</DetailRow>
        <DetailRow label="Email">{studioEmail}</DetailRow>
      </InfoCard>
    </EmailShell>
  );
};

export default EmailTemplate;
