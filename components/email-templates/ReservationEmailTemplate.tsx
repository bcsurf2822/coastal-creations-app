import * as React from "react";
import { Text } from "@react-email/components";
import {
  EmailShell,
  InfoCard,
  DetailRow,
  CardText,
  emailText,
} from "./shared";

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
        displayTime += !isNaN(startTime.getTime())
          ? startTime.toLocaleTimeString("en-US", options)
          : timeObj.startTime;
      } catch {
        displayTime += timeObj.startTime;
      }
    }
    if (timeObj.endTime) {
      try {
        const endTime = new Date(`2000-01-01T${timeObj.endTime}:00`);
        if (displayTime) displayTime += " - ";
        displayTime += !isNaN(endTime.getTime())
          ? endTime.toLocaleTimeString("en-US", options)
          : timeObj.endTime;
      } catch {
        if (displayTime) displayTime += " - ";
        displayTime += timeObj.endTime;
      }
    }
    return displayTime ? `${displayTime} ET` : "";
  };

  const getDateRangeDisplay = (): string => {
    if (!reservation.dates?.startDate) return "Dates to be announced";
    const { startDate, endDate } = reservation.dates;
    const opts: Intl.DateTimeFormatOptions = {
      month: "short",
      day: "numeric",
      year: "numeric",
    };
    const formattedStart = new Date(startDate).toLocaleDateString("en-US", opts);
    if (endDate) {
      const formattedEnd = new Date(endDate).toLocaleDateString("en-US", opts);
      return `${formattedStart} - ${formattedEnd}`;
    }
    return formattedStart;
  };

  const totalParticipants = customer.selectedDates.reduce(
    (sum, date) => sum + date.numberOfParticipants,
    0
  );

  const sortedDates = [...customer.selectedDates].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  return (
    <EmailShell preview={`You're confirmed for ${reservation.eventName}`}>
      <Text style={emailText.badge}>✓ PAYMENT CONFIRMED</Text>
      <Text style={emailText.heroTitle}>Your reservation is confirmed</Text>
      <Text style={emailText.paragraph}>
        Hi {customer.billingInfo.firstName}, your payment was processed
        successfully and your spots for{" "}
        <strong>{reservation.eventName}</strong> are now secured.
      </Text>

      <InfoCard title="Reservation Details">
        <DetailRow label="Program">{reservation.eventName}</DetailRow>
        <DetailRow label="Date Range">{getDateRangeDisplay()}</DetailRow>
        {reservation.time && formatTime(reservation.time) && (
          <DetailRow label="Time">{formatTime(reservation.time)}</DetailRow>
        )}
        <DetailRow label="Location">
          Coastal Creations Studio
          <br />
          411 E 8th Street
          <br />
          Ocean City, NJ 08226
        </DetailRow>
        {reservation.description && (
          <DetailRow label="Description">{reservation.description}</DetailRow>
        )}
      </InfoCard>

      <InfoCard title="Your Selected Dates">
        {sortedDates.map((selectedDate, index) => (
          <CardText key={index}>
            {formatDate(new Date(selectedDate.date))} &middot;{" "}
            {selectedDate.numberOfParticipants}{" "}
            {selectedDate.numberOfParticipants === 1
              ? "participant"
              : "participants"}
          </CardText>
        ))}
      </InfoCard>

      <InfoCard title="Summary">
        <DetailRow label="Total Days">{customer.selectedDates.length}</DetailRow>
        <DetailRow label="Participants">{totalParticipants}</DetailRow>
        <DetailRow label="Per Day / Person">
          ${reservation.pricePerDayPerParticipant.toFixed(2)}
        </DetailRow>
        <DetailRow label="Total Paid">
          <span style={{ fontWeight: 700, fontSize: "17px" }}>
            ${customer.total.toFixed(2)}
          </span>
        </DetailRow>
      </InfoCard>
    </EmailShell>
  );
};

export default ReservationEmailTemplate;
