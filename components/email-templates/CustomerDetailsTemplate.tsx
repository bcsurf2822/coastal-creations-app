import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  emailText,
  emailTheme,
} from "./shared";

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
interface CustomerDetailsTemplateProps {
  customer: Customer;
  event: Event;
}

export const CustomerDetailsTemplate = ({
  customer,
  event,
}: CustomerDetailsTemplateProps) => {
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
    return event.eventName || event.name || "Unnamed Event";
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
    <EmailShell preview={`New registration: ${getEventName()}`}>
      <Text style={emailText.heroTitle}>New customer registration</Text>
      <Text style={emailText.paragraph}>
        A new customer has registered for an event at Coastal Creations Studio.
      </Text>

      <InfoCard title="Event Information">
        <DetailRow label="Event">{getEventName()}</DetailRow>
        <DetailRow label="Date">{getEventDate()}</DetailRow>
        {getEventTime() && <DetailRow label="Time">{getEventTime()}</DetailRow>}
      </InfoCard>

      <InfoCard title="Customer Information">
        <DetailRow label="Name">
          {customer.billingInfo.firstName} {customer.billingInfo.lastName}
        </DetailRow>
        {customer.billingInfo.emailAddress && (
          <DetailRow label="Email">
            {customer.billingInfo.emailAddress}
          </DetailRow>
        )}
        {customer.billingInfo.phoneNumber && (
          <DetailRow label="Phone">
            {customer.billingInfo.phoneNumber}
          </DetailRow>
        )}
        <DetailRow label="Address">
          {customer.billingInfo.addressLine1}
          {customer.billingInfo.addressLine2 && (
            <>
              <br />
              {customer.billingInfo.addressLine2}
            </>
          )}
          <br />
          {customer.billingInfo.city}, {customer.billingInfo.stateProvince}{" "}
          {customer.billingInfo.postalCode}
          <br />
          {customer.billingInfo.country}
        </DetailRow>
      </InfoCard>

      <InfoCard title="Registration Details">
        <DetailRow label="Participants">{customer.quantity}</DetailRow>
        <DetailRow label="Total Paid">
          {formatCurrency(customer.total)}
        </DetailRow>
      </InfoCard>

      {customer.participants && customer.participants.length > 0 && (
        <InfoCard title="Participant Information">
          {customer.participants.map(
            (participant: Participant, index: number) => (
              <DetailRow key={index} label={`#${index + 1}`}>
                {participant.firstName} {participant.lastName}
                {participant.selectedOptions &&
                  participant.selectedOptions.length > 0 && (
                    <>
                      <br />
                      <span style={subText}>
                        {participant.selectedOptions
                          .map(
                            (opt: ParticipantOption) =>
                              `${opt.categoryName}: ${opt.choiceName}`
                          )
                          .join(", ")}
                      </span>
                    </>
                  )}
              </DetailRow>
            )
          )}
        </InfoCard>
      )}

      {customer.selectedOptions && customer.selectedOptions.length > 0 && (
        <InfoCard title="Selected Options">
          {customer.selectedOptions.map(
            (option: ParticipantOption, index: number) => (
              <DetailRow key={index} label={option.categoryName}>
                {option.choiceName}
              </DetailRow>
            )
          )}
        </InfoCard>
      )}

      <Text style={emailText.subParagraph}>
        Recorded on {new Date().toLocaleDateString()} at{" "}
        {new Date().toLocaleTimeString()}. View all registrations in your admin
        dashboard.
      </Text>
    </EmailShell>
  );
};

const subText = {
  color: emailTheme.colors.muted,
  fontSize: "13px",
  lineHeight: "20px",
};

export default CustomerDetailsTemplate;
