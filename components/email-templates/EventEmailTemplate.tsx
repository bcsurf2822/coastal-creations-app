import * as React from "react";
import {
  Html,
  Section,
  Row,
  Column,
  Heading,
  Text,
  Link,

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
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    if (timeObj.startTime) {
      try {
        // Create a Date object for formatting. Use a dummy date part.
        const startTime = new Date(`2000-01-01T${timeObj.startTime}:00`);
        if (!isNaN(startTime.getTime())) {
          displayTime += startTime.toLocaleTimeString("en-US", options);
        } else {
          // Fallback if parsing fails
          displayTime += timeObj.startTime;
        }
      } catch {
        // Fallback in case of any error during formatting
        displayTime += timeObj.startTime;
      }
    }

    if (timeObj.endTime) {
      try {
        const endTime = new Date(`2000-01-01T${timeObj.endTime}:00`);
        if (!isNaN(endTime.getTime())) {
          if (displayTime) displayTime += " - ";
          displayTime += endTime.toLocaleTimeString("en-US", options);
        } else {
          // Fallback if parsing fails
          if (displayTime) displayTime += " - ";
          displayTime += timeObj.endTime;
        }
      } catch {
        // Fallback in case of any error during formatting
        if (displayTime) displayTime += " - ";
        displayTime += timeObj.endTime;
      }
    }

    return displayTime ? `${displayTime} ET` : "";
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
    <Html lang="en" dir="ltr">
      <Section style={styles.header}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src="https://coastalcreationsstudio.com/assets/logos/coastalLogoFull.png"
            alt="Coastal Creations Studio Logo"
            style={{
              maxWidth: "350px",
              width: "100%",
              height: "auto",
              display: "block",
              margin: "0 auto",
            }}
          />
        </div>
      </Section>

      {/* Main Content */}
      <Section style={styles.mainContent}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <Heading as="h2" style={styles.sectionTitle}>
            EVENT CONFIRMATION
          </Heading>
        </div>
        <div style={{ textAlign: "left", ...styles.mainContentText }}>
          <Text style={styles.paragraph}>Thank you for your registration!</Text>
          <Text style={styles.paragraph}>
            Hi {customer.billingInfo.firstName},
          </Text>
          <Text style={styles.paragraph}>
            We&apos;re excited to confirm your registration for{" "}
            <strong>{getEventName()}</strong>. Your payment has been processed
            successfully, and your spot is now secured.
          </Text>
        </div>
      </Section>
      {/* Event Details */}
      <Section style={styles.detailsBoxOuter}>
        <div style={styles.detailsBoxInner}>
          <Heading as="h3" style={styles.boxTitle}>
            EVENT DETAILS
          </Heading>
          <div style={{ marginTop: 18 }}>
            <Row>
              <Column style={{ width: "120px" }}>
                <Text style={styles.detailLabel}>EVENT :</Text>
              </Column>
              <Column>
                <Text style={styles.detailValue}>{getEventName()}</Text>
              </Column>
            </Row>
            <Row>
              <Column style={{ width: "120px" }}>
                <Text style={styles.detailLabel}>DATE :</Text>
              </Column>
              <Column>
                <Text style={styles.detailValue}>{getEventDate()}</Text>
              </Column>
            </Row>
            {getEventTime() && (
              <Row>
                <Column style={{ width: "120px" }}>
                  <Text style={styles.detailLabel}>TIME :</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>{getEventTime()}</Text>
                </Column>
              </Row>
            )}
            <Row>
              <Column style={{ width: "120px" }}>
                <Text style={styles.detailLabel}>LOCATION :</Text>
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
                <Column style={{ width: "120px" }}>
                  <Text style={styles.detailLabel}>DESCRIPTION :</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>{event.description}</Text>
                </Column>
              </Row>
            )}
          </div>
        </div>
      </Section>

      <Section style={styles.footer}>
        <Text style={styles.footerText}>
          Coastal Creations Studio
          <br />
          411 E 8th Street, Ocean City, NJ 08226
        </Text>
        <Text style={styles.footerText}>
          <Link
            href="mailto:info@coastalcreationsstudio.com"
            style={styles.footerLink}
          >
            info@coastalcreationsstudio.com
          </Link>
        </Text>
      </Section>
    </Html>
  );
};
// Styles
const styles = {
  body: {
    backgroundColor: "#ffffff",
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
    backgroundColor: "#E5EAEB",
    padding: "40px 0",
    textAlign: "center" as const,
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
    color: "#2E6F89",
    padding: "40px 0 40px 0",
    borderRadius: "0 0 8px 8px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
  },
  mainContentText: {
    padding: "0 24px",
    fontFamily: "Comic Sans MS, Comic Sans",
  },
  sectionTitle: {
    color: "#2E6F89",
    fontSize: "30px",
    fontWeight: "700",
    margin: "0 0 20px",
    fontFamily: "Impact, fantasy",
  },
  detailsBoxOuter: {
    backgroundColor: "#ffffff",
    padding: "0 0 30px 0",
    display: "flex",
    justifyContent: "center",
  },
  detailsBoxInner: {
    backgroundColor: "#E5F2F3",
    borderRadius: "28px",
    padding: "28px 24px 28px 24px",
    maxWidth: "95%",
    width: "100%",
    margin: "0 auto",
    border: "none",
    boxSizing: "border-box" as const,
  },
  boxTitle: {
    color: "#32325d",
    fontSize: "18px",
    fontWeight: "bold",
    margin: "0 0 15px",
  },
  subSectionTitle: {
    margin: "15px 0 10px",
    color: "#2E6F89",
    fontSize: "22px",
    fontWeight: "400",

    fontFamily: "Impact, fantasy",
  },
  paragraph: {
    color: "#32325d",
    fontSize: "16px",
    lineHeight: "24px",
    margin: "0 0 20px",
    fontFamily: "Comic Sans MS, Comic Sans",
  },
  detailLabel: {
    color: "#2E6F89",
    fontSize: "16px",
    fontWeight: "400",
    margin: "8px 0",
    fontFamily: "Impact, fantasy",
  },
  detailValue: {
    color: "#32325d",
    fontSize: "15px",
    margin: "8px 0",
    fontFamily: "Comic Sans MS, Comic Sans",
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
    backgroundColor: "#ffffff",
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
