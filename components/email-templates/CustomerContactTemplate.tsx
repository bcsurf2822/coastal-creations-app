import * as React from "react";
import {
  Html,
  Section,
  Row,
  Column,
  Heading,
  Text,
} from "@react-email/components";

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
  <Html lang="en" dir="ltr">
    <Section style={styles.header}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      ></div>
    </Section>

    <Section style={styles.mainContent}>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <Heading as="h2" style={styles.sectionTitle}>
          NEW CONTACT MESSAGE
        </Heading>
      </div>
      <div style={{ textAlign: "left", ...styles.mainContentText }}></div>
    </Section>

    <Section style={styles.detailsBoxOuter}>
      <div style={styles.detailsBoxInner}>
        <Heading as="h3" style={styles.boxTitle}>
          CONTACT INFORMATION
        </Heading>
        <div style={{ marginTop: 18 }}>
          <Row>
            <Column style={{ width: "120px" }}>
              <Text style={styles.detailLabel}>NAME :</Text>
            </Column>
            <Column>
              <Text style={styles.detailValue}>{name}</Text>
            </Column>
          </Row>
          <Row>
            <Column style={{ width: "120px" }}>
              <Text style={styles.detailLabel}>EMAIL :</Text>
            </Column>
            <Column>
              <Text style={styles.detailValue}>{email}</Text>
            </Column>
          </Row>
          {phone && (
            <Row>
              <Column style={{ width: "120px" }}>
                <Text style={styles.detailLabel}>PHONE :</Text>
              </Column>
              <Column>
                <Text style={styles.detailValue}>{phone}</Text>
              </Column>
            </Row>
          )}
          <Row>
            <Column style={{ width: "120px" }}>
              <Text style={styles.detailLabel}>SUBJECT :</Text>
            </Column>
            <Column>
              <Text style={styles.detailValue}>{subject}</Text>
            </Column>
          </Row>
        </div>
      </div>
    </Section>

    <Section style={styles.detailsBoxOuter}>
      <div style={styles.detailsBoxInner}>
        <Heading as="h3" style={styles.boxTitle}>
          MESSAGE
        </Heading>
        <div style={{ marginTop: 18 }}>
          <Text style={styles.messageText}>{description}</Text>
        </div>
      </div>
    </Section>
  </Html>
);

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
  messageText: {
    color: "#32325d",
    fontSize: "15px",
    lineHeight: "22px",
    margin: "0",
    fontFamily: "Comic Sans MS, Comic Sans",
    whiteSpace: "pre-wrap" as const,
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

export default CustomerContactTemplate;
