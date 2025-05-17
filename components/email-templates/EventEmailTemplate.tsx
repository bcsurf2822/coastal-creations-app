import * as React from "react";
import {
  Html,
  Body,
  Container,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Link,
  Button,
} from "@react-email/components";

// Define types for our template based on the structure we need
interface CustomerBillingInfo {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
  emailAddress?: string;
  phoneNumber?: string;
}

interface ParticipantOption {
  categoryName: string;
  choiceName: string;
}

interface Participant {
  firstName: string;
  lastName: string;
  selectedOptions?: ParticipantOption[];
}

interface Customer {
  _id?: string;
  quantity: number;
  total: number;
  isSigningUpForSelf?: boolean;
  participants?: Participant[];
  selectedOptions?: ParticipantOption[];
  billingInfo: CustomerBillingInfo;
}

interface EventTime {
  startTime?: string;
  endTime?: string;
  [key: string]: unknown;
}

interface EventDates {
  startDate?: string;
  endDate?: string;
  isRecurring?: boolean;
  recurringPattern?: string;
  recurringEndDate?: string;
  [key: string]: unknown;
}

interface Event {
  _id?: string;
  name?: string;
  eventName?: string;
  description?: string;
  dates?: string | string[] | EventDates;
  time?: string | EventTime;
  notes?: string;
  whatToBring?: string;
  [key: string]: unknown; // Allow for additional properties
}

// Use generic types to be compatible with whatever event/customer structure is used
interface EventEmailTemplateProps {
  customer: Customer;
  event: Event;
}

