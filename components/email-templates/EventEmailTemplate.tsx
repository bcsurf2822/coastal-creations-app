import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  ReceiptButton,
  emailText,
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
interface EventEmailTemplateProps {
  customer: Customer;
  event: Event;
  /** Square-hosted receipt link for this payment, when available. */
  receiptUrl?: string;
}

const formatUsd = (n: number): string =>
  `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export const EventEmailTemplate = ({
  customer,
  event,
  receiptUrl,
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
    <EmailShell
      preview={`You're confirmed for ${getEventName()}`}
    >
      <Text style={emailText.badge}>✓ PAYMENT CONFIRMED</Text>
      <Text style={emailText.heroTitle}>You&apos;re all set!</Text>
      <Text style={emailText.paragraph}>
        Hi {customer.billingInfo.firstName}, thank you for registering. Your
        payment was processed successfully and your spot for{" "}
        <strong>{getEventName()}</strong> is now secured. We can&apos;t wait to
        create with you.
      </Text>

      <InfoCard title="Event Details">
        <DetailRow label="Event">{getEventName()}</DetailRow>
        <DetailRow label="Date">{getEventDate()}</DetailRow>
        {getEventTime() && <DetailRow label="Time">{getEventTime()}</DetailRow>}
        <DetailRow label="Location">
          Coastal Creations Studio
          <br />
          411 E 8th Street
          <br />
          Ocean City, NJ 08226
        </DetailRow>
        {event.description && (
          <DetailRow label="Description">{event.description}</DetailRow>
        )}
        {typeof customer.total === "number" && customer.total > 0 && (
          <DetailRow label="Amount Paid">{formatUsd(customer.total)}</DetailRow>
        )}
      </InfoCard>

      <ReceiptButton href={receiptUrl} />
    </EmailShell>
  );
};

export default EventEmailTemplate;
