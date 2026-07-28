import * as React from "react";
import { Text } from "@react-email/components";
import { EmailShell, InfoCard, DetailRow, emailText } from "./shared";

interface NewsletterEmailTemplateProps {
  subscriberEmail: string;
}

export const NewsletterEmailTemplate: React.FC<
  Readonly<NewsletterEmailTemplateProps>
> = ({ subscriberEmail }) => (
  <EmailShell preview="New newsletter subscriber" showDisclaimer={false}>
    <Text style={emailText.heroTitle}>New newsletter subscriber</Text>
    <Text style={emailText.paragraph}>
      A new visitor just signed up for the Coastal Creations Studio newsletter.
      Add them to your mailing list.
    </Text>

    <InfoCard title="Subscriber Information">
      <DetailRow label="Email">{subscriberEmail}</DetailRow>
    </InfoCard>
  </EmailShell>
);

export default NewsletterEmailTemplate;