export const EventEmailTemplate = ({
  customer,
  event,
}: EventEmailTemplateProps) => {
  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return "Date to be announced";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (timeObj: EventTime | string) => {
    if (!timeObj) return "";
    if (typeof timeObj === "string") return timeObj;

    let displayTime = "";
    if (timeObj.startTime) displayTime += timeObj.startTime;
    if (timeObj.endTime) displayTime += ` - ${timeObj.endTime}`;
    return displayTime;
  };

  // Get event name (handles different schema possibilities)
  const getEventName = () => {
    return event.eventName || event.name || "Your Event";
  };

  // Get event date (handles different schema structures)
  const getEventDate = () => {
    if (event.dates) {
      if (typeof event.dates === "string") {
        return formatDate(event.dates);
      } else if (Array.isArray(event.dates) && event.dates.length > 0) {
        return formatDate(event.dates[0]);
      } else if (
        typeof event.dates === "object" &&
        (event.dates as EventDates).startDate
      ) {
        return formatDate((event.dates as EventDates).startDate as string);
      }
    }
    return "Date to be announced";
  };

  // Get event time (handles different schema structures)
  const getEventTime = () => {
    if (typeof event.time === "string") {
      return event.time;
    } else if (event.time) {
      return formatTime(event.time as EventTime);
    }
    return "";
  };

  return (
    <Html>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Header */}
          <Section style={styles.header}>
            <Heading style={styles.headerTitle}>
              Coastal Creations Studio
            </Heading>
            <Text style={styles.headerSubtitle}>Event Confirmation</Text>
          </Section>

          {/* Main Content */}
          <Section style={styles.mainContent}>
            <Heading as="h2" style={styles.sectionTitle}>
              Thank you for your registration!
            </Heading>

            <Text style={styles.paragraph}>
              Hi {customer.billingInfo.firstName},
            </Text>

            <Text style={styles.paragraph}>
              We&apos;re excited to confirm your registration for{" "}
              <strong>{getEventName()}</strong>. Your payment has been processed
              successfully, and your spot is now secured.
            </Text>

            {/* Event Details */}
            <Section style={styles.detailsBox}>
              <Heading as="h3" style={styles.boxTitle}>
                Event Details
              </Heading>
              <Row>
                <Column>
                  <Text style={styles.detailLabel}>Event:</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>{getEventName()}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={styles.detailLabel}>Date:</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>{getEventDate()}</Text>
                </Column>
              </Row>
              {getEventTime() && (
                <Row>
                  <Column>
                    <Text style={styles.detailLabel}>Time:</Text>
                  </Column>
                  <Column>
                    <Text style={styles.detailValue}>{getEventTime()}</Text>
                  </Column>
                </Row>
              )}
              <Row>
                <Column>
                  <Text style={styles.detailLabel}>Location:</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>
                    Coastal Creations Studio
                    <br />
                    411 E 8th Street
                    <br />
                    Ocean City, NJ 08226
                  </Text>
                </Column>
              </Row>
              {event.description && (
                <Row>
                  <Column>
                    <Text style={styles.detailLabel}>Description:</Text>
                  </Column>
                  <Column>
                    <Text style={styles.detailValue}>{event.description}</Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Registration Details */}
            <Section style={styles.detailsBox}>
              <Heading as="h3" style={styles.boxTitle}>
                Registration Details
              </Heading>
              <Row>
                <Column>
                  <Text style={styles.detailLabel}>
                    Number of Participants:
                  </Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>{customer.quantity}</Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={styles.detailLabel}>Total Paid:</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>
                    {formatCurrency(customer.total)}
                  </Text>
                </Column>
              </Row>

              {/* Participant Information */}
              {customer.participants && customer.participants.length > 0 && (
                <>
                  <Heading as="h4" style={styles.subSectionTitle}>
                    Participant Information
                  </Heading>
                  {customer.participants.map(
                    (participant: Participant, index: number) => (
                      <div key={index} style={styles.participantBlock}>
                        <Text style={styles.participantName}>
                          {index + 1}. {participant.firstName}{" "}
                          {participant.lastName}
                        </Text>
                        {participant.selectedOptions &&
                          participant.selectedOptions.length > 0 && (
                            <Text style={styles.optionsText}>
                              Options:{" "}
                              {participant.selectedOptions
                                .map(
                                  (opt: ParticipantOption) =>
                                    `${opt.categoryName}: ${opt.choiceName}`
                                )
                                .join(", ")}
                            </Text>
                          )}
                      </div>
                    )
                  )}
                </>
              )}

              {/* Selected Options (if not participant-specific) */}
              {customer.selectedOptions &&
                customer.selectedOptions.length > 0 && (
                  <>
                    <Heading as="h4" style={styles.subSectionTitle}>
                      Selected Options
                    </Heading>
                    {customer.selectedOptions.map(
                      (option: ParticipantOption, index: number) => (
                        <Text key={index} style={styles.optionsText}>
                          • {option.categoryName}: {option.choiceName}
                        </Text>
                      )
                    )}
                  </>
                )}
            </Section>

            {/* Contact Information */}
            <Section style={styles.detailsBox}>
              <Heading as="h3" style={styles.boxTitle}>
                Your Information
              </Heading>
              <Row>
                <Column>
                  <Text style={styles.detailLabel}>Name:</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>
                    {customer.billingInfo.firstName}{" "}
                    {customer.billingInfo.lastName}
                  </Text>
                </Column>
              </Row>
              <Row>
                <Column>
                  <Text style={styles.detailLabel}>Email:</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>
                    {customer.billingInfo.emailAddress}
                  </Text>
                </Column>
              </Row>
              {customer.billingInfo.phoneNumber && (
                <Row>
                  <Column>
                    <Text style={styles.detailLabel}>Phone:</Text>
                  </Column>
                  <Column>
                    <Text style={styles.detailValue}>
                      {customer.billingInfo.phoneNumber}
                    </Text>
                  </Column>
                </Row>
              )}
            </Section>

            {/* Additional Information */}
            {(event.notes || event.whatToBring) && (
              <Section style={styles.detailsBox}>
                <Heading as="h3" style={styles.boxTitle}>
                  What to Bring
                </Heading>
                <Text style={styles.paragraph}>
                  {event.notes || event.whatToBring}
                </Text>
              </Section>
            )}

            {/* Instructions */}
            <Text style={styles.paragraph}>
              Please arrive 10-15 minutes before the event starts. If you need
              to make any changes to your registration or have any questions,
              please contact us at{" "}
              <Link href="mailto:info@coastalcreationsstudio.com">
                info@coastalcreationsstudio.com
              </Link>{" "}
              or call us at (609) 545-8648.
            </Text>

            <Button
              href="https://coastalcreationsstudio.com/calendar"
              style={styles.button}
            >
              View All Events
            </Button>
          </Section>

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} Coastal Creations Studio
            </Text>
            <Text style={styles.footerText}>
              411 E 8th Street, Ocean City, NJ 08226
            </Text>
            <Text style={styles.footerText}>
              <Link
                href="https://coastalcreationsstudio.com"
                style={styles.footerLink}
              >
                coastalcreationsstudio.com
              </Link>
            </Text>
            <Text style={styles.footerText}>
              <Link
                href="mailto:info@coastalcreationsstudio.com"
                style={styles.footerLink}
              >
                info@coastalcreationsstudio.com
              </Link>
              {" • "}
              <Link href="tel:+16095458648" style={styles.footerLink}>
                (609) 545-8648
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

// Styles
const styles = {
  body: {
    backgroundColor: "#f6f9fc",
    fontFamily:
      "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    margin: 0,
  },
  container: {
    margin: "0 auto",
    padding: "20px 0",
    maxWidth: "600px",
  },
  header: {
    backgroundColor: "#5A87B0", // Ocean blue
    padding: "30px 0",
    textAlign: "center" as const,
    borderRadius: "8px 8px 0 0",
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: "28px",
    fontWeight: "bold",
    margin: "0 0 10px",
  },
  headerSubtitle: {
    color: "#ffffff",
    fontSize: "18px",
    fontWeight: "normal",
    margin: 0,
  },
  mainContent: {
    backgroundColor: "#ffffff",
    padding: "40px 30px",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  },
  sectionTitle: {
    color: "#32325d",
    fontSize: "20px",
    fontWeight: "bold",
    margin: "0 0 20px",
  },
  detailsBox: {
    backgroundColor: "#f8fafc",
    padding: "20px",
    borderRadius: "8px",
    marginBottom: "30px",
    borderLeft: "3px solid #5A87B0",
  },
  boxTitle: {
    color: "#32325d",
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 15px",
  },
  subSectionTitle: {
    color: "#32325d",
    fontSize: "16px",
    fontWeight: "bold",
    margin: "15px 0 10px",
  },
  paragraph: {
    color: "#32325d",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 20px",
  },
  detailLabel: {
    color: "#6b7280",
    fontSize: "14px",
    fontWeight: "bold",
    margin: "8px 0",
  },
  detailValue: {
    color: "#32325d",
    fontSize: "15px",
    margin: "8px 0",
  },
  participantBlock: {
    marginBottom: "10px",
  },
  participantName: {
    color: "#32325d",
    fontSize: "15px",
    fontWeight: "500",
    margin: "5px 0",
  },
  optionsText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: "3px 0 3px 10px",
  },
  button: {
    backgroundColor: "#5A87B0",
    borderRadius: "4px",
    color: "#ffffff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    width: "100%",
    padding: "12px 0",
    marginTop: "30px",
  },
  footer: {
    textAlign: "center" as const,
    padding: "20px 0",
  },
  footerText: {
    color: "#6b7280",
    fontSize: "14px",
    margin: "5px 0",
  },
  footerLink: {
    color: "#5A87B0",
    textDecoration: "none",
  },
};

export default EventEmailTemplate;
