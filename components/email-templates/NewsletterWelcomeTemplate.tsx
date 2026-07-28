import * as React from "react";
import { Text } from "@react-email/components";
import { EmailShell, emailText } from "./shared";

interface NewsletterWelcomeTemplateProps {
  subscriberEmail: string;
}

/**
 * Customer-facing welcome email sent when someone subscribes to the
 * newsletter.
 */
export const NewsletterWelcomeTemplate: React.FC<
  Readonly<NewsletterWelcomeTemplateProps>
> = () => (
  <EmailShell preview="Welcome to the Coastal Creations Studio newsletter">
    <Text style={emailText.badge}>✓ YOU&apos;RE SUBSCRIBED</Text>
    <Text style={emailText.heroTitle}>Welcome to the studio!</Text>
    <Text style={emailText.paragraph}>
      Thanks for subscribing to the Coastal Creations Studio newsletter. You&apos;ll
      be the first to hear about new classes, seasonal workshops, camps, and
      special events in Ocean City.
    </Text>
    <Text style={emailText.paragraph}>
      Keep an eye on your inbox &mdash; we can&apos;t wait to create with you.
    </Text>
  </EmailShell>
);

export default NewsletterWelcomeTemplate;
