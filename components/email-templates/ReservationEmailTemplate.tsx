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

interface SelectedDate {
  date: Date;
  numberOfParticipants: number;
}

interface Customer {
  _id?: string;
  selectedDates: SelectedDate[];
  total: number;
  billingInfo: CustomerBillingInfo;
}

interface ReservationTime {
  startTime?: string;
  endTime?: string;
}

interface ReservationDates {
  startDate?: Date;
  endDate?: Date;
}

interface Reservation {
  _id?: string;
  eventName: string;
  description?: string;
  dates: ReservationDates;
  time: ReservationTime;
  pricePerDayPerParticipant: number;
}

interface ReservationEmailTemplateProps {
  customer: Customer;
  reservation: Reservation;
}

export const ReservationEmailTemplate = ({
  customer,
  reservation,
}: ReservationEmailTemplateProps) => {
  // Format date for display
  const formatDate = (date: Date): string => {
    if (!date) return "Date to be announced";
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (timeObj: ReservationTime): string => {
    if (!timeObj) return "";

    let displayTime = "";
    const options: Intl.DateTimeFormatOptions = {
      hour: "numeric",
      minute: "numeric",
      hour12: true,
    };

    if (timeObj.startTime) {
      try {
        const startTime = new Date(`2000-01-01T${timeObj.startTime}:00`);
        if (!isNaN(startTime.getTime())) {
          displayTime += startTime.toLocaleTimeString("en-US", options);
        } else {
          displayTime += timeObj.startTime;
        }
      } catch {
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
          if (displayTime) displayTime += " - ";
          displayTime += timeObj.endTime;
        }
      } catch {
        if (displayTime) displayTime += " - ";
        displayTime += timeObj.endTime;
      }
    }

    return displayTime ? `${displayTime} ET` : "";
  };

  // Get date range display
  const getDateRangeDisplay = (): string => {
    if (!reservation.dates) return "Dates to be announced";

    const { startDate, endDate } = reservation.dates;
    if (!startDate) return "Dates to be announced";

    const start = new Date(startDate);
    const formattedStart = start.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    if (endDate) {
      const end = new Date(endDate);
      const formattedEnd = end.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
      return `${formattedStart} - ${formattedEnd}`;
    }

    return formattedStart;
  };

  // Calculate total participants
  const totalParticipants = customer.selectedDates.reduce(
    (sum, date) => sum + date.numberOfParticipants,
    0
  );

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
            RESERVATION CONFIRMATION
          </Heading>
        </div>
        <div style={{ textAlign: "left", ...styles.mainContentText }}>
          <Text style={styles.paragraph}>Thank you for your reservation!</Text>
          <Text style={styles.paragraph}>
            Hi {customer.billingInfo.firstName},
          </Text>
          <Text style={styles.paragraph}>
            We&apos;re excited to confirm your reservation for{" "}
            <strong>{reservation.eventName}</strong>. Your payment has been
            processed successfully, and your spots are now secured.
          </Text>
        </div>
      </Section>

      {/* Reservation Details */}
      <Section style={styles.detailsBoxOuter}>
        <div style={styles.detailsBoxInner}>
          <Heading as="h3" style={styles.boxTitle}>
            RESERVATION DETAILS
          </Heading>
          <div style={{ marginTop: 18 }}>
            <Row>
              <Column style={{ width: "120px" }}>
                <Text style={styles.detailLabel}>PROGRAM :</Text>
              </Column>
              <Column>
                <Text style={styles.detailValue}>{reservation.eventName}</Text>
              </Column>
            </Row>
            <Row>
              <Column style={{ width: "120px" }}>
                <Text style={styles.detailLabel}>DATE RANGE :</Text>
              </Column>
              <Column>
                <Text style={styles.detailValue}>{getDateRangeDisplay()}</Text>
              </Column>
            </Row>
            {reservation.time && formatTime(reservation.time) && (
              <Row>
                <Column style={{ width: "120px" }}>
                  <Text style={styles.detailLabel}>TIME :</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>
                    {formatTime(reservation.time)}
                  </Text>
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
            {reservation.description && (
              <Row>
                <Column style={{ width: "120px" }}>
                  <Text style={styles.detailLabel}>DESCRIPTION :</Text>
                </Column>
                <Column>
                  <Text style={styles.detailValue}>
                    {reservation.description}
                  </Text>
                </Column>
              </Row>
            )}
          </div>
        </div>
      </Section>

      {/* Selected Dates */}
      <Section style={styles.detailsBoxOuter}>
        <div style={styles.detailsBoxInner}>
          <Heading as="h3" style={styles.boxTitle}>
            YOUR SELECTED DATES
          </Heading>
          <div style={{ marginTop: 18 }}>
            {customer.selectedDates
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime()
              )
              .map((selectedDate, index) => (
                <Row key={index} style={{ marginBottom: 8 }}>
                  <Column style={{ width: "60%" }}>
                    <Text style={styles.detailValue}>
                      {formatDate(new Date(selectedDate.date))}
                    </Text>
                  </Column>
                  <Column>
                    <Text style={styles.detailValue}>
                      {selectedDate.numberOfParticipants}{" "}
                      {selectedDate.numberOfParticipants === 1
                        ? "participant"
                        : "participants"}
                    </Text>
                  </Column>
                </Row>
              ))}
            <Row style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid #cbd5e1" }}>
              <Column style={{ width: "60%" }}>
                <Text style={styles.detailLabel}>TOTAL DAYS :</Text>
              </Column>
              <Column>
                <Text style={styles.detailValue}>
                  {customer.selectedDates.length}
                </Text>
              </Column>
            </Row>
            <Row>
              <Column style={{ width: "60%" }}>
                <Text style={styles.detailLabel}>TOTAL PARTICIPANTS :</Text>
              </Column>
              <Column>
                <Text style={styles.detailValue}>{totalParticipants}</Text>
              </Column>
            </Row>
            <Row>
              <Column style={{ width: "60%" }}>
                <Text style={styles.detailLabel}>PRICE PER DAY/PERSON :</Text>
              </Column>
              <Column>
                <Text style={styles.detailValue}>
                  ${reservation.pricePerDayPerParticipant.toFixed(2)}
                </Text>
              </Column>
            </Row>
            <Row style={{ marginTop: 8 }}>
              <Column style={{ width: "60%" }}>
                <Text style={{ ...styles.detailLabel, fontSize: "18px" }}>
                  TOTAL AMOUNT :
                </Text>
              </Column>
              <Column>
                <Text style={{ ...styles.detailValue, fontSize: "18px", fontWeight: "bold" }}>
                  ${customer.total.toFixed(2)}
                </Text>
              </Column>
            </Row>
          </div>
        </div>
      </Section>

      {/* Footer */}
      <Section style={styles.footer}>
        <Text style={styles.footerText}>
          If you have any questions about your reservation, please don&apos;t
          hesitate to contact us.
        </Text>
        <Text style={styles.footerText}>
          Coastal Creations Studio
          <br />
          411 E 8th Street, Ocean City, NJ 08226
        </Text>
        <Text style={styles.footerText}>
          <Link
            href={`mailto:${process.env.STUDIO_EMAIL || "info@coastalcreationsstudio.com"}`}
            style={styles.footerLink}
          >
            {process.env.STUDIO_EMAIL || "info@coastalcreationsstudio.com"}
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

export default ReservationEmailTemplate;
